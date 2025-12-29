import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SkeletonProps {
    className?: string;
}

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
