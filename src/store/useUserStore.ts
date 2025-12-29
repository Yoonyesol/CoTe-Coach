import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'BOJ' | 'PROG' | 'LC' | 'SWEA';

export interface StudyPlan {
    targetTier: string;
    targetDate: string; // ISO String
    dailyIntensity: 'LOW' | 'NORMAL' | 'HIGH';
    problemCount: number;
}

export interface StudyLog {
    id: string;
    problemId: string;
    platform: Platform;
    difficulty: string;
    perceivedDifficulty: 'EASY' | 'NORMAL' | 'HARD';
    elapsedTime: number; // ms
    feeling: string;
    concepts: string[];
    completedAt: string; // ISO String
}

export interface ShopItem {
    id: string;
    name: string;
    price: number;
    category: 'CLOTHES' | 'FURNITURE' | 'DECO';
    emoji: string;
}

interface TimerState {
    isRunning: boolean;
    startTime: number | null;
    currentProblemId: string | null;
    problemTimers: Record<string, number>; // { [problemId]: totalMs }
}

interface UserState {
    xp: number;
    level: number;
    points: number;
    tier: string;
    bojHandle: string;
    studyPlan: StudyPlan;
    timer: TimerState;
    studyLogs: StudyLog[];
    inventory: string[]; // Item IDs
    equippedItems: string[]; // Item IDs

    // Actions
    addXp: (amount: number) => void;
    addPoints: (amount: number) => void;
    setBojHandle: (handle: string) => void;
    setStudyPlan: (plan: Partial<StudyPlan>) => void;
    calculateTier: (level: number) => string;
    syncSolvedAcTier: (tier: number) => void;
    linkBojAccount: (handle: string, tier: number) => void;
    unlinkBojAccount: () => void;

    // Study Log Actions
    addStudyLog: (log: Omit<StudyLog, 'id' | 'completedAt'>) => void;

    // Timer Actions
    startTimer: (problemId: string) => boolean; // Returns false if another is running
    stopTimer: () => void;
    resetTimer: (problemId?: string) => void;
    getTotalElapsed: (problemId: string) => number;

    // Daily Planner Helpers (Derived State)
    getDailyProgress: () => { solved: number; goal: number };
    getDaysRemaining: () => number;

    // Shop Actions
    buyItem: (item: ShopItem) => boolean;
    toggleEquip: (itemId: string) => void;
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
            tier: 'Iron 1',
            bojHandle: '',
            studyPlan: {
                targetTier: 'Gold 1',
                targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30일 뒤
                dailyIntensity: 'NORMAL',
                problemCount: 4,
            },
            timer: {
                isRunning: false,
                startTime: null,
                currentProblemId: null,
                problemTimers: {},
            },
            studyLogs: [],
            inventory: [],
            equippedItems: [],

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

            setBojHandle: (handle: string) => set({ bojHandle: handle }),

            setStudyPlan: (plan) => set((state) => ({
                studyPlan: { ...state.studyPlan, ...plan }
            })),

            calculateTier: (level) => {
                // Eased Tier Distribution (User-Friendly)

                // Lv 1-3: Iron (입문 구간 확대)
                if (level <= 3) return `Iron ${level}`;

                // Lv 4-8: Bronze (5레벨)
                if (level <= 8) return `Bronze ${level - 3}`;

                // Lv 9-18: Silver (10레벨 - 더 쉽게!)
                if (level <= 18) return `Silver ${level - 8}`;

                // Lv 19-28: Gold (10레벨 - 더 쉽게!)
                if (level <= 28) return `Gold ${level - 18}`;

                // Lv 29-35: Platinum (7레벨 - 완화)
                if (level <= 35) return `Platinum ${level - 28}`;

                // Lv 36-38: Diamond (3레벨)
                if (level <= 38) return `Diamond ${level - 35}`;

                // Lv 39-40: Master (2레벨)
                if (level <= 40) return `Master ${level - 38}`;

                // Lv 41: Grandmaster (1레벨)
                if (level <= 41) return `Grandmaster ${level - 40}`;

                // Lv 42+: Challenger (전설)
                return `Challenger ${level - 41}`;
            },

            syncSolvedAcTier: (tier) => {
                const currentLevel = get().level;
                // solved.ac tier mapping: 1 (Bronze 5) ~ 31 (Master)
                // We map tier T to level T (1-based), ensuring minimum level is 1
                const targetLevel = Math.max(1, tier);

                if (targetLevel > currentLevel) {
                    const targetXp = (targetLevel - 1) * 100;
                    const nextTier = get().calculateTier(targetLevel);

                    set({
                        level: targetLevel,
                        xp: targetXp,
                        tier: nextTier
                    });
                }
            },

            linkBojAccount: (handle, tier) => {
                const currentLevel = get().level;
                const bojLevel = Math.max(1, Number(tier) || 0);

                // 합산 로직: (현재 앱 레벨 - 1)은 순수 활동량(Delta)
                // 최종 레벨 = 백준 베이스 + 활동량
                const activityDelta = Math.max(0, currentLevel - 1);
                const targetLevel = bojLevel + activityDelta;

                const nextTierName = get().calculateTier(targetLevel);
                const targetXp = (targetLevel - 1) * 100;

                set({
                    bojHandle: handle,
                    level: targetLevel,
                    xp: targetXp,
                    tier: nextTierName
                });
            },

            unlinkBojAccount: () => {
                set({
                    bojHandle: '',
                    level: 1,
                    xp: 0,
                    tier: get().calculateTier(1), // Reset to Iron 1
                });
            },

            addStudyLog: (logData) => {
                const newLog: StudyLog = {
                    ...logData,
                    id: Math.random().toString(36).substr(2, 9),
                    completedAt: new Date().toISOString(),
                };

                // XP 보너스 계산: 기본 XP + 복습 로그 작성 보너스 (+10)
                const baseXP = calculateEarnedXp(logData.platform, logData.difficulty);
                const bonusXP = 10;

                get().addXp(baseXP + bonusXP);
                get().addPoints(baseXP * 10); // 포인트 지급 로직 (XP의 10배 예시)

                set((state) => {
                    const nextTimers = { ...state.timer.problemTimers };
                    delete nextTimers[logData.problemId]; // 로그 제출 후 해당 문제 타이머 초기화

                    return {
                        studyLogs: [newLog, ...state.studyLogs],
                        timer: {
                            ...state.timer,
                            problemTimers: nextTimers
                        }
                    };
                });
            },

            startTimer: (problemId) => {
                const { timer } = get();

                // 이미 다른 문제가 진행 중인 경우 거절
                if (timer.isRunning && timer.currentProblemId !== problemId) {
                    return false;
                }

                set((state) => ({
                    timer: {
                        ...state.timer,
                        isRunning: true,
                        startTime: Date.now(),
                        currentProblemId: problemId,
                    }
                }));
                return true;
            },

            stopTimer: () => {
                const { timer } = get();
                if (!timer.isRunning || !timer.currentProblemId || !timer.startTime) return;

                const delta = Date.now() - timer.startTime;
                set((state) => ({
                    timer: {
                        ...state.timer,
                        isRunning: false,
                        startTime: null,
                        problemTimers: {
                            ...state.timer.problemTimers,
                            [timer.currentProblemId!]: (state.timer.problemTimers[timer.currentProblemId!] || 0) + delta
                        }
                    }
                }));
            },

            resetTimer: (problemId) => {
                const { timer } = get();
                const id = problemId || timer.currentProblemId;
                if (!id) return;

                set((state) => {
                    const nextTimers = { ...state.timer.problemTimers };
                    delete nextTimers[id];

                    return {
                        timer: {
                            ...state.timer,
                            isRunning: state.timer.currentProblemId === id ? false : state.timer.isRunning,
                            startTime: state.timer.currentProblemId === id ? null : state.timer.startTime,
                            currentProblemId: state.timer.currentProblemId === id ? null : state.timer.currentProblemId,
                            problemTimers: nextTimers
                        }
                    };
                });
            },

            getTotalElapsed: (problemId) => {
                const { timer } = get();
                // 하이드레이션 문제나 기존 데이터 호환성을 위해 defensive check 추가
                const problemTimers = timer.problemTimers || {};
                const stored = problemTimers[problemId] || 0;

                if (timer.isRunning && timer.currentProblemId === problemId && timer.startTime) {
                    return stored + (Date.now() - timer.startTime);
                }
                return stored;
            },

            getDailyProgress: () => {
                const { studyLogs, studyPlan } = get();
                const today = new Date().toISOString().split('T')[0];

                const solvedToday = studyLogs.filter(log =>
                    log.completedAt.startsWith(today)
                ).length;

                return {
                    solved: solvedToday,
                    goal: studyPlan.problemCount
                };
            },

            getDaysRemaining: () => {
                const { studyPlan } = get();
                const target = new Date(studyPlan.targetDate).getTime();
                const today = new Date().setHours(0, 0, 0, 0);

                const diffTime = target - today;
                return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            },

            buyItem: (item) => {
                const { points, inventory } = get();
                if (points < item.price || inventory.includes(item.id)) return false;

                set((state) => ({
                    points: state.points - item.price,
                    inventory: [...state.inventory, item.id]
                }));
                return true;
            },

            toggleEquip: (itemId) => {
                set((state) => {
                    const isEquipped = state.equippedItems.includes(itemId);
                    return {
                        equippedItems: isEquipped
                            ? state.equippedItems.filter(id => id !== itemId)
                            : [...state.equippedItems, itemId]
                    };
                });
            }
        }),
        {
            name: 'cote-coach-user-storage',
            version: 4, // 상점 및 인벤토리 추가
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as UserState;

                if (version < 2) {
                    if (state.timer && !state.timer.problemTimers) {
                        state.timer.problemTimers = {};
                    }
                }

                if (version < 3) {
                    if (!state.studyLogs) {
                        state.studyLogs = [];
                    }
                }

                if (version < 4) {
                    if (!state.inventory) state.inventory = [];
                    if (!state.equippedItems) state.equippedItems = [];
                }

                return state;
            }
        }
    )
);

/**
 * 문제 난이도와 플랫폼을 받아 획득할 XP를 계산합니다.
 */
export const calculateEarnedXp = (platform: Platform, difficulty: string): number => {
    // 플랫폼이 매핑에 없는 경우 방어 (런타임 에러 방지)
    const platformMap = XP_MAP[platform];
    if (!platformMap) return 10; // 기본 XP 반환

    // 백준의 경우 숫자로 들어올 수 있으므로 매핑 필요 (1-5: Bronze, 6-10: Silver, 11-15: Gold ...)
    if (platform === 'BOJ') {
        const lv = parseInt(difficulty);
        if (!isNaN(lv)) {
            if (lv <= 5) return XP_MAP.BOJ.Bronze;
            if (lv <= 10) return XP_MAP.BOJ.Silver;
            if (lv <= 15) return XP_MAP.BOJ.Gold;
            if (lv <= 20) return XP_MAP.BOJ.Platinum;
            if (lv <= 25) return XP_MAP.BOJ.Diamond;
            return XP_MAP.BOJ.Ruby;
        }

        // Tier Name으로 들어온 경우 (예: "Gold 3")
        const tierBase = difficulty.split(' ')[0];
        return XP_MAP.BOJ[tierBase] || 10;
    }

    return platformMap[difficulty] || 10;
};
