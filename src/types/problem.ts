import { Platform } from './user';

export type RecommendationType = 'WARM_UP' | 'MAIN' | 'CHALLENGE';

export interface SolvedAcProblem {
    problemId: number;
    titleKo: string;
    level: number;
    tags: {
        key: string;
        bojTagId: number;
        displayNames: { language: string; name: string; short: string }[];
    }[];
}

export interface RecommendedProblem {
    type: RecommendationType;
    title: string;
    platform: Platform | string;
    difficulty: string;
    level: number;
    tags: string[];
    problemUrl: string;
}
export interface StaticProblem {
    id: string;
    title: string;
    level: string | number;
    url: string;
    tags?: string[];
}
