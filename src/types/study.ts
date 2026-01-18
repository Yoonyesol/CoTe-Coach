import { Platform } from './user';

export type ReviewStatus = 'ACTIVE' | 'COMPLETED';
export type ReviewResult = 'SUCCESS' | 'FAIL';
export type SolvingMethod = 'SELF' | 'REFERENCE';
export type PerceivedDifficulty = 'EASY' | 'NORMAL' | 'HARD';



export interface RecommendationSettings {
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    focusAlgorithms: string[];
    seedOffset: number;
    platforms: Platform[];
    recommendationCount: number; // AI 추천 문제 개수
    dailyTargetFallback: number; // 학습 목표 없을 때의 하루 권장 풀이량
}

export interface DailyTask {
    id: string;
    problemId: string;
    problemTitle: string;
    site: Platform;
    difficulty: string;
    status: 'pending' | 'completed';
    targetDate: string; // YYYY-MM-DD
    url?: string;
    tags?: string[];
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
    isFinished?: boolean; // 사용자가 직접 복습 완료(졸업)로 간주했는지 여부
    language?: string; // 추가된 필드: 사용 언어
    url?: string; // 추가된 필드: 문제 링크
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

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface StudyGoal {
    id: string;
    name: string;
    startDate: string;       // YYYY-MM-DD
    endDate: string;         // YYYY-MM-DD (D-Day)
    dailyTarget: number;     // 하루 목표 문제 수
    focusTags: string[];     // 집중할 알고리즘 태그
    status: GoalStatus;
    createdAt: string;
}

export interface GoldHistory {
    id: string;
    amount: number;
    balanceAfter: number;
    type: 'EARN' | 'SPEND' | 'RESET';
    reason: string;
    createdAt: string;
}
