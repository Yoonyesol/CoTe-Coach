import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { SkeletonProps } from '../../types/components';

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={cn("animate-pulse bg-base-100 rounded-2xl", className)} />
    );
};

export const ProblemCardSkeleton = () => (
    <div className="glass-card h-64 p-6 space-y-4 animate-pulse bg-white border-none shadow-sm">
        <div className="flex justify-between items-start">
            <div className="w-20 h-5 bg-base-100 rounded-lg" />
            <div className="w-12 h-6 bg-base-100 rounded-full" />
        </div>
        <div className="space-y-2">
            <div className="w-full h-6 bg-base-100 rounded-lg" />
            <div className="w-2/3 h-6 bg-base-100 rounded-lg" />
        </div>
        <div className="flex gap-2">
            <div className="w-12 h-5 bg-base-100 rounded-lg" />
            <div className="w-12 h-5 bg-base-100 rounded-lg" />
        </div>
        <div className="pt-4 flex justify-between">
            <div className="w-24 h-8 bg-base-100 rounded-xl" />
            <div className="w-8 h-8 bg-base-100 rounded-lg" />
        </div>
    </div>
);

export const StatSkeleton = () => (
    <div className="glass-card p-6 border-none animate-pulse bg-white shadow-sm space-y-2">
        <div className="w-20 h-3 bg-base-50 rounded" />
        <div className="w-32 h-8 bg-base-100 rounded-lg" />
    </div>
);

export const ProfileHeaderSkeleton = () => (
    <div className="flex justify-between items-center py-2 animate-pulse">
        <div className="space-y-2">
            <div className="w-48 h-10 bg-base-100 rounded-2xl" />
            <div className="w-64 h-4 bg-base-50 rounded-lg" />
        </div>
        <div className="flex gap-3">
            <div className="w-12 h-12 bg-base-100 rounded-2xl" />
            <div className="w-32 h-12 bg-base-100 rounded-2xl" />
        </div>
    </div>
);

export const DailyPlannerSkeleton = () => (
    <div className="glass-card p-8 border-none bg-white shadow-xl animate-pulse space-y-8">
        <div className="flex flex-col lg:row gap-8 items-center">
            <div className="w-32 h-32 bg-base-100 rounded-full" />
            <div className="flex-1 space-y-4 w-full">
                <div className="h-6 bg-base-100 rounded-lg w-1/3" />
                <div className="h-4 bg-base-50 rounded-lg w-2/3" />
                <div className="flex gap-4">
                    <div className="w-32 h-10 bg-base-50 rounded-xl" />
                    <div className="w-32 h-10 bg-base-50 rounded-xl" />
                </div>
            </div>
            <div className="w-40 h-14 bg-base-100 rounded-2xl" />
        </div>
        <div className="pt-6 border-t border-base-100 flex gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                    <div className="w-8 h-8 bg-base-50 rounded-full" />
                    <div className="w-8 h-2 bg-base-50 rounded" />
                </div>
            ))}
        </div>
    </div>
);

export const GoalBannerSkeleton = () => (
    <div className="glass-card p-6 border-none bg-base-50/50 shadow-sm mb-8 animate-pulse flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-base-100 rounded-2xl" />
            <div className="space-y-2">
                <div className="w-40 h-6 bg-base-100 rounded-lg" />
                <div className="w-32 h-4 bg-base-100 rounded-lg" />
            </div>
        </div>
        <div className="flex-1 max-w-md w-full space-y-2">
            <div className="flex justify-between">
                <div className="w-16 h-3 bg-base-100 rounded" />
                <div className="w-20 h-3 bg-base-100 rounded" />
            </div>
            <div className="w-full h-2 bg-base-100 rounded-full" />
        </div>
        <div className="flex gap-2">
            <div className="w-10 h-10 bg-base-100 rounded-xl" />
            <div className="w-20 h-10 bg-base-100 rounded-xl" />
        </div>
    </div>
);

export const ReviewNotificationsSkeleton = () => (
    <div className="glass-card p-6 border-none h-[400px] flex flex-col animate-pulse bg-white">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-base-100 rounded-2xl" />
                <div className="space-y-1.5">
                    <div className="w-32 h-5 bg-base-100 rounded-lg" />
                    <div className="w-20 h-3 bg-base-100 rounded" />
                </div>
            </div>
        </div>
        <div className="space-y-3 flex-1">
            {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-2xl border border-base-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-base-100 rounded-xl" />
                        <div className="space-y-1.5">
                            <div className="w-16 h-2 bg-base-100 rounded" />
                            <div className="w-32 h-4 bg-base-100 rounded-lg" />
                        </div>
                    </div>
                    <div className="w-8 h-8 bg-base-100 rounded-xl" />
                </div>
            ))}
        </div>
    </div>
);

export const DailyHistorySkeleton = () => (
    <div className="space-y-6 animate-pulse mt-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="space-y-2">
                <div className="w-48 h-8 bg-base-100 rounded-xl" />
                <div className="w-64 h-4 bg-base-50 rounded-lg" />
            </div>
            <div className="w-48 h-12 bg-base-50 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-6 bg-white border-none shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="w-12 h-4 bg-base-50 rounded" />
                                <div className="w-12 h-4 bg-base-50 rounded" />
                            </div>
                            <div className="w-32 h-6 bg-base-100 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-16 h-6 bg-base-50 rounded-lg" />
                        <div className="w-16 h-6 bg-base-50 rounded-lg" />
                    </div>
                    <div className="w-full h-12 bg-base-50 rounded-xl" />
                </div>
            ))}
        </div>
    </div>
);

export const SectionHeaderSkeleton = () => (
    <div className="flex justify-between items-end animate-pulse mb-6">
        <div className="space-y-2">
            <div className="w-56 h-8 bg-base-100 rounded-xl" />
            <div className="w-72 h-4 bg-base-50 rounded-lg" />
        </div>
        <div className="flex gap-2">
            <div className="w-20 h-10 bg-base-50 rounded-xl" />
            <div className="w-32 h-10 bg-base-50 rounded-xl" />
        </div>
    </div>
);

export const SidebarSkeleton = () => (
    <div className="p-8 flex flex-col h-full animate-pulse">
        <div className="flex justify-between items-center mb-12">
            <div className="w-32 h-6 bg-base-100 rounded-lg" />
            <div className="w-8 h-8 rounded-lg bg-base-100" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="w-48 h-48 bg-base-100 rounded-full mb-8" />

            <div className="w-full space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <div className="w-24 h-3 bg-base-100 rounded" />
                    <div className="w-48 h-8 bg-base-100 rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-base-100 rounded-2xl" />
                    <div className="h-20 bg-base-100 rounded-2xl" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="w-16 h-3 bg-base-100 rounded" />
                        <div className="w-10 h-3 bg-base-100 rounded" />
                    </div>
                    <div className="w-full h-2 bg-base-100 rounded-full" />
                </div>
            </div>
        </div>

        <div className="mt-8 space-y-4">
            <div className="w-full h-24 bg-base-100 rounded-2xl" />
            <div className="flex justify-center">
                <div className="w-32 h-10 bg-base-100 rounded-xl" />
            </div>
        </div>
    </div>
);
