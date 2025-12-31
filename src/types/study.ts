import { Platform } from './user';

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
