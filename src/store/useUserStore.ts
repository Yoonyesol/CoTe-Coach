import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

import { Platform, UserState } from '../types/user';
import { StudyPlan, RecommendationSettings, StudyLog, StudyGoal } from '../types/study';

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
            reviewPlans: [],
            studyGoals: [],

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

                await get().fetchReviewPlans(userId);

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
                if (updates.elapsedTime !== undefined) dbUpdates.elapsed_time = updates.elapsedTime;
                if (updates.solvingMethod) dbUpdates.solving_method = updates.solvingMethod;

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
                                    ? { ...p, status: 'COMPLETED' }
                                    : p
                            )
                        }));
                    } else {
                        set(state => ({ studyLogs: state.studyLogs.map(l => l.id === logId ? { ...l, ...updates } : l) }));
                    }
                }
            },

            deleteStudyLog: async (logId) => {
                const { error } = await supabase.from('study_logs').delete().eq('id', logId);
                if (!error) {
                    set(state => ({ studyLogs: state.studyLogs.filter(l => l.id !== logId) }));
                }
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
                                isFinished: l.is_finished || false
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
                const existingPlan = state.reviewPlans.find(p => p.problemId === logData.problemId);

                // --- Smart Stage Logic ---
                // Ebbinghaus Curve Intervals (days): 1 -> 3 -> 7 -> 15 -> 30
                const intervals = [1, 3, 7, 15, 30];
                let nextStage = 0;
                let isEarlyReview = false;

                if (!existingPlan) {
                    // 1. New Problem
                    nextStage = 0;
                } else if (logData.isFinished) {
                    // 2-a. Manual Finish (Graduation)
                    isEarlyReview = false;
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
                        isEarlyReview = true;
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
                    const { error: logError } = await supabase.from('study_logs').insert({
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
                        concepts: newLog.concepts,
                        stage: newLog.stage,
                        rating_contribution: newLog.ratingContribution
                    });

                    if (logError) {
                        console.error('Failed to save study log:', logError);
                        throw new Error(logError.message || '학습 생성에 실패했습니다.');
                    }

                    // 2. Save/Update Review Plan
                    await supabase.from('review_plans').upsert({
                        user_id: session.user.id,
                        problem_id: newLog.problemId,
                        problem_title: newLog.problemTitle,
                        platform: newLog.platform,
                        difficulty: newLog.difficulty,
                        current_stage: nextStage,
                        next_review_at: nextReviewAt,
                        status: (logData.isFinished || nextStage >= 5) ? 'COMPLETED' : 'ACTIVE',
                        last_completed_at: newLog.completedAt
                    }, { onConflict: 'user_id,problem_id' });

                    await get().saveProfile(session.user.id);
                }

                // Update Local State (Only if DB sync succeeded)
                set(s => {
                    const nextTimers = { ...s.timer.problemTimers };
                    delete nextTimers[logData.problemId];

                    let nextPlans = [...s.reviewPlans];
                    if (existingPlan) {
                        nextPlans = nextPlans.map(p => p.problemId === logData.problemId ? {
                            ...p,
                            currentStage: nextStage,
                            nextReviewAt,
                            lastCompletedAt: newLog.completedAt,
                            status: (logData.isFinished || nextStage >= 5) ? 'COMPLETED' : 'ACTIVE'
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

                    return {
                        studyLogs: [newLog, ...s.studyLogs],
                        reviewPlans: nextPlans,
                        timer: { ...s.timer, problemTimers: nextTimers }
                    };
                });

                await get().refreshRating();
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
                const getLocalDate = (date: Date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                const today = getLocalDate(new Date());
                const solvedCount = get().studyLogs.filter(log => {
                    const logDate = new Date(log.completedAt);
                    return getLocalDate(logDate) === today;
                }).length;
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

