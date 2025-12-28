import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Platform = 'BOJ' | 'PROG' | 'LC' | 'SWEA';

export interface StudyPlan {
    targetTier: string;
    targetDate: string; // ISO String
    dailyIntensity: 'LOW' | 'NORMAL' | 'HIGH';
    problemCount: number;
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

    // Actions
    addXp: (amount: number) => void;
    addPoints: (amount: number) => void;
    setBojHandle: (handle: string) => void;
    setStudyPlan: (plan: Partial<StudyPlan>) => void;
    calculateTier: (level: number) => string;

    // Timer Actions
    startTimer: (problemId: string) => boolean; // Returns false if another is running
    stopTimer: () => void;
    resetTimer: (problemId?: string) => void;
    getTotalElapsed: (problemId: string) => number;
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

            setStudyPlan: (plan) => set((state) => ({
                studyPlan: { ...state.studyPlan, ...plan }
            })),

            calculateTier: (level) => {
                if (level <= 10) return `Novice ${level}`;
                if (level <= 20) return `Challenger ${level - 10}`;
                if (level <= 30) return `Solver ${level - 20}`;
                if (level <= 40) return `Master ${level - 30}`;
                return `Legend ${level - 40}`;
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
            }
        }),
        {
            name: 'cote-coach-user-storage',
            version: 2, // 스톱워치 시스템 고도화로 인한 버전 업
            migrate: (persistedState: unknown, version: number) => {
                if (version < 2) {
                    // 이전 버전 데이터에서 새로운 구조로 마이그레이션
                    const state = persistedState as UserState;
                    if (state.timer && !state.timer.problemTimers) {
                        state.timer.problemTimers = {};
                    }
                    return state;
                }
                return persistedState as UserState;
            }
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
