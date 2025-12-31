import { searchSolvedAcProblems } from '../api/solvedac';
import { SolvedAcProblem, RecommendedProblem } from '../types/problem';
import { Platform } from '../types/user';
import { getProgrammersProblems, getSweaProblems, mapToUniversalFormat } from '../api/staticProblems';

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
        focusAlgorithms?: string[];
        platforms?: Platform[];
    } = {}
): Promise<RecommendedProblem[]> => {
    const {
        handle,
        problemCount = 4,
        difficultyAdjustment = 'NORMAL',
        seedOffset = 0,
        focusAlgorithms = [],
        platforms = ['BOJ']
    } = options;

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

    // 알고리즘 필터 생성 (예: tag:dp|tag:greedy)
    const algorithmFilter = focusAlgorithms.length > 0
        ? ` (${focusAlgorithms.map(tag => `tag:${tag}`).join('|')})`
        : '';

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

    // --- Multi-Platform Quota Distribution ---
    // Distribute the requested counts across selected platforms
    const getProblemsForPlatform = async (p: Platform, targetCount: { warmUp: number, main: number, challenge: number }) => {
        if (p === 'BOJ') {
            const [warmUpRes, mainRes, challengeRes] = await Promise.all([
                targetCount.warmUp > 0 ? searchSolvedAcProblems(`tier:${warmUpLevel}${handleFilter}`, 1) : { items: [] },
                targetCount.main > 0 ? searchSolvedAcProblems(`${mainQuery}${handleFilter}${algorithmFilter}`, 1) : { items: [] },
                targetCount.challenge > 0 ? searchSolvedAcProblems(`tier:${challengeLevel}${handleFilter}${algorithmFilter}`, 1) : { items: [] },
            ]);
            return {
                warmUp: warmUpRes.items,
                main: mainRes.items,
                challenge: challengeRes.items
            };
        }

        if (p === 'PROG') {
            // Mapping: floor((level-1)/5)
            const progLv = Math.floor((baseLevel - 1) / 5);
            const warmUpLv = Math.max(0, progLv - 1);
            const challengeLv = Math.min(5, progLv + 1);

            return {
                warmUp: getProgrammersProblems(warmUpLv).map(p => mapToUniversalFormat(p, 'PROG')),
                main: getProgrammersProblems(progLv).map(p => mapToUniversalFormat(p, 'PROG')),
                challenge: getProgrammersProblems(challengeLv).map(p => mapToUniversalFormat(p, 'PROG'))
            };
        }

        if (p === 'SWEA') {
            const sweaIdx = Math.floor((baseLevel - 1) / 5) + 1; // 1-6
            const warmUpIdx = Math.max(1, sweaIdx - 1);
            const challengeIdx = Math.min(6, sweaIdx + 1);

            return {
                warmUp: getSweaProblems(`D${warmUpIdx}`).map(p => mapToUniversalFormat(p, 'SWEA')),
                main: getSweaProblems(`D${sweaIdx}`).map(p => mapToUniversalFormat(p, 'SWEA')),
                challenge: getSweaProblems(`D${challengeIdx}`).map(p => mapToUniversalFormat(p, 'SWEA'))
            };
        }

        return { warmUp: [], main: [], challenge: [] };
    };

    const results: RecommendedProblem[] = [];

    // Fetch from all platforms in parallel
    const platformData = await Promise.all(platforms.map(p => getProblemsForPlatform(p, counts)));

    // Merge & Select (Round-robin or balanced distribution)
    const mergeAndSelect = (type: 'WARM_UP' | 'MAIN' | 'CHALLENGE', targetTotal: number) => {
        const pool: { p: SolvedAcProblem, platform: Platform }[] = [];
        platforms.forEach((p, idx) => {
            const items = type === 'WARM_UP' ? platformData[idx].warmUp :
                type === 'MAIN' ? platformData[idx].main :
                    platformData[idx].challenge;

            items.forEach(item => pool.push({ p: item, platform: p }));
        });

        if (pool.length === 0) return;

        // Shuffle the whole pool and select targetTotal
        const shuffled = selectRandom(pool.map(entry => entry.p), targetTotal, `${dateSeed}-${type}`);

        shuffled.forEach(p => {
            // Find which platform this problem belongs to for correct icon/url
            const entry = pool.find(e => e.p.problemId === p.problemId && e.p.titleKo === p.titleKo);
            const platform = entry?.platform || 'BOJ';

            results.push({
                type,
                title: p.titleKo,
                platform: platform,
                difficulty: platform === 'BOJ' ? levelToTierName(p.level) :
                    platform === 'PROG' ? `Lv.${p.level}` :
                        platform === 'SWEA' ? `D${p.level}` : String(p.level),
                level: p.level,
                tags: platform === 'BOJ' ? p.tags.slice(0, 2).map(t => t.displayNames?.[0]?.name || t.key) : [platform],
                problemUrl: platform === 'BOJ' ? `https://www.acmicpc.net/problem/${p.problemId}` :
                    (p as any).problemUrl || '#' // Static problems have stored URLs in Universal format if we map them
            });
        });
    };

    // Correcting mapToUniversalFormat to include problemUrl
    // Wait, I need to update mapToUniversalFormat in staticProblems.ts too.

    mergeAndSelect('WARM_UP', counts.warmUp);
    mergeAndSelect('MAIN', counts.main);
    mergeAndSelect('CHALLENGE', counts.challenge);

    return results;
};
