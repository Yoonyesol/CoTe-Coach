import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type Platform = 'BOJ' | 'PROG' | 'LC' | 'SWEA';

export interface StudyPlan {
    targetTier: string;
    targetDate: string; // ISO String
    dailyIntensity: 'LOW' | 'NORMAL' | 'HIGH';
    problemCount: number;
    recommendationDifficulty: 'EASY' | 'NORMAL' | 'HARD';
}

export interface DailyTask {
    id: string;
    problemId: string;
    problemTitle: string;
    site: Platform;
    difficulty: string;
    status: 'pending' | 'completed';
    targetDate: string; // YYYY-MM-DD
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
    result: 'SUCCESS' | 'FAIL'; // SUCCESS: 해결함, FAIL: 못 끝냄
    solvingMethod: 'SELF' | 'REFERENCE'; // SELF: 스스로 해결, REFERENCE: 답지 참고
    ratingContribution?: number;
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
    bojRating: number; // Added to store linked BOJ rating
    studyPlan: StudyPlan;
    timer: TimerState;
    studyLogs: StudyLog[];
    inventory: string[]; // Item IDs
    equippedItems: string[]; // Item IDs
    dailyTasks: DailyTask[];

    // Actions
    addXp: (amount: number) => void;
    addPoints: (amount: number) => void;
    setBojHandle: (handle: string) => void;
    setStudyPlan: (plan: Partial<StudyPlan>) => void;
    calculateTier: (level: number) => string;
    syncSolvedAcTier: (tier: number) => Promise<void>;
    linkBojAccount: (handle: string, tier: number) => Promise<void>;
    unlinkBojAccount: () => void;
    resetProgress: () => Promise<void>;

    // Supabase Sync Actions
    fetchUserData: (userId: string) => Promise<void>;
    saveProfile: (userId: string) => Promise<void>;

    // Study Log Actions
    addStudyLog: (log: Omit<StudyLog, 'id' | 'completedAt'>) => Promise<void>;
    updateStudyLog: (logId: string, updates: Partial<StudyLog>) => Promise<void>;
    deleteStudyLog: (logId: string) => Promise<void>;

    // Daily Task Actions
    fetchDailyTasks: (userId: string) => Promise<void>;
    addDailyTask: (task: Omit<DailyTask, 'id' | 'status'>) => Promise<void>;
    toggleTaskStatus: (taskId: string) => Promise<void>;
    deleteDailyTask: (taskId: string) => Promise<void>;

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

    // Helper to force recalculation
    refreshRating: () => Promise<void>;
}

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

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            points: 0,
            tier: 'Iron 1',
            bojHandle: '',
            bojRating: 0,
            studyPlan: {
                targetTier: 'Gold 1',
                targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30일 뒤
                dailyIntensity: 'NORMAL',
                problemCount: 4,
                recommendationDifficulty: 'NORMAL',
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
            dailyTasks: [],

            addXp: (amount) => {
                // To maintain history for Top 100, we add a generic record
                const newLog: StudyLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    problemId: `Point Boost (${amount}G)`,
                    platform: 'BOJ',
                    difficulty: 'Manual',
                    perceivedDifficulty: 'NORMAL',
                    elapsedTime: 0,
                    feeling: 'Manual Addition',
                    concepts: [],
                    completedAt: new Date().toISOString(),
                    result: 'SUCCESS',
                    solvingMethod: 'SELF',
                    ratingContribution: amount // Using amount here
                };

                get().addStudyLog(newLog);
            },

            addPoints: (amount) => set((state) => ({ points: state.points + amount })),

            setBojHandle: (handle: string) => set({ bojHandle: handle }),

            setStudyPlan: async (plan) => {
                set((state) => ({
                    studyPlan: { ...state.studyPlan, ...plan }
                }));

                // DB Sync if user is logged in
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await get().saveProfile(user.id);
                }
            },

            calculateTier: (level) => {
                // Solved.ac Standard Mapping (Level = Tier ID)
                const majorTiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'];

                // 1-5: Bronze, 6-10: Silver, 11-15: Gold, 16-20: Platinum, 21-25: Diamond, 26-30: Ruby
                const tierIndex = Math.floor((level - 1) / 5);

                if (tierIndex < majorTiers.length) {
                    const tierName = majorTiers[tierIndex];
                    // Solved.ac style: 5 is lowest, 1 is highest (e.g., Level 12 = Gold 4)
                    const subLevel = 5 - ((level - 1) % 5);
                    return `${tierName} ${subLevel}`;
                }

                // Apex Tiers (31+)
                if (level <= 35) return `Master ${level - 30}`;
                if (level <= 40) return `Grandmaster ${level - 35}`;
                return `Challenger ${level - 40}`;
            },

            syncSolvedAcTier: async (rating) => {
                const currentBojRating = get().bojRating;
                const newBojRating = Math.max(0, rating);

                if (newBojRating !== currentBojRating) {
                    set({ bojRating: newBojRating });

                    // Force recalculation
                    const logs = get().studyLogs;

                    // Official Source Policy Filtering
                    const relevantLogs = logs.filter(l => l.platform !== 'BOJ');

                    const sortedPoints = relevantLogs.map(l => l.ratingContribution || 0).sort((a, b) => b - a);
                    const localTop100 = sortedPoints.slice(0, 100).reduce((a, b) => a + b, 0);
                    const bonus = Math.floor(175 * (1 - Math.pow(0.995, logs.length)));

                    const totalRating = newBojRating + localTop100 + bonus;
                    const nextLevel = Math.floor(totalRating / 100) + 1;
                    const nextTier = get().calculateTier(nextLevel);

                    set({ xp: totalRating, level: nextLevel, tier: nextTier });

                    // Supabase Sync: Update Profile
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await get().saveProfile(user.id);
                    }
                }
            },

            linkBojAccount: async (handle, rating) => {
                const bojRating = Math.max(0, Number(rating) || 0);

                set({
                    bojHandle: handle,
                    bojRating: bojRating
                });

                // Recalculate everything immediately
                const logs = get().studyLogs;

                // Official Source Policy Filtering
                const relevantLogs = logs.filter(l => l.platform !== 'BOJ');

                const sortedPoints = relevantLogs.map(l => l.ratingContribution || 0).sort((a, b) => b - a);
                const localTop100 = sortedPoints.slice(0, 100).reduce((a, b) => a + b, 0);
                const bonus = Math.floor(175 * (1 - Math.pow(0.995, logs.length)));

                const totalRating = bojRating + localTop100 + bonus;
                const nextLevel = Math.floor(totalRating / 100) + 1;
                const nextTier = get().calculateTier(nextLevel);

                set({ xp: totalRating, level: nextLevel, tier: nextTier });

                // Supabase Sync: Update Profile
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await get().saveProfile(user.id);
                }
            },

            unlinkBojAccount: async () => {
                set({
                    bojHandle: '',
                    bojRating: 0,
                    inventory: [],
                    equippedItems: [],
                    dailyTasks: [],
                    timer: {
                        isRunning: false,
                        startTime: null,
                        currentProblemId: null,
                        problemTimers: {},
                    },
                    level: 1,
                    xp: 0,
                    tier: get().calculateTier(1), // Reset to Bronze 5
                });

                // Supabase Sync: Update Profile if logged in
                const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
                if (user) {
                    await get().saveProfile(user.id);
                }
            },

            resetProgress: async () => {
                set({
                    studyLogs: [],
                    xp: 0,
                    level: 1,
                    tier: 'Bronze 5',
                    points: 0,
                    bojHandle: '',
                    bojRating: 0,
                });

                // Supabase Sync: Clean up if logged in
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('study_logs').delete().eq('user_id', user.id);
                    await get().saveProfile(user.id);
                }
            },

            // Supabase Sync Actions Implementation
            fetchUserData: async (userId) => {
                // 1. Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profile) {
                    const currentState = get();
                    set({
                        bojHandle: profile.boj_handle || currentState.bojHandle,
                        bojRating: profile.boj_rating || currentState.bojRating,
                        level: profile.level || currentState.level,
                        xp: profile.xp || currentState.xp,
                        tier: profile.tier || currentState.tier,
                        points: profile.points || currentState.points,
                        studyPlan: profile.study_plan || currentState.studyPlan
                    });

                    // If we had local data but server was empty, push local data to server
                    if (!profile.boj_handle && currentState.bojHandle) {
                        get().saveProfile(userId);
                    }
                }

                // 2. Fetch Study Logs
                const { data: logs } = await supabase
                    .from('study_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (logs) {
                    const mappedLogs: StudyLog[] = logs.map(l => ({
                        id: l.id,
                        problemId: l.problem_id,
                        platform: l.site as Platform,
                        difficulty: l.difficulty || '',
                        perceivedDifficulty: l.perceived_difficulty as 'EASY' | 'NORMAL' | 'HARD',
                        result: l.result as 'SUCCESS' | 'FAIL',
                        solvingMethod: l.solving_method as 'SELF' | 'REFERENCE',
                        elapsedTime: l.elapsed_time || 0,
                        feeling: l.feeling || '',
                        concepts: l.concepts || [],
                        completedAt: l.created_at,
                        ratingContribution: l.rating_contribution || 0
                    }));
                    set({ studyLogs: mappedLogs });
                }

                // 3. Fetch User Assets (Inventory)
                const { data: assets } = await supabase
                    .from('user_assets')
                    .select('*')
                    .eq('user_id', userId);

                if (assets) {
                    const inventoryIds = assets.map(a => a.asset_id);
                    const equippedIds = assets.filter(a => a.is_equipped).map(a => a.asset_id);
                    set({
                        inventory: inventoryIds,
                        equippedItems: equippedIds
                    });
                }

                // 4. Fetch Daily Tasks
                await get().fetchDailyTasks(userId);

                // Force a final refresh to ensure UI is in sync
                get().refreshRating();
            },

            fetchDailyTasks: async (userId) => {
                const { data: tasks } = await supabase
                    .from('daily_tasks')
                    .select('*')
                    .eq('user_id', userId)
                    .order('target_date', { ascending: true });

                if (tasks) {
                    const mappedTasks: DailyTask[] = tasks.map(t => ({
                        id: t.id,
                        problemId: t.problem_id,
                        problemTitle: t.problem_title,
                        site: t.site as Platform,
                        difficulty: t.difficulty,
                        status: t.status as 'pending' | 'completed',
                        targetDate: t.target_date
                    }));
                    set({ dailyTasks: mappedTasks });
                }
            },

            addDailyTask: async (taskData) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('daily_tasks')
                    .insert({
                        user_id: user.id,
                        problem_id: taskData.problemId,
                        problem_title: taskData.problemTitle,
                        site: taskData.site,
                        difficulty: taskData.difficulty,
                        target_date: taskData.targetDate,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (!error && data) {
                    const newTask: DailyTask = {
                        id: data.id,
                        problemId: data.problem_id,
                        problemTitle: data.problem_title,
                        site: data.site as Platform,
                        difficulty: data.difficulty,
                        status: data.status as 'pending' | 'completed',
                        targetDate: data.target_date
                    };
                    set(state => ({ dailyTasks: [...state.dailyTasks, newTask] }));
                }
            },

            toggleTaskStatus: async (taskId) => {
                const task = get().dailyTasks.find(t => t.id === taskId);
                if (!task) return;

                const newStatus = task.status === 'pending' ? 'completed' : 'pending';

                const { error } = await supabase
                    .from('daily_tasks')
                    .update({ status: newStatus })
                    .eq('id', taskId);

                if (!error) {
                    set(state => ({
                        dailyTasks: state.dailyTasks.map(t =>
                            t.id === taskId ? { ...t, status: newStatus } : t
                        )
                    }));
                }
            },

            deleteDailyTask: async (taskId) => {
                const { error } = await supabase
                    .from('daily_tasks')
                    .delete()
                    .eq('id', taskId);

                if (!error) {
                    set(state => ({
                        dailyTasks: state.dailyTasks.filter(t => t.id !== taskId)
                    }));
                }
            },

            saveProfile: async (userId) => {
                const state = get();
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        boj_handle: state.bojHandle,
                        boj_rating: state.bojRating,
                        level: state.level,
                        tier: state.tier,
                        points: state.points,
                        xp: state.xp,
                        study_plan: state.studyPlan,
                        updated_at: new Date().toISOString()
                    });

                if (error) {
                    console.error('Profile sync error:', error);
                }
            },

            updateStudyLog: async (logId, updates) => {
                const dbUpdates: any = {};
                if (updates.perceivedDifficulty) dbUpdates.perceived_difficulty = updates.perceivedDifficulty;
                if (updates.feeling !== undefined) dbUpdates.feeling = updates.feeling;
                if (updates.concepts) dbUpdates.concepts = updates.concepts;
                if (updates.result) dbUpdates.result = updates.result;
                if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
                if (updates.elapsedTime !== undefined) dbUpdates.elapsed_time = updates.elapsedTime;
                if (updates.solvingMethod) dbUpdates.solving_method = updates.solvingMethod;

                const { error } = await supabase
                    .from('study_logs')
                    .update(dbUpdates)
                    .eq('id', logId);

                if (!error) {
                    set(state => ({
                        studyLogs: state.studyLogs.map(l => l.id === logId ? { ...l, ...updates } : l)
                    }));
                }
            },

            deleteStudyLog: async (logId) => {
                const { error } = await supabase
                    .from('study_logs')
                    .delete()
                    .eq('id', logId);

                if (!error) {
                    set(state => ({
                        studyLogs: state.studyLogs.filter(l => l.id !== logId)
                    }));
                }
            },

            addStudyLog: async (logData) => {
                const currentLevel = get().level;
                const earnedRating = logData.ratingContribution || calculateEarnedXp(logData.platform, logData.difficulty, currentLevel);

                const newLog: StudyLog = {
                    ...logData,
                    id: Math.random().toString(36).substr(2, 9),
                    completedAt: new Date().toISOString(),
                    ratingContribution: earnedRating
                };

                const updatedLogs = [newLog, ...get().studyLogs];

                // Filtering Logic: If BOJ linked, don't count manual BOJ logs for Top 100 (Official Source Policy)
                const relevantLogs = get().bojHandle
                    ? updatedLogs.filter(l => l.platform !== 'BOJ')
                    : updatedLogs;

                const sortedPoints = relevantLogs
                    .map(l => l.ratingContribution || 0)
                    .sort((a, b) => b - a);

                const top100Sum = sortedPoints.slice(0, 100).reduce((a, b) => a + b, 0);
                const countBonus = Math.floor(175 * (1 - Math.pow(0.995, updatedLogs.length)));

                // Unified Integration: BOJ Rating + App Activities
                const totalRating = (get().bojRating || 0) + top100Sum + countBonus;

                const nextLevel = Math.floor(totalRating / 100) + 1;
                const nextTier = get().calculateTier(nextLevel);

                set((state) => {
                    const nextTimers = { ...state.timer.problemTimers };
                    delete nextTimers[logData.problemId];

                    return {
                        studyLogs: updatedLogs,
                        xp: totalRating,
                        level: nextLevel,
                        tier: nextTier,
                        points: state.points + (earnedRating * 10), // Keep shop points
                        timer: {
                            ...state.timer,
                            problemTimers: nextTimers
                        }
                    };
                });

                // Supabase Sync: Persist Log & Update Profile
                const { data: { session } } = await supabase.auth.getSession();
                const user = session?.user;

                if (user) {
                    const { error: logError } = await supabase.from('study_logs').insert({
                        user_id: user.id,
                        problem_id: newLog.problemId,
                        site: newLog.platform,
                        difficulty: newLog.difficulty,
                        perceived_difficulty: newLog.perceivedDifficulty,
                        result: newLog.result,
                        solving_method: newLog.solvingMethod,
                        elapsed_time: newLog.elapsedTime,
                        feeling: newLog.feeling,
                        concepts: newLog.concepts,
                        rating_contribution: newLog.ratingContribution
                    });

                    if (logError) {
                        console.error('Study log sync error:', logError);
                    }

                    await get().saveProfile(user.id);
                }
            },

            refreshRating: async () => {
                const { studyLogs, bojRating, bojHandle, calculateTier } = get();

                // Filtering Logic: Official Source Policy
                const relevantLogs = bojHandle
                    ? studyLogs.filter(l => l.platform !== 'BOJ')
                    : studyLogs;

                const sortedPoints = relevantLogs
                    .map(l => l.ratingContribution || 0)
                    .sort((a, b) => b - a);

                const top100Sum = sortedPoints.slice(0, 100).reduce((a, b) => a + b, 0);
                const countBonus = Math.floor(175 * (1 - Math.pow(0.995, studyLogs.length)));

                const totalRating = (bojRating || 0) + top100Sum + countBonus;
                const nextLevel = Math.floor(totalRating / 100) + 1;
                const nextTier = calculateTier(nextLevel);

                set({ xp: totalRating, level: nextLevel, tier: nextTier });

                // Supabase Sync: Update Profile
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await get().saveProfile(user.id);
                }
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

                // Supabase Sync: Deduct points and Add Asset
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                        get().saveProfile(user.id); // Save updated points
                        supabase.from('user_assets').insert({
                            user_id: user.id,
                            asset_type: item.category,
                            asset_id: item.id,
                            is_equipped: false
                        }).then(); // Fire and forget
                    }
                });

                return true;
            },

            toggleEquip: (itemId) => {
                set((state) => {
                    const isEquipped = state.equippedItems.includes(itemId);
                    const newEquippedItems = isEquipped
                        ? state.equippedItems.filter(id => id !== itemId)
                        : [...state.equippedItems, itemId];

                    // Supabase Sync: Update user_assets table
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user) {
                            supabase.from('user_assets')
                                .update({ is_equipped: !isEquipped })
                                .eq('user_id', user.id)
                                .eq('asset_id', itemId)
                                .then(); // Fire and forget
                        }
                    });

                    return {
                        equippedItems: newEquippedItems
                    };
                });
            }
        }),
        {
            name: 'cote-coach-user-storage',
            version: 6, // AC 레이팅 시스템 & 자동 동기화 보정
            partialize: (state) => ({ timer: state.timer }), // Only keep timer in localStorage
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

                if (version < 5) {
                    if (!state.bojRating) state.bojRating = 0;

                    // 기존 로그들(StudyLogs)에 ratingContribution이 없는 경우 채워줌
                    if (state.studyLogs && state.studyLogs.length > 0) {
                        state.studyLogs = state.studyLogs.map(log => {
                            if (log.ratingContribution !== undefined) return log;

                            // 임시 백필 매핑 (XP_MAP과 유사)
                            let points = 5;
                            const diff = log.difficulty;
                            if (diff.includes('Bronze')) points = 2;
                            else if (diff.includes('Silver')) points = 8;
                            else if (diff.includes('Gold')) points = 13;
                            else if (diff.includes('Platinum')) points = 18;
                            else if (diff.includes('Diamond')) points = 23;
                            else if (diff.includes('Ruby')) points = 28;
                            else if (diff === 'Easy') points = 5;
                            else if (diff === 'Medium') points = 15;
                            else if (diff === 'Hard') points = 25;
                            else if (diff === 'Lv.0') points = 1;
                            else if (diff === 'Lv.1') points = 4;
                            else if (diff === 'Lv.2') points = 10;
                            else if (diff === 'Lv.3') points = 20;
                            else if (diff === 'Lv.4') points = 25;
                            else if (diff === 'Lv.5') points = 30;

                            return { ...log, ratingContribution: points };
                        });

                        // 전체 레이팅(xp) 및 레벨 재계산
                        const sorted = [...state.studyLogs].map(l => l.ratingContribution || 0).sort((a, b) => b - a);
                        const top100 = sorted.slice(0, 100).reduce((a, b) => a + b, 0);
                        const bonus = Math.floor(175 * (1 - Math.pow(0.995, state.studyLogs.length)));

                        state.xp = (state.bojRating || 0) + top100 + bonus;
                        state.level = Math.floor(state.xp / 100) + 1;
                    }
                }

                if (version < 6) {
                    // Force complete recalculation for version 6
                    const logs = state.studyLogs || [];
                    const sorted = [...logs].map(l => l.ratingContribution || 0).sort((a, b) => b - a);
                    const top100 = sorted.slice(0, 100).reduce((a, b) => a + b, 0);
                    const bonus = Math.floor(175 * (1 - Math.pow(0.995, logs.length)));
                    const br = state.bojRating || 0;

                    state.xp = br + top100 + bonus;
                    state.level = Math.floor(state.xp / 100) + 1;

                    // Note: calculateTier might not be available on state at migration time
                    // We'll let the App.tsx sync effect handle the final tier string
                }

                return state;
            }
        }
    )
);

/**
 * 문제 난이도를 대략적인 사용자 레벨로 매핑 (Solved.ac 분포 기준)
 */
const DIFFICULTY_LEVEL_MAP: Record<string, number> = {
    // Programmers
    'Lv.0': 1, 'Lv.1': 4, 'Lv.2': 10, 'Lv.3': 20, 'Lv.4': 30, 'Lv.5': 42,
    // LeetCode
    'Easy': 5, 'Medium': 18, 'Hard': 35,
    // SWEA
    'D1': 1, 'D2': 5, 'D3': 12, 'D4': 22, 'D5': 32, 'D6': 42,
    // BOJ (Approx)
    'Bronze': 3, 'Silver': 12, 'Gold': 22, 'Platinum': 32, 'Diamond': 40, 'Ruby': 45
};

/**
 * 문제 난이도와 플랫폼, 유저 레벨을 받아 동적 XP를 계산합니다.
 * (Solved.ac 방식: 내 티어보다 낮은 문제는 점수가 짜고, 높은 문제는 후함)
 */
export const calculateEarnedXp = (platform: Platform, difficulty: string, userLevel: number = 1): number => {
    let baseXp = 10;
    let problemLevel = 1;

    const platformMap = XP_MAP[platform];
    if (platformMap) {
        // 1. Calculate Base XP from Table
        if (platform === 'BOJ') {
            const lv = parseInt(difficulty);
            if (!isNaN(lv)) {
                if (lv <= 5) baseXp = XP_MAP.BOJ.Bronze;
                else if (lv <= 10) baseXp = XP_MAP.BOJ.Silver;
                else if (lv <= 15) baseXp = XP_MAP.BOJ.Gold;
                else if (lv <= 20) baseXp = XP_MAP.BOJ.Platinum;
                else if (lv <= 25) baseXp = XP_MAP.BOJ.Diamond;
                else baseXp = XP_MAP.BOJ.Ruby;

                // Problem Level Approx
                problemLevel = Math.max(1, (lv - 1) * 2);
            } else {
                const tierBase = difficulty.split(' ')[0];
                baseXp = XP_MAP.BOJ[tierBase] || 10;
                problemLevel = DIFFICULTY_LEVEL_MAP[tierBase] || 10;
            }
        } else {
            // @ts-ignore - Dynamic access
            baseXp = platformMap[difficulty] || 10;
            // Map Difficulty String to Level
            problemLevel = DIFFICULTY_LEVEL_MAP[difficulty] || 10;
        }
    }

    // 2. Calculate Gap Multiplier
    // Gap = Problem Level - User Level
    const gap = problemLevel - userLevel;
    let multiplier = 1.0;

    if (gap > 0) {
        // Challenge Bonus: 10% bonus per level gap
        multiplier = 1 + (gap * 0.1);
    } else if (gap < 0) {
        // Easy Penalty: 10% reduction per level gap (Exponential Decay)
        // e.g. Gap -5 => 0.9^5 = 0.59 (59% XP)
        // Gap -10 => 0.9^10 = 0.34 (34% XP)
        multiplier = Math.pow(0.9, Math.abs(gap));
    }

    // 3. Final Calculation
    let finalXp = Math.floor(baseXp * multiplier);

    // Minimum 1 XP 
    return Math.max(1, finalXp);
};
