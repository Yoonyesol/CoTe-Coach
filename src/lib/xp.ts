import { Platform } from '../types/user';

// Solved.ac Style Rating Mapping (1 ~ 30 Points)
export const XP_MAP: Record<Platform, Record<string, number>> = {
    BOJ: {
        'Bronze': 1,
        'Silver': 6,
        'Gold': 11,
        'Platinum': 16,
        'Diamond': 21,
        'Ruby': 26,
    },
    PROG: {
        '0': 1,
        '1': 4,
        '2': 10,
        '3': 18,
        '4': 25,
        '5': 30,
    },
    LC: {
        'Easy': 5,
        'Medium': 13,
        'Hard': 25,
    },
    SWEA: {
        'D1': 1,
        'D2': 3,
        'D3': 8,
        'D4': 15,
        'D5': 23,
        'D6': 30,
    }
};

const DIFFICULTY_LEVEL_MAP: Record<string, number> = {
    'Lv.0': 1, 'Lv.1': 4, 'Lv.2': 10, 'Lv.3': 20, 'Lv.4': 30, 'Lv.5': 42,
    'Easy': 5, 'Medium': 18, 'Hard': 35,
    'D1': 1, 'D2': 5, 'D3': 12, 'D4': 22, 'D5': 32, 'D6': 42,
    'Bronze': 3, 'Silver': 12, 'Gold': 22, 'Platinum': 32, 'Diamond': 40, 'Ruby': 45
};

export const calculateEarnedXp = (platform: Platform, difficulty: string, userLevel: number = 1): number => {
    let baseXp = 10;
    let problemLevel = 1;
    const platformMap = XP_MAP[platform];
    if (platformMap) {
        if (platform === 'BOJ') {
            const lv = parseInt(difficulty);
            if (!isNaN(lv)) {
                if (lv <= 5) baseXp = XP_MAP.BOJ.Bronze;
                else if (lv <= 10) baseXp = XP_MAP.BOJ.Silver;
                else if (lv <= 15) baseXp = XP_MAP.BOJ.Gold;
                else if (lv <= 20) baseXp = XP_MAP.BOJ.Platinum;
                else if (lv <= 25) baseXp = XP_MAP.BOJ.Diamond;
                else baseXp = XP_MAP.BOJ.Ruby;
                problemLevel = Math.max(1, (lv - 1) * 2);
            } else {
                const tierBase = difficulty.split(' ')[0];
                baseXp = XP_MAP.BOJ[tierBase] || 10;
                problemLevel = DIFFICULTY_LEVEL_MAP[tierBase] || 10;
            }
        } else {
            // @ts-ignore
            baseXp = platformMap[difficulty] || 10;
            problemLevel = DIFFICULTY_LEVEL_MAP[difficulty] || 10;
        }
    }
    const gap = problemLevel - userLevel;
    let multiplier = gap > 0 ? 1 + (gap * 0.1) : Math.pow(0.9, Math.abs(gap));
    return Math.max(1, Math.floor(baseXp * multiplier));
};
