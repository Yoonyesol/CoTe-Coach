import { searchSolvedAcProblems, SolvedAcProblem } from '../api/solvedac';

export type RecommendationType = 'WARM_UP' | 'MAIN' | 'CHALLENGE';

export interface RecommendedProblem {
    type: RecommendationType;
    title: string;
    platform: string;
    difficulty: string;
    level: number; // Added: Raw Solved.ac level for UI clarity
    tags: string[];
    problemUrl: string;
}

/**
 * Solved.ac 레벨(1~30)을 티어 이름으로 변환
 */
const levelToTierName = (level: number): string => {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'];
    const tierIdx = Math.floor((level - 1) / 5);
    const subTier = 5 - ((level - 1) % 5);
    return `${tiers[tierIdx]} ${subTier}`;
};

/**
 * 하이브리드 추천 로직
 * @param userLevel 현재 사용자의 서비스 레벨 (1~100)
 * @param options 설정값 (핸들, 목표 문제 수 등)
 */
export const getRecommendations = async (
    userLevel: number,
    options: {
        handle?: string | null;
        problemCount?: number;
        difficultyAdjustment?: 'EASY' | 'NORMAL' | 'HARD';
        seedOffset?: number;
    } = {}
): Promise<RecommendedProblem[]> => {
    const { handle, problemCount = 4, difficultyAdjustment = 'NORMAL', seedOffset = 0 } = options;

    // Create a stable seed for the day + Offset for manual refresh
    // Using separators to avoid ID collisions
    const today = new Date();
    const dateSeed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${handle || 'guest'}-${seedOffset}`;

    const selectRandom = (items: SolvedAcProblem[], count: number, seed: string) => {
        // Robust seed-based pseudo-random generator (MurmurHash3-like)
        const getSeededRandom = (s: string) => {
            let h = 0;
            for (let i = 0; i < s.length; i++) {
                h = Math.imul(31, h) + s.charCodeAt(i) | 0;
            }
            return () => {
                h = Math.imul(h ^ h >>> 16, 2246822507);
                h = Math.imul(h ^ h >>> 13, 3266489909);
                return (h ^= h >>> 16) >>> 0;
            };
        };

        const random = getSeededRandom(seed);
        // Fisher-Yates shuffle using seeded random
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = random() % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    };

    // 난이도 보정치 적용 (EASY: -2, NORMAL: 0, HARD: +1)
    let baseLevel = Math.min(userLevel, 30);
    if (difficultyAdjustment === 'EASY') baseLevel = Math.max(1, baseLevel - 2);
    else if (difficultyAdjustment === 'HARD') baseLevel = Math.min(30, baseLevel + 1);

    const warmUpLevel = Math.max(baseLevel - 2, 1);
    const mainQuery = `tier:${Math.max(baseLevel - 1, 1)}..${Math.min(baseLevel + 1, 30)}`;
    const challengeLevel = Math.min(baseLevel + 2, 30);

    const handleFilter = handle ? ` -solved_by:${handle}` : '';

    // 배분 로직: 전체 개수에 따라 워밍업/메인/챌린지 비율 조절
    // 예: 4개 -> 1/2/1, 6개 -> 1/4/1, 2개 -> 1/1/0
    let counts = { warmUp: 1, main: 2, challenge: 1 };

    if (problemCount <= 2) {
        counts = { warmUp: 1, main: 1, challenge: 0 };
    } else if (problemCount === 3) {
        counts = { warmUp: 1, main: 1, challenge: 1 };
    } else {
        counts.main = problemCount - counts.warmUp - counts.challenge;
    }

    // API 호출 병렬화로 속도 개선 (페이지 1에서 후보 50개를 가져옴)
    const [warmUpRes, mainRes, challengeRes] = await Promise.all([
        counts.warmUp > 0 ? searchSolvedAcProblems(`tier:${warmUpLevel}${handleFilter}`, 1) : { items: [] },
        counts.main > 0 ? searchSolvedAcProblems(`${mainQuery}${handleFilter}`, 1) : { items: [] },
        counts.challenge > 0 ? searchSolvedAcProblems(`tier:${challengeLevel}${handleFilter}`, 1) : { items: [] },
    ]);

    const results: RecommendedProblem[] = [];

    // 워밍업
    selectRandom(warmUpRes.items, counts.warmUp, dateSeed).forEach(p => {
        results.push({
            type: 'WARM_UP',
            title: p.titleKo,
            platform: 'BOJ',
            difficulty: levelToTierName(p.level),
            level: p.level,
            tags: p.tags.slice(0, 2).map(t => t.displayNames?.[0]?.name || t.key),
            problemUrl: `https://www.acmicpc.net/problem/${p.problemId}`
        });
    });

    // 메인 공략
    selectRandom(mainRes.items, counts.main, dateSeed).forEach(p => {
        results.push({
            type: 'MAIN',
            title: p.titleKo,
            platform: 'BOJ',
            difficulty: levelToTierName(p.level),
            level: p.level,
            tags: p.tags.slice(0, 2).map(t => t.displayNames?.[0]?.name || t.key),
            problemUrl: `https://www.acmicpc.net/problem/${p.problemId}`
        });
    });

    // 챌린지
    selectRandom(challengeRes.items, counts.challenge, dateSeed).forEach(p => {
        results.push({
            type: 'CHALLENGE',
            title: p.titleKo,
            platform: 'BOJ',
            difficulty: levelToTierName(p.level),
            level: p.level,
            tags: p.tags.slice(0, 2).map(t => t.displayNames?.[0]?.name || t.key),
            problemUrl: `https://www.acmicpc.net/problem/${p.problemId}`
        });
    });

    return results;
};
