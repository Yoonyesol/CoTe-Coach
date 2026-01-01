import { ReactNode } from 'react';
import { StudyLog } from './study';
import { RecommendationType } from './problem';

export interface TierBadgeProps {
    tier: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export interface BojTierBadgeProps {
    level: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export interface ProblemCardProps {
    type: RecommendationType;
    title: string;
    platform: string;
    difficulty: string;
    level: number;
    tags: string[];
    problemUrl: string;
    onReview: (problem: { title: string; platform: string; difficulty: string }) => void;
}

export interface MainLayoutProps {
    children: ReactNode;
    activeTab: 'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY';
    onTabChange: (tab: 'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY') => void;
    onAccountSettingsOpen: () => void;
    onTierClick?: () => void;
    isLoading?: boolean;
}

export interface DailyPlannerProps {
    solvedCount: number;
    goalCount: number;
    daysRemaining: number;
}

export interface DailyHistoryProps {
    onEditLog: (log: StudyLog) => void;
}

export interface SkeletonProps {
    className?: string;
}
