import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'BOJ' | 'PROG' | 'LC' | 'SWEA';

interface UserState {
    xp: number;
    level: number;
    points: number;
    tier: string;
    bojHandle: string;

    // Actions
    addXp: (amount: number) => void;
    addPoints: (amount: number) => void;
    setBojHandle: (handle: string) => void;
    calculateTier: (level: number) => string;
}

// XP Mapping Constants
export const XP_MAP: Record<Platform, Record<string, number>> = {
    BOJ: {
        'Bronze': 2,
        'Silver': 10,
        'Gold': 30,
        'Platinum': 70,
        'Diamond': 150,
        'Ruby': 300,
    },
    PROG: {
        '0': 2,
        '1': 10,
        '2': 25,
        '3': 50,
        '4': 100,
        '5': 200,
    },
    LC: {
        'Easy': 10,
        'Medium': 35,
        'Hard': 100,
    },
    SWEA: {
        'D1': 2,
        'D2': 5,
        'D3': 15,
        'D4': 30,
        'D5': 60,
        'D6': 100,
    }
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            points: 0,
            tier: 'Novice I',
            bojHandle: '',

            addXp: (amount) => {
                const nextXp = get().xp + amount;
                const nextLevel = Math.floor(nextXp / 100) + 1;
                const nextTier = get().calculateTier(nextLevel);

                set({
                    xp: nextXp,
                    level: nextLevel,
                    tier: nextTier
                });
            },

            addPoints: (amount) => set((state) => ({ points: state.points + amount })),

            setBojHandle: (handle) => set({ bojHandle: handle }),

            calculateTier: (level) => {
                if (level <= 10) return `Novice ${level}`;
                if (level <= 20) return `Challenger ${level - 10}`;
                if (level <= 30) return `Solver ${level - 20}`;
                if (level <= 40) return `Master ${level - 30}`;
                return `Legend ${level - 40}`;
            },
        }),
        {
            name: 'cote-coach-user-storage',
        }
    )
);

/**
 * 문제 난이도와 플랫폼을 받아 획득할 XP를 계산합니다.
 */
export const calculateEarnedXp = (platform: Platform, difficulty: string): number => {
    // 백준의 경우 숫자로 들어올 수 있으므로 매핑 필요 (1-5: Bronze, 6-10: Silver, 11-15: Gold ...)
    if (platform === 'BOJ') {
        const lv = parseInt(difficulty);
        if (lv <= 5) return XP_MAP.BOJ.Bronze;
        if (lv <= 10) return XP_MAP.BOJ.Silver;
        if (lv <= 15) return XP_MAP.BOJ.Gold;
        if (lv <= 20) return XP_MAP.BOJ.Platinum;
        if (lv <= 25) return XP_MAP.BOJ.Diamond;
        return XP_MAP.BOJ.Ruby;
    }

    return XP_MAP[platform][difficulty] || 0;
};
