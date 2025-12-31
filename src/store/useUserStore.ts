import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

import { Platform, UserState } from '../types/user';
import { StudyPlan, RecommendationSettings, StudyLog } from '../types/study';

import { calculateEarnedXp } from '../lib/xp';

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
            },
            recommendationSettings: {
                difficulty: 'NORMAL',
                seedOffset: 0,
                focusAlgorithms: [],
                platforms: ['BOJ'],
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
                const newLog: Omit<StudyLog, 'id' | 'completedAt'> = {
                    problemId: `Point Boost (${amount}G)`,
                    platform: 'BOJ',
                    difficulty: 'Manual',
                    perceivedDifficulty: 'NORMAL',
                    elapsedTime: 0,
                    feeling: 'Manual Addition',
                    concepts: [],
                    result: 'SUCCESS',
                    solvingMethod: 'SELF',
                    ratingContribution: amount
                };
                get().addStudyLog(newLog);
            },

            addPoints: (amount) => set((state) => ({ points: state.points + amount })),

            setBojHandle: (handle: string) => set({ bojHandle: handle }),

            setStudyPlan: (plan: Partial<StudyPlan>) => {
                set((state) => ({
                    studyPlan: { ...state.studyPlan, ...plan }
                }));
                // Use async to not block the UI but ensure sync
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) get().saveProfile(user.id);
                });
            },

            setRecommendationSettings: (settings: Partial<RecommendationSettings>) => {
                set((state) => ({
                    recommendationSettings: { ...state.recommendationSettings, ...settings }
                }));
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) get().saveProfile(user.id);
                });
            },

            refreshRecommendations: async () => {
                const currentOffset = get().recommendationSettings.seedOffset;
                get().setRecommendationSettings({ seedOffset: currentOffset + 1 });

                // Save immediately because refresh is a significant user action
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await get().saveProfile(session.user.id);
                }
            },

            calculateTier: (level: number) => {
                const majorTiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby', 'Challenger'];
                const tierIndex = Math.floor((level - 1) / 5);

                if (tierIndex >= 6) return 'Challenger';

                const tierName = majorTiers[tierIndex];
                const subLevel = 5 - ((level - 1) % 5);
                return `${tierName} ${subLevel}`;
            },

            syncSolvedAcTier: async (rating) => {
                const currentBojRating = get().bojRating;
                const newBojRating = Math.max(0, rating);

                if (newBojRating !== currentBojRating) {
                    set({ bojRating: newBojRating });
                    await get().refreshRating();

                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) await get().saveProfile(user.id);
                }
            },

            linkBojAccount: async (handle, rating) => {
                set({ bojHandle: handle, bojRating: Math.max(0, rating) });
                await get().refreshRating();

                const { data: { user } } = await supabase.auth.getUser();
                if (user) await get().saveProfile(user.id);
            },

            unlinkBojAccount: () => {
                set({
                    bojHandle: '',
                    bojRating: 0,
                    level: 1,
                    xp: 0,
                    tier: get().calculateTier(1)
                });
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) get().saveProfile(user.id);
                });
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
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('study_logs').delete().eq('user_id', user.id);
                    await get().saveProfile(user.id);
                }
            },

            fetchUserData: async (userId) => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profile) {
                    set({
                        bojHandle: profile.boj_handle || '',
                        bojRating: profile.boj_rating || 0,
                        level: profile.level || 1,
                        xp: profile.xp || 0,
                        tier: profile.tier || 'Iron 1',
                        points: profile.points || 0,
                        studyPlan: profile.study_plan || get().studyPlan,
                        recommendationSettings: profile.recommendation_settings || get().recommendationSettings,
                    });
                }

                const { data: logs } = await supabase
                    .from('study_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (logs) {
                    set({
                        studyLogs: logs.map(l => ({
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
                        }))
                    });
                }

                const { data: assets } = await supabase
                    .from('user_assets')
                    .select('*')
                    .eq('user_id', userId);

                if (assets) {
                    set({
                        inventory: assets.map(a => a.asset_id),
                        equippedItems: assets.filter(a => a.is_equipped).map(a => a.asset_id)
                    });
                }

                await get().fetchDailyTasks(userId);
                await get().refreshRating();
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
                        recommendation_settings: state.recommendationSettings,
                        updated_at: new Date().toISOString()
                    });
                if (error) console.error('Profile sync error:', error);
            },

            fetchDailyTasks: async (userId) => {
                const { data: tasks } = await supabase
                    .from('daily_tasks')
                    .select('*')
                    .eq('user_id', userId)
                    .order('target_date', { ascending: true });

                if (tasks) {
                    set({
                        dailyTasks: tasks.map(t => ({
                            id: t.id,
                            problemId: t.problem_id,
                            problemTitle: t.problem_title,
                            site: t.site as Platform,
                            difficulty: t.difficulty,
                            status: t.status as 'pending' | 'completed',
                            targetDate: t.target_date
                        }))
                    });
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
                    set(state => ({
                        dailyTasks: [...state.dailyTasks, {
                            id: data.id,
                            problemId: data.problem_id,
                            problemTitle: data.problem_title,
                            site: data.site as Platform,
                            difficulty: data.difficulty,
                            status: data.status as 'pending' | 'completed',
                            targetDate: data.target_date
                        }]
                    }));
                }
            },

            toggleTaskStatus: async (taskId) => {
                const task = get().dailyTasks.find(t => t.id === taskId);
                if (!task) return;
                const newStatus = task.status === 'pending' ? 'completed' : 'pending';
                const { error } = await supabase.from('daily_tasks').update({ status: newStatus }).eq('id', taskId);
                if (!error) {
                    set(state => ({ dailyTasks: state.dailyTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) }));
                }
            },

            deleteDailyTask: async (taskId) => {
                const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
                if (!error) {
                    set(state => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== taskId) }));
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

                const { error } = await supabase.from('study_logs').update(dbUpdates).eq('id', logId);
                if (!error) {
                    set(state => ({ studyLogs: state.studyLogs.map(l => l.id === logId ? { ...l, ...updates } : l) }));
                }
            },

            deleteStudyLog: async (logId) => {
                const { error } = await supabase.from('study_logs').delete().eq('id', logId);
                if (!error) {
                    set(state => ({ studyLogs: state.studyLogs.filter(l => l.id !== logId) }));
                }
            },

            addStudyLog: async (logData) => {
                const earnedRating = logData.ratingContribution || calculateEarnedXp(logData.platform, logData.difficulty, get().level);
                const newLog: StudyLog = {
                    ...logData,
                    id: Math.random().toString(36).substr(2, 9),
                    completedAt: new Date().toISOString(),
                    ratingContribution: earnedRating
                };

                set(state => {
                    const nextTimers = { ...state.timer.problemTimers };
                    delete nextTimers[logData.problemId];
                    return {
                        studyLogs: [newLog, ...state.studyLogs],
                        timer: { ...state.timer, problemTimers: nextTimers }
                    };
                });

                await get().refreshRating();

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await supabase.from('study_logs').insert({
                        user_id: session.user.id,
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
                    await get().saveProfile(session.user.id);
                }
            },

            refreshRating: async () => {
                const { studyLogs, bojRating, bojHandle, calculateTier } = get();
                const relevantLogs = bojHandle ? studyLogs.filter(l => l.platform !== 'BOJ') : studyLogs;
                const sortedPoints = relevantLogs.map(l => l.ratingContribution || 0).sort((a, b) => b - a);
                const top100Sum = sortedPoints.slice(0, 100).reduce((a, b) => a + b, 0);
                const countBonus = Math.floor(175 * (1 - Math.pow(0.995, studyLogs.length)));

                const totalRating = (bojRating || 0) + top100Sum + countBonus;
                const nextLevel = Math.floor(totalRating / 100) + 1;
                const nextTier = calculateTier(nextLevel);

                set({ xp: totalRating, level: nextLevel, tier: nextTier });
            },

            startTimer: (problemId) => {
                const { timer } = get();
                if (timer.isRunning && timer.currentProblemId !== problemId) return false;
                set(state => ({ timer: { ...state.timer, isRunning: true, startTime: Date.now(), currentProblemId: problemId } }));
                return true;
            },

            stopTimer: () => {
                const { timer } = get();
                if (!timer.isRunning || !timer.startTime) return;
                const delta = Date.now() - timer.startTime;
                set(state => ({
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
                const targetId = problemId || get().timer.currentProblemId;
                if (!targetId) return;
                set(state => {
                    const nextTimers = { ...state.timer.problemTimers };
                    delete nextTimers[targetId];
                    const isTargetActive = state.timer.currentProblemId === targetId;
                    return {
                        timer: {
                            ...state.timer,
                            isRunning: isTargetActive ? false : state.timer.isRunning,
                            startTime: isTargetActive ? null : state.timer.startTime,
                            currentProblemId: isTargetActive ? null : state.timer.currentProblemId,
                            problemTimers: nextTimers
                        }
                    };
                });
            },

            getTotalElapsed: (problemId) => {
                const { timer } = get();
                const stored = (timer.problemTimers || {})[problemId] || 0;
                if (timer.isRunning && timer.currentProblemId === problemId && timer.startTime) {
                    return stored + (Date.now() - timer.startTime);
                }
                return stored;
            },

            getDailyProgress: () => {
                const today = new Date().toISOString().split('T')[0];
                const solvedCount = get().studyLogs.filter(log => log.completedAt.startsWith(today)).length;
                return { solved: solvedCount, goal: get().studyPlan.problemCount };
            },

            getDaysRemaining: () => {
                const target = new Date(get().studyPlan.targetDate).getTime();
                const today = new Date().setHours(0, 0, 0, 0);
                return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
            },

            buyItem: (item) => {
                if (get().points < item.price || get().inventory.includes(item.id)) return false;
                set(state => ({ points: state.points - item.price, inventory: [...state.inventory, item.id] }));
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                        get().saveProfile(user.id);
                        supabase.from('user_assets').insert({ user_id: user.id, asset_type: item.category, asset_id: item.id }).then();
                    }
                });
                return true;
            },

            toggleEquip: (itemId) => {
                set(state => {
                    const isEquipped = state.equippedItems.includes(itemId);
                    const nextEquipped = isEquipped ? state.equippedItems.filter(id => id !== itemId) : [...state.equippedItems, itemId];
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user) supabase.from('user_assets').update({ is_equipped: !isEquipped }).eq('user_id', user.id).eq('asset_id', itemId).then();
                    });
                    return { equippedItems: nextEquipped };
                });
            }
        }),
        {
            name: 'cote-coach-user-storage',
            version: 7, // Plan & Settings Separation
            partialize: (state) => ({ timer: state.timer }), // Only keep timer persisted locally
            migrate: (_persistedState: any, _version: number) => {
                // Migration logic if needed
                return _persistedState;
            }
        }
    )
);

