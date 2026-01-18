import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

import { Platform, UserState } from '../types/user';
import { RecommendationSettings, StudyLog, StudyGoal } from '../types/study';
import { AVATAR_ASSETS } from '../components/avatar/AvatarAssets';
import { SHOP_ITEMS } from '../constants/shop';

import { calculateEarnedXp } from '../lib/xp';

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            level: 1,
            points: 0,
            tier: 'Iron 1',
            bojHandle: '',
            nickname: null,
            bojRating: 0,

            recommendationSettings: {
                difficulty: 'NORMAL',
                focusAlgorithms: [],
                seedOffset: 0,
                platforms: ['BOJ'],
                recommendationCount: 5,
                dailyTargetFallback: 3
            },
            timer: {
                isRunning: false,
                startTime: null,
                currentProblemId: null,
                activeLogId: null,
                problemTimers: {},
            },
            studyLogs: [],
            inventory: [],
            equippedItems: [],
            dailyTasks: [],
            reviewPlans: [],
            studyGoals: [],
            lastAdWatchTime: null,

            addXp: (amount) => {
                const newLog: Omit<StudyLog, 'id' | 'completedAt'> = {
                    problemId: `Point Boost (${amount}G)`,
                    problemTitle: `경험치 추가 (${amount}G)`,
                    platform: 'BOJ',
                    difficulty: 'Manual',
                    perceivedDifficulty: 'NORMAL',
                    elapsedTime: 0,
                    reflection: 'Manual Addition',
                    approach: '',
                    concepts: [],
                    result: 'SUCCESS',
                    solvingMethod: 'SELF',
                    stage: 0,
                    ratingContribution: amount
                };
                get().addStudyLog(newLog);
            },

            addPoints: (amount) => set((state) => ({ points: state.points + amount })),

            setBojHandle: (handle: string) => set({ bojHandle: handle }),
            setNickname: async (nickname: string) => {
                set({ nickname });
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await get().saveProfile(user.id);
            },



            setRecommendationSettings: async (settings: Partial<RecommendationSettings>) => {
                set((state) => ({
                    recommendationSettings: { ...state.recommendationSettings, ...settings }
                }));

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await get().saveProfile(user.id);
                        console.log('Profile settings saved to DB');
                    }
                } catch (err) {
                    console.error('Failed to sync settings to DB:', err);
                }
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
                const tiers = [
                    { name: 'Iron', min: 1, max: 3, maxSub: 3 },
                    { name: 'Bronze', min: 4, max: 8, maxSub: 5 },
                    { name: 'Silver', min: 9, max: 18, maxSub: 5 },
                    { name: 'Gold', min: 19, max: 28, maxSub: 5 },
                    { name: 'Platinum', min: 29, max: 35, maxSub: 4 },
                    { name: 'Diamond', min: 36, max: 38, maxSub: 3 },
                    { name: 'Master', min: 39, max: 40, maxSub: 2 },
                    { name: 'Grandmaster', min: 41, max: 41, maxSub: 1 },
                    { name: 'Challenger', min: 42, max: Infinity, maxSub: 1 }
                ];

                const tier = tiers.find(t => level >= t.min && level <= t.max) || tiers[tiers.length - 1];

                if (tier.name === 'Challenger') return 'Challenger';

                const rangeSize = (tier.max - tier.min) + 1;
                const offset = level - tier.min;
                const step = rangeSize / tier.maxSub;
                const bucket = Math.min(Math.floor(offset / step), tier.maxSub - 1);
                const subLevel = tier.maxSub - bucket;

                return `${tier.name} ${subLevel}`;
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
                // Parallelize all independent data fetching to eliminate waterfall
                const [
                    profileResult,
                    , // reviewPlansResult (handled internally)
                    logsResult,
                    assetsResult,
                    , // dailyTasksResult (handled internally)
                    timerLogsResult
                ] = await Promise.all([
                    // 1. Profile
                    supabase.from('profiles').select('*').eq('id', userId).single(),
                    // 2. Review Plans (Action)
                    get().fetchReviewPlans(userId),
                    // 3. Study Logs
                    supabase.from('study_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                    // 4. Assets
                    supabase.from('user_assets').select('*').eq('user_id', userId),
                    // 5. Daily Tasks (Action)
                    get().fetchDailyTasks(userId),
                    // 6. Timer Logs
                    supabase.from('timer_logs').select('problem_id, duration_ms, end_time, start_time, id').eq('user_id', userId)
                ]);

                // --- Process Profile ---
                const { data: profile } = profileResult;
                if (profile) {
                    set({
                        bojHandle: profile.boj_handle || '',
                        nickname: profile.nickname || null,
                        bojRating: profile.boj_rating || 0,
                        level: profile.level || 1,
                        tier: profile.tier || 'Bronze 5',
                        points: profile.points || 0,
                        xp: profile.xp || 0,
                        recommendationSettings: {
                            ...get().recommendationSettings,
                            ...(profile.recommendation_settings || {})
                        },
                    });
                }

                // --- Process Study Logs ---
                const { data: logs } = logsResult;
                if (logs) {
                    set({
                        studyLogs: logs.map(l => ({
                            id: l.id,
                            problemId: l.problem_id,
                            problemTitle: l.problem_title || l.problem_id,
                            platform: l.site as Platform,
                            difficulty: l.difficulty || '',
                            perceivedDifficulty: l.perceived_difficulty as any,
                            result: l.result as any,
                            solvingMethod: l.solving_method as any,
                            elapsedTime: l.elapsed_time || 0,
                            reflection: l.reflection || l.feeling || '',
                            approach: l.approach || '',
                            concepts: l.concepts || [],
                            completedAt: l.created_at,
                            stage: l.stage || 0,
                            ratingContribution: l.rating_contribution || 0,
                            isFinished: l.is_finished || false,
                            language: l.language || undefined
                        }))
                    });
                }

                // --- Process Assets ---
                const { data: assets } = assetsResult;
                if (assets) {
                    set({
                        inventory: assets.map(a => a.asset_id),
                        equippedItems: assets.filter(a => a.is_equipped).map(a => a.asset_id)
                    });
                }

                // --- Process Timer Logs ---
                const { data: timerLogs } = timerLogsResult;
                if (timerLogs) {
                    const aggregated: Record<string, number> = {};
                    let activeLog: {
                        problem_id: string;
                        start_time: string;
                        id: string;
                        end_time: string | null
                    } | null = null;

                    timerLogs.forEach((log: {
                        problem_id: string;
                        duration_ms: number | null;
                        start_time: string;
                        id: string;
                        end_time: string | null
                    }) => {
                        // 1. Accumulate duration
                        aggregated[log.problem_id] = (aggregated[log.problem_id] || 0) + (log.duration_ms || 0);

                        // 2. Find active session (latest with null end_time)
                        if (!log.end_time) {
                            activeLog = log;
                        }
                    });

                    set(state => ({
                        timer: {
                            ...state.timer,
                            problemTimers: aggregated,
                            // Restore active session
                            isRunning: !!activeLog,
                            currentProblemId: activeLog ? (activeLog as { problem_id: string }).problem_id : state.timer.currentProblemId,
                            startTime: activeLog ? new Date((activeLog as { start_time: string }).start_time).getTime() : state.timer.startTime,
                            activeLogId: activeLog ? (activeLog as { id: string }).id : null
                        }
                    }));
                }

                await get().refreshRating();
            },

            saveProfile: async (userId) => {
                const state = get();
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        boj_handle: state.bojHandle,
                        nickname: state.nickname,
                        boj_rating: state.bojRating,
                        level: state.level,
                        tier: state.tier,
                        points: state.points,
                        xp: state.xp,
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
                            targetDate: t.target_date,
                            url: t.url || undefined,
                            tags: t.tags || []
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
                        status: 'pending',
                        url: taskData.url || null,
                        tags: taskData.tags || []
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
                            targetDate: data.target_date,
                            url: data.url || undefined,
                            tags: data.tags || []
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

            updateDailyTask: async (taskId, updates) => {
                const dbUpdates: any = {};
                if (updates.problemTitle) dbUpdates.problem_title = updates.problemTitle;
                if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
                if (updates.url !== undefined) dbUpdates.url = updates.url;
                if (updates.tags) dbUpdates.tags = updates.tags;
                if (updates.site) dbUpdates.site = updates.site;

                const { error } = await supabase.from('daily_tasks').update(dbUpdates).eq('id', taskId);
                if (!error) {
                    set(state => ({
                        dailyTasks: state.dailyTasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                    }));
                }
            },

            deleteDailyTask: async (taskId) => {
                const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
                if (!error) {
                    set(state => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== taskId) }));
                }
            },

            fetchReviewPlans: async (userId) => {
                const { data: plans } = await supabase
                    .from('review_plans')
                    .select('*')
                    .eq('user_id', userId)
                    .order('next_review_at', { ascending: true });

                if (plans) {
                    set({
                        reviewPlans: plans.map(p => ({
                            id: p.id,
                            problemId: p.problem_id,
                            problemTitle: p.problem_title,
                            platform: p.platform as Platform,
                            difficulty: p.difficulty,
                            currentStage: p.current_stage,
                            nextReviewAt: p.next_review_at,
                            status: p.status as any,
                            lastCompletedAt: p.last_completed_at
                        }))
                    });
                }
            },

            addReviewSession: async (problemId, logData) => {
                await get().addStudyLog({
                    ...logData,
                    problemId
                });
            },

            // Goal CRUD Functions
            fetchGoals: async (userId) => {
                const { data: goals } = await supabase
                    .from('study_goals')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (goals) {
                    set({
                        studyGoals: goals.map(g => ({
                            id: g.id,
                            name: g.name,
                            startDate: g.start_date,
                            endDate: g.end_date,
                            dailyTarget: g.daily_target,
                            focusTags: g.focus_tags || [],
                            status: g.status as StudyGoal['status'],
                            createdAt: g.created_at
                        }))
                    });
                }
            },

            createGoal: async (goalData) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('study_goals')
                    .insert({
                        user_id: user.id,
                        name: goalData.name,
                        start_date: goalData.startDate,
                        end_date: goalData.endDate,
                        daily_target: goalData.dailyTarget,
                        focus_tags: goalData.focusTags,
                        status: 'ACTIVE'
                    })
                    .select()
                    .single();

                if (!error && data) {
                    set(state => ({
                        studyGoals: [{
                            id: data.id,
                            name: data.name,
                            startDate: data.start_date,
                            endDate: data.end_date,
                            dailyTarget: data.daily_target,
                            focusTags: data.focus_tags || [],
                            status: data.status as StudyGoal['status'],
                            createdAt: data.created_at
                        }, ...state.studyGoals]
                    }));
                }
            },

            updateGoal: async (goalId, updates) => {
                const dbUpdates: any = {};
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
                if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
                if (updates.dailyTarget !== undefined) dbUpdates.daily_target = updates.dailyTarget;
                if (updates.focusTags !== undefined) dbUpdates.focus_tags = updates.focusTags;
                if (updates.status !== undefined) dbUpdates.status = updates.status;

                const { error } = await supabase
                    .from('study_goals')
                    .update(dbUpdates)
                    .eq('id', goalId);

                if (!error) {
                    set(state => ({
                        studyGoals: state.studyGoals.map(g =>
                            g.id === goalId ? { ...g, ...updates } : g
                        )
                    }));
                }
            },

            deleteGoal: async (goalId) => {
                const { error } = await supabase.from('study_goals').delete().eq('id', goalId);
                if (!error) {
                    set(state => ({ studyGoals: state.studyGoals.filter(g => g.id !== goalId) }));
                }
            },

            getActiveGoal: () => {
                return get().studyGoals.find(g => g.status === 'ACTIVE') || null;
            },

            updateStudyLog: async (logId, updates) => {
                const dbUpdates: any = {};
                if (updates.perceivedDifficulty) dbUpdates.perceived_difficulty = updates.perceivedDifficulty;
                if (updates.reflection !== undefined) dbUpdates.reflection = updates.reflection;
                if (updates.concepts) dbUpdates.concepts = updates.concepts;
                if (updates.result) dbUpdates.result = updates.result;
                if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
                if (updates.problemTitle) dbUpdates.problem_title = updates.problemTitle;
                if (updates.elapsedTime !== undefined) dbUpdates.elapsed_time = updates.elapsedTime;
                if (updates.solvingMethod) dbUpdates.solving_method = updates.solvingMethod;
                if (updates.isFinished !== undefined) dbUpdates.is_finished = updates.isFinished;
                if (updates.language !== undefined) dbUpdates.language = updates.language;

                const { error } = await supabase.from('study_logs').update(dbUpdates).eq('id', logId);

                if (!error) {
                    const targetLog = get().studyLogs.find(l => l.id === logId);

                    if (updates.isFinished && targetLog) {
                        // 1. Update DB Review Plan
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session?.user) {
                            await supabase.from('review_plans').update({ status: 'COMPLETED' })
                                .eq('user_id', session.user.id)
                                .eq('problem_id', targetLog.problemId);
                        }

                        // 2. Update Local State Review Plan
                        set(state => ({
                            studyLogs: state.studyLogs.map(l => l.id === logId ? { ...l, ...updates } : l),
                            reviewPlans: state.reviewPlans.map(p =>
                                p.problemId === targetLog.problemId
                                    ? { ...p, status: updates.isFinished ? 'COMPLETED' : 'ACTIVE' }
                                    : p
                            )
                        }));
                    } else if (targetLog && updates.isFinished === false) {
                        // Handle un-finishing from library or detail view
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session?.user) {
                            await supabase.from('review_plans').update({ status: 'ACTIVE' })
                                .eq('user_id', session.user.id)
                                .eq('problem_id', targetLog.problemId);
                        }

                        set(state => ({
                            studyLogs: state.studyLogs.map(l => l.id === logId ? { ...l, ...updates } : l),
                            reviewPlans: state.reviewPlans.map(p =>
                                p.problemId === targetLog.problemId
                                    ? { ...p, status: 'ACTIVE' }
                                    : p
                            )
                        }));
                    } else {
                        set(state => ({ studyLogs: state.studyLogs.map(l => l.id === logId ? { ...l, ...updates } : l) }));
                    }
                }
            },

            deleteStudyLog: async (logId) => {
                const state = get();
                const logToDelete = state.studyLogs.find(l => l.id === logId);
                if (!logToDelete) return;

                const { error: deleteError } = await supabase.from('study_logs').delete().eq('id', logId);
                if (deleteError) {
                    console.error('Failed to delete study log:', deleteError);
                    return;
                }

                // Local filter
                const remainingLogs = state.studyLogs.filter(l => l.id !== logId);
                const problemLogs = remainingLogs.filter(l => l.problemId === logToDelete.problemId);

                if (problemLogs.length > 0) {
                    // Recalculate based on the latest remaining log
                    const latestLog = problemLogs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

                    const intervals = [1, 3, 7, 15, 30];
                    const nextStage = latestLog.stage + 1;
                    const nextInterval = intervals[nextStage] || 30;
                    const nextReviewAt = latestLog.result === 'SUCCESS'
                        ? new Date(new Date(latestLog.completedAt).getTime() + 1000 * 60 * 60 * 24 * nextInterval).toISOString()
                        : new Date(new Date(latestLog.completedAt).getTime() + 1000 * 60 * 60 * 24 * 1).toISOString();

                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('review_plans').update({
                            current_stage: latestLog.stage, // Status represents completion of this stage
                            next_review_at: nextReviewAt,
                            status: 'ACTIVE', // Fallback to active when any completion log is removed
                            last_completed_at: latestLog.completedAt
                        }).eq('user_id', session.user.id).eq('problem_id', logToDelete.problemId);
                    }

                    set(s => ({
                        studyLogs: remainingLogs,
                        reviewPlans: s.reviewPlans.map(p => p.problemId === logToDelete.problemId ? {
                            ...p,
                            currentStage: latestLog.stage,
                            nextReviewAt,
                            status: 'ACTIVE',
                            lastCompletedAt: latestLog.completedAt
                        } : p)
                    }));
                } else {
                    // No logs left -> Remove review plan
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('review_plans').delete()
                            .eq('user_id', session.user.id)
                            .eq('problem_id', logToDelete.problemId);
                    }
                    set(s => ({
                        studyLogs: remainingLogs,
                        reviewPlans: s.reviewPlans.filter(p => p.problemId !== logToDelete.problemId)
                    }));
                }

                await get().refreshRating();
            },

            // Pagination Logic
            libraryPage: 1,
            libraryTotalSize: 0,
            libraryProblems: [],

            fetchLibraryPage: async (userId, page, size, sortBy = 'RECENT', filter) => {
                const start = (page - 1) * size;
                const end = start + size - 1;

                // 1. Get ReviewPlans for current page (Pagination Target)
                let query = supabase
                    .from('review_plans')
                    .select('*', { count: 'exact' })
                    .eq('user_id', userId);

                // --- Apply Filters ---
                if (filter?.platform) {
                    query = query.eq('platform', filter.platform);
                }
                if (filter?.stage !== undefined && filter?.stage !== null) {
                    query = query.eq('current_stage', filter.stage);
                }
                if (filter?.startDate) {
                    query = query.gte('last_completed_at', filter.startDate);
                }
                if (filter?.endDate) {
                    query = query.lte('last_completed_at', filter.endDate);
                }
                if (filter?.query) {
                    // Search by Title OR Problem ID
                    query = query.or(`problem_title.ilike.%${filter.query}%,problem_id.ilike.%${filter.query}%`);
                }

                // Server-side Sorting
                if (sortBy === 'DIFFICULTY') {
                    // Note: Difficulty sorting might need mapping if alphabetical isn't desired, but strings work loosely
                    query = query.order('difficulty', { ascending: false });
                } else {
                    query = query.order('last_completed_at', { ascending: false });
                }

                const { data: plans, count } = await query.range(start, end);

                if (plans && plans.length > 0) {
                    const problemIds = plans.map(p => p.problem_id);

                    // 2. Fetch ALL logs for these problems to ensure we have full history for stats
                    const { data: logs } = await supabase
                        .from('study_logs')
                        .select('*')
                        .in('problem_id', problemIds)
                        .order('created_at', { ascending: false });

                    if (logs) {
                        set({
                            libraryPage: page,
                            libraryTotalSize: count || 0,
                            libraryProblems: logs.map(l => ({
                                id: l.id,
                                problemId: l.problem_id,
                                problemTitle: l.problem_title || l.problem_id,
                                platform: l.site as Platform,
                                difficulty: l.difficulty || '',
                                perceivedDifficulty: l.perceived_difficulty as any,
                                result: l.result as any,
                                solvingMethod: l.solving_method as any,
                                elapsedTime: l.elapsed_time || 0,
                                reflection: l.reflection || l.feeling || '',
                                approach: l.approach || '',
                                concepts: l.concepts || [],
                                completedAt: l.created_at,
                                stage: l.stage || 0,
                                ratingContribution: l.rating_contribution || 0,
                                isFinished: l.is_finished || false,
                                language: l.language || undefined
                            }))
                        });
                    }
                } else {
                    set({
                        libraryPage: page,
                        libraryTotalSize: count || 0,
                        libraryProblems: []
                    });
                }
            },

            addStudyLog: async (logData) => {
                const state = get();
                const isFinished = logData.isFinished !== undefined ? logData.isFinished : (logData.problemId.startsWith('custom-') ? true : false);
                const existingPlan = state.reviewPlans.find(p => p.problemId === logData.problemId);

                // --- Smart Stage Logic ---
                // Ebbinghaus Curve Intervals (days): 1 -> 3 -> 7 -> 15 -> 30
                const intervals = [1, 3, 7, 15, 30];
                let nextStage = 0;

                if (!existingPlan) {
                    // 1. New Problem
                    nextStage = 0;
                } else if (isFinished) {
                    // 2-a. Manual Finish (Graduation)
                    nextStage = existingPlan ? existingPlan.currentStage : 0;
                    // Will force status COMPLETED later
                } else if (logData.result === 'FAIL') {
                    // 2-b. Failed Review -> Reset to Stage 0
                    nextStage = 0;
                } else if (existingPlan?.nextReviewAt) {
                    // 3. Successful Review
                    const now = new Date().getTime();
                    const due = new Date(existingPlan.nextReviewAt).getTime();
                    const diffHours = (due - now) / (1000 * 60 * 60);

                    // Threshold: If more than 12 hours remains until review, it's "Early"
                    if (diffHours > 12) {
                        nextStage = existingPlan.currentStage; // Maintain Stage
                    } else {
                        // Regular Review (Due or Overdue)
                        nextStage = existingPlan.currentStage + 1;
                    }
                } else {
                    // Fallback for edge cases (shouldn't happen with existingPlan check)
                    nextStage = existingPlan ? existingPlan.currentStage + 1 : 0;
                }

                const nextInterval = intervals[nextStage] || 30; // Max 30 days

                // Next Review Date is ALWAYS calculated from NOW
                // If early: "Reset clock" for current stage
                // If regular: "Start clock" for next stage
                const nextReviewAt = logData.result === 'SUCCESS'
                    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * nextInterval).toISOString()
                    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(); // Fail -> 1 day retry

                const earnedRating = logData.ratingContribution || calculateEarnedXp(logData.platform, logData.difficulty, state.level);

                const newLog: StudyLog = {
                    ...logData,
                    id: Math.random().toString(36).substr(2, 9),
                    completedAt: new Date().toISOString(),
                    stage: nextStage,
                    ratingContribution: earnedRating
                };

                // DB Sync (Pessimistic: Check DB First)
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // 1. Save Study Log
                    const { data: dbLog, error: logError } = await supabase.from('study_logs').insert({
                        user_id: session.user.id,
                        problem_id: newLog.problemId,
                        problem_title: newLog.problemTitle,
                        site: newLog.platform,
                        difficulty: newLog.difficulty,
                        perceived_difficulty: newLog.perceivedDifficulty,
                        result: newLog.result,
                        solving_method: newLog.solvingMethod,
                        elapsed_time: newLog.elapsedTime,
                        reflection: newLog.reflection,
                        approach: newLog.approach,
                        stage: newLog.stage,
                        rating_contribution: newLog.ratingContribution,
                        is_finished: isFinished,
                        language: logData.language || null
                    }).select().single();

                    if (logError || !dbLog) {
                        console.error('Failed to save study log:', logError);
                        throw new Error(logError?.message || '학습 생성에 실패했습니다.');
                    }

                    // Update local log with real DB ID
                    newLog.id = dbLog.id;

                    // 1-1. Auto-complete Daily Task if exists
                    if (isFinished) {
                        try {
                            await supabase
                                .from('daily_tasks')
                                .update({ status: 'completed' })
                                .eq('user_id', session.user.id)
                                .eq('problem_id', newLog.problemId)
                                .eq('status', 'pending');
                        } catch (err) {
                            console.error('Failed to auto-complete daily task:', err);
                        }
                    }

                    // 2. Update/Create Review Plan
                    await supabase.from('review_plans').upsert({
                        user_id: session.user.id,
                        problem_id: newLog.problemId,
                        problem_title: newLog.problemTitle,
                        platform: newLog.platform,
                        difficulty: newLog.difficulty,
                        current_stage: nextStage,
                        next_review_at: nextReviewAt,
                        status: (isFinished || nextStage >= 5) ? 'COMPLETED' : 'ACTIVE',
                        last_completed_at: newLog.completedAt
                    }, { onConflict: 'user_id,problem_id' });
                }

                // Update Local State (Only if DB sync succeeded)
                set(s => {
                    const nextTimers = { ...s.timer.problemTimers };
                    delete nextTimers[logData.problemId];

                    let nextPlans = [...s.reviewPlans];
                    const existingPlan = s.reviewPlans.find(p => p.problemId === logData.problemId);

                    if (existingPlan) {
                        nextPlans = nextPlans.map(p => p.problemId === logData.problemId ? {
                            ...p,
                            currentStage: nextStage,
                            nextReviewAt,
                            lastCompletedAt: newLog.completedAt,
                            status: (isFinished || nextStage >= 5) ? 'COMPLETED' : 'ACTIVE'
                        } : p);
                    } else {
                        nextPlans.push({
                            id: Math.random().toString(36).substr(2, 9),
                            problemId: logData.problemId,
                            problemTitle: newLog.problemTitle,
                            platform: newLog.platform,
                            difficulty: newLog.difficulty,
                            currentStage: nextStage,
                            nextReviewAt,
                            status: 'ACTIVE',
                            lastCompletedAt: newLog.completedAt
                        });
                    }

                    // Update Daily Tasks Status if Finished
                    let updatedDailyTasks = s.dailyTasks;
                    if (isFinished) {
                        updatedDailyTasks = s.dailyTasks.map(t =>
                            ((t.problemId === logData.problemId || t.problemTitle === logData.problemTitle) && t.status === 'pending')
                                ? { ...t, status: 'completed' as const }
                                : t
                        );
                    }

                    return {
                        studyLogs: [newLog, ...s.studyLogs],
                        reviewPlans: nextPlans,
                        dailyTasks: updatedDailyTasks,
                        timer: { ...s.timer, problemTimers: nextTimers },
                        points: s.points + earnedRating
                    };
                });

                await get().refreshRating();

                if (session?.user) {
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

            startTimer: async (problemId) => {
                const { timer } = get();
                if (timer.isRunning && timer.currentProblemId !== problemId) return false;

                const startTime = Date.now();
                let activeLogId: string | null = null;

                // Optimistic Start
                set(state => ({
                    timer: {
                        ...state.timer,
                        isRunning: true,
                        startTime,
                        currentProblemId: problemId,
                        activeLogId: null // Pending
                    }
                }));

                // DB에 시작 기록 생성
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    try {
                        const { data, error } = await supabase
                            .from('timer_logs')
                            .insert({
                                user_id: user.id,
                                problem_id: problemId,
                                start_time: new Date(startTime).toISOString()
                            })
                            .select()
                            .single();

                        if (!error && data) {
                            activeLogId = data.id;
                            // Update with real ID
                            set(state => ({
                                timer: {
                                    ...state.timer,
                                    activeLogId
                                }
                            }));
                        } else {
                            console.error('Failed to start timer log:', error);
                        }
                    } catch (err) {
                        console.error('Timer start exception:', err);
                    }
                }
                return true;
            },

            stopTimer: async () => {
                const { timer } = get();
                if (!timer.isRunning) return;

                const now = Date.now();
                const startTime = timer.startTime || now; // Fallback to now if missing (0 duration)
                const delta = now - startTime;
                const activeLogId = timer.activeLogId;
                const currentProblemId = timer.currentProblemId;

                // 1. 서버 부하 최적화: 1초 미만은 무시 (실수 방지)
                // startTime이 없으면(0초) 무조건 삭제됨
                if (delta < 1000) {
                    set(state => ({
                        timer: {
                            ...state.timer,
                            isRunning: false,
                            startTime: null,
                            activeLogId: null
                        }
                    }));

                    if (activeLogId) {
                        try {
                            await supabase.from('timer_logs').delete().eq('id', activeLogId);
                        } catch (err) {
                            console.error('Failed to delete short timer log:', err);
                        }
                    }
                    return;
                }

                // 2. 정상 종료 (Optimistic Update)
                set(state => ({
                    timer: {
                        ...state.timer,
                        isRunning: false,
                        startTime: null,
                        activeLogId: null,
                        problemTimers: {
                            ...state.timer.problemTimers,
                            [currentProblemId!]: (state.timer.problemTimers[currentProblemId!] || 0) + delta
                        }
                    }
                }));

                // DB에 종료 및 시간 기록 (Background)
                if (activeLogId) {
                    try {
                        await supabase
                            .from('timer_logs')
                            .update({
                                end_time: new Date().toISOString(),
                                duration_ms: delta
                            })
                            .eq('id', activeLogId);
                    } catch (err) {
                        console.error('Failed to save timer log:', err);
                    }
                }
            },

            resetTimer: async (problemId) => {
                const targetId = problemId || get().timer.currentProblemId;
                if (!targetId) return;

                // DB 기록 삭제
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('timer_logs').delete().eq('user_id', user.id).eq('problem_id', targetId);
                }

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
                            activeLogId: isTargetActive ? null : state.timer.activeLogId,
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
                const getLocalDate = (date: Date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                const today = getLocalDate(new Date());
                const solvedCount = get().studyLogs.filter(log => {
                    const logDate = new Date(log.completedAt);
                    return getLocalDate(logDate) === today && (log.stage === 0 || !log.stage);
                }).length;

                const activeGoal = get().getActiveGoal();
                const goalCount = activeGoal ? activeGoal.dailyTarget : get().recommendationSettings.dailyTargetFallback;

                return { solved: solvedCount, goal: goalCount };
            },

            getDaysRemaining: () => {
                const activeGoal = get().getActiveGoal();
                if (activeGoal) {
                    const target = new Date(activeGoal.endDate).getTime();
                    const today = new Date().setHours(0, 0, 0, 0);
                    return Math.max(0, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
                }

                return 0;
            },

            getStreak: () => {
                const logs = get().studyLogs;
                const goals = get().studyGoals;
                const fallback = get().recommendationSettings.dailyTargetFallback;

                const getLocalDate = (date: Date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const checkAchievement = (date: Date) => {
                    const dateStr = getLocalDate(date);
                    const solved = logs.filter(log => {
                        const logDate = new Date(log.completedAt);
                        return getLocalDate(logDate) === dateStr && (log.stage === 0 || !log.stage);
                    }).length;

                    const goal = goals.find(g => dateStr >= g.startDate && dateStr <= g.endDate)?.dailyTarget ?? fallback;
                    return solved >= goal;
                };

                let streak = 0;
                const today = new Date();

                // If today is achieved, start from today
                if (checkAchievement(today)) {
                    streak = 1;
                    const d = new Date(today);
                    while (true) {
                        d.setDate(d.getDate() - 1);
                        if (checkAchievement(d)) streak++;
                        else break;
                        if (streak > 365) break; // Safety break
                    }
                } else {
                    // Check if streak is alive at yesterday
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (checkAchievement(yesterday)) {
                        streak = 1;
                        const d = new Date(yesterday);
                        while (true) {
                            d.setDate(d.getDate() - 1);
                            if (checkAchievement(d)) streak++;
                            else break;
                            if (streak > 365) break;
                        }
                    }
                }

                return streak;
            },

            watchAdAndEarnGold: async () => {
                const now = new Date().toISOString();
                set(state => ({
                    points: state.points + 100,
                    lastAdWatchTime: now
                }));
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await get().saveProfile(user.id);
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

            toggleEquip: (itemId, slot, category) => {
                const state = get();
                const isCurrentlyEquipped = state.equippedItems.includes(itemId);

                const itemAsset = AVATAR_ASSETS[itemId];
                const targetSlot = slot || itemAsset?.slot;
                const targetCategory = category || SHOP_ITEMS.find(i => i.id === itemId)?.category;

                let nextEquipped: string[];

                if (isCurrentlyEquipped) {
                    // 해제하기
                    nextEquipped = state.equippedItems.filter(id => id !== itemId);
                } else {
                    // 착용하기: 같은 카테고리의 다른 아이템들 제거
                    nextEquipped = state.equippedItems.filter(id => {
                        // 1. 같은 카테고리면 제거 (사용자 요청: 한 카테고리에서 하나만)
                        if (targetCategory) {
                            const otherItemCategory = SHOP_ITEMS.find(i => i.id === id)?.category;
                            if (otherItemCategory === targetCategory) return false;
                        }

                        // 2. 같은 슬롯이면 제거 (슬롯이 head, clothes인 경우만 강제)
                        // 가구(FURNITURE)와 장식(DECO)은 위치가 다르므로 같은 ground 슬롯이라도 허용
                        const asset = AVATAR_ASSETS[id];
                        if (targetSlot && asset?.slot === targetSlot) {
                            if (['head', 'clothes'].includes(targetSlot)) return false;
                        }

                        return true;
                    });
                    nextEquipped.push(itemId);
                }

                // DB 동기화
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                        const toEquip = nextEquipped.filter(id => !state.equippedItems.includes(id));
                        const toUnequip = state.equippedItems.filter(id => !nextEquipped.includes(id));

                        if (toUnequip.length > 0) {
                            supabase.from('user_assets')
                                .update({ is_equipped: false })
                                .eq('user_id', user.id)
                                .in('asset_id', toUnequip)
                                .then();
                        }
                        if (toEquip.length > 0) {
                            supabase.from('user_assets')
                                .update({ is_equipped: true })
                                .eq('user_id', user.id)
                                .in('asset_id', toEquip)
                                .then();
                        }
                    }
                });

                set({ equippedItems: nextEquipped });
            }
        }),
        {
            name: 'cote-coach-user-storage',
            version: 7, // Plan & Settings Separation
            partialize: (state) => ({
                timer: state.timer,
                inventory: state.inventory,
                equippedItems: state.equippedItems,
                points: state.points
            }),
            migrate: (_persistedState: any, _version: number) => {
                // Migration logic if needed
                return _persistedState;
            }
        }
    )
);
