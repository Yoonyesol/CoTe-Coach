import { Platform } from './user';

export type ReviewStatus = 'ACTIVE' | 'COMPLETED';
export type ReviewResult = 'SUCCESS' | 'FAIL';
export type SolvingMethod = 'SELF' | 'REFERENCE';
export type PerceivedDifficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface StudyPlan {
    targetTier: string;
    targetDate: string; // ISO String
    dailyIntensity: 'LOW' | 'NORMAL' | 'HIGH';
    problemCount: number;
}

export interface RecommendationSettings {
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    focusAlgorithms: string[];
    seedOffset: number;
    platforms: Platform[];
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
    problemTitle: string;
    platform: Platform;
    difficulty: string;
    perceivedDifficulty: PerceivedDifficulty;
    elapsedTime: number; // ms
    reflection: string; // 학습 소감
    approach: string; // 해결 방식 (예: 재귀, DFS)
    concepts: string[];
    completedAt: string; // ISO String
    result: ReviewResult;
    solvingMethod: SolvingMethod;
    stage: number; // 0: 최초, 1: 1차 복습...
    ratingContribution?: number;
}

export interface ReviewPlan {
    id: string;
    problemId: string;
    problemTitle: string;
    platform: Platform;
    difficulty: string;
    currentStage: number;
    nextReviewAt: string | null;
    status: ReviewStatus;
    lastCompletedAt: string;
}
