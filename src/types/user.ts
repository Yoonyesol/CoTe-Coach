import { RecommendationSettings, DailyTask, StudyLog, ReviewPlan, StudyGoal } from './study';
import { ShopItem } from './shop';

export type Platform = 'BOJ' | 'PROG' | 'LC' | 'SWEA';

export interface SolvedAcUser {
    handle: string;
    tier: number;
    rank: number;
    solvedCount: number;
    exp: number;
    rating: number;
}

export interface TimerState {
    isRunning: boolean;
    startTime: number | null;
    currentProblemId: string | null;
    problemTimers: Record<string, number>; // { [problemId]: totalMs }
}

export interface UserState {
    xp: number;
    level: number;
    points: number;
    tier: string;
    bojHandle: string;
    bojRating: number;

    recommendationSettings: RecommendationSettings;
    timer: TimerState;
    studyLogs: StudyLog[];
    inventory: string[];
    equippedItems: string[];
    dailyTasks: DailyTask[];
    reviewPlans: ReviewPlan[];
    studyGoals: StudyGoal[];

    // Actions
    addXp: (amount: number) => void;
    addPoints: (amount: number) => void;
    setBojHandle: (handle: string) => void;

    setRecommendationSettings: (settings: Partial<RecommendationSettings>) => void;
    calculateTier: (level: number) => string;
    syncSolvedAcTier: (tier: number) => Promise<void>;
    linkBojAccount: (handle: string, tier: number) => Promise<void>;
    unlinkBojAccount: () => void;
    resetProgress: () => Promise<void>;

    // Supabase Sync Actions
    fetchUserData: (userId: string) => Promise<void>;
    saveProfile: (userId: string) => Promise<void>;

    // Study Log Actions
    addStudyLog: (log: Omit<StudyLog, 'id' | 'completedAt' | 'stage'>) => Promise<void>;
    updateStudyLog: (logId: string, updates: Partial<StudyLog>) => Promise<void>;
    deleteStudyLog: (logId: string) => Promise<void>;

    // Daily Task Actions
    fetchDailyTasks: (userId: string) => Promise<void>;
    addDailyTask: (task: Omit<DailyTask, 'id' | 'status'>) => Promise<void>;
    toggleTaskStatus: (taskId: string) => Promise<void>;
    deleteDailyTask: (taskId: string) => Promise<void>;

    // Review Actions
    addReviewSession: (problemId: string, log: Omit<StudyLog, 'id' | 'completedAt' | 'stage'>) => Promise<void>;
    fetchReviewPlans: (userId: string) => Promise<void>;

    // Goal Actions
    fetchGoals: (userId: string) => Promise<void>;
    createGoal: (goal: Omit<StudyGoal, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateGoal: (goalId: string, updates: Partial<StudyGoal>) => Promise<void>;
    deleteGoal: (goalId: string) => Promise<void>;
    getActiveGoal: () => StudyGoal | null;

    // Library Pagination & Filtering
    libraryPage: number;
    libraryTotalSize: number;
    libraryProblems: StudyLog[];
    fetchLibraryPage: (
        userId: string,
        page: number,
        size: number,
        sortBy?: 'RECENT' | 'DIFFICULTY',
        filter?: {
            platform?: string;
            stage?: number;
            startDate?: string;
            endDate?: string;
            query?: string;
        }
    ) => Promise<void>;

    // Timer Actions
    startTimer: (problemId: string) => boolean;
    stopTimer: () => void;
    resetTimer: (problemId?: string) => void;
    getTotalElapsed: (problemId: string) => number;

    // Daily Planner Helpers (Derived State)
    getDailyProgress: () => { solved: number; goal: number };
    getDaysRemaining: () => number;

    // Shop Actions
    buyItem: (item: ShopItem) => boolean;
    toggleEquip: (itemId: string, slot?: string, category?: string) => void;

    // Helper to force recalculation
    refreshRating: () => Promise<void>;
    refreshRecommendations: () => Promise<void>;
    getStreak: () => number;
}
