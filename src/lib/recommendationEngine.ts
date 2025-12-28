import { searchSolvedAcProblems, SolvedAcProblem } from '../api/solvedac';

export type RecommendationType = 'WARM_UP' | 'MAIN' | 'CHALLENGE';

export interface RecommendedProblem {
    type: RecommendationType;
    title: string;
    platform: string;
    difficulty: string;
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
    options: { handle?: string | null; problemCount?: number } = {}
): Promise<RecommendedProblem[]> => {
    const { handle, problemCount = 4 } = options;
    const baseLevel = Math.min(userLevel, 30);

    const warmUpLevel = Math.max(baseLevel - 1, 1);
    const mainLevel = baseLevel;
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

    // API 호출 병렬화로 속도 개선
    const [warmUpRes, mainRes, challengeRes] = await Promise.all([
        counts.warmUp > 0 ? searchSolvedAcProblems(`tier:${warmUpLevel}${handleFilter}`, counts.warmUp) : { items: [] },
        counts.main > 0 ? searchSolvedAcProblems(`tier:${mainLevel}${handleFilter}`, counts.main) : { items: [] },
        counts.challenge > 0 ? searchSolvedAcProblems(`tier:${challengeLevel}${handleFilter}`, counts.challenge) : { items: [] },
    ]);

    const selectRandom = (items: SolvedAcProblem[], count: number) => {
        return [...items].sort(() => 0.5 - Math.random()).slice(0, count);
    };

    const results: RecommendedProblem[] = [];

    // 워밍업
    selectRandom(warmUpRes.items, counts.warmUp).forEach(p => {
        results.push({
            type: 'WARM_UP',
            title: p.titleKo,
            platform: 'BOJ',
            difficulty: levelToTierName(p.level),
            tags: p.tags.slice(0, 2).map(t => t.name),
            problemUrl: `https://www.acmicpc.net/problem/${p.problemId}`
        });
    });

    // 메인 공략
    selectRandom(mainRes.items, counts.main).forEach(p => {
        results.push({
            type: 'MAIN',
            title: p.titleKo,
            platform: 'BOJ',
            difficulty: levelToTierName(p.level),
            tags: p.tags.slice(0, 2).map(t => t.name),
            problemUrl: `https://www.acmicpc.net/problem/${p.problemId}`
        });
    });

    // 챌린지
    selectRandom(challengeRes.items, counts.challenge).forEach(p => {
        results.push({
            type: 'CHALLENGE',
            title: p.titleKo,
            platform: 'BOJ',
            difficulty: levelToTierName(p.level),
            tags: p.tags.slice(0, 2).map(t => t.name),
            problemUrl: `https://www.acmicpc.net/problem/${p.problemId}`
        });
    });

    return results;
};
