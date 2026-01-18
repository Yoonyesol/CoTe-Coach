import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { TrendingUp, Brain, Timer, History } from 'lucide-react';
import clsx from 'clsx';

// Existing components
// Existing components from src/components/stats/
import XPChart from '../components/stats/XPChart';
import SkillRadar from '../components/stats/SkillRadar';
import ActivityBar from '../components/stats/ActivityBar';
import LearningHeatmap from '../components/stats/LearningHeatmap';
import LevelUpCard from '../components/stats/LevelUpCard';
import PlatformDonut from '../components/stats/PlatformDonut';
import SuccessRateBar from '../components/stats/SuccessRateBar';
import SolvingTimeChart from '../components/stats/SolvingTimeChart';
import MaturityChart from '../components/stats/MaturityChart';
import ReviewDefenseRate from '../components/stats/ReviewDefenseRate';
import StatsEmptyState from '../components/stats/StatsEmptyState';

type TabType = 'GROWTH' | 'PATTERN' | 'EFFICIENCY' | 'RETENTION';

const StatsView: React.FC = () => {
    const { studyLogs, bojRating } = useUserStore();
    const [activeTab, setActiveTab] = useState<TabType>('GROWTH');

    const tabs = [
        { id: 'GROWTH', label: '성장', icon: TrendingUp, color: 'text-misty-dark', bg: 'bg-misty-light/30' },
        { id: 'PATTERN', label: '분석', icon: Brain, color: 'text-lavender-dark', bg: 'bg-lavender-light/30' },
        { id: 'EFFICIENCY', label: '효율', icon: Timer, color: 'text-sage-dark', bg: 'bg-sage-light/30' },
        { id: 'RETENTION', label: '복습', icon: History, color: 'text-coral-dark', bg: 'bg-coral-light/30' },
    ] as const;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Tab Navigation */}
            <div className="flex gap-1.5 sm:gap-2 p-1 bg-base-100/50 rounded-2xl w-full sm:w-fit self-center lg:self-start">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 cursor-pointer flex-1 sm:flex-initial",
                                isActive
                                    ? `bg-white shadow-lg ${tab.color} scale-105`
                                    : "text-base-400 hover:text-base-600 hover:bg-white/50"
                            )}
                        >
                            <Icon className={clsx("w-4 h-4", isActive ? tab.color : "text-base-300")} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {studyLogs.length === 0 ? (
                    <StatsEmptyState />
                ) : (
                    <>
                        {activeTab === 'GROWTH' && (
                            <div className="flex flex-col gap-6 animate-in zoom-in-95 fade-in duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[320px]">
                                    <LearningHeatmap studyLogs={studyLogs} />
                                    <LevelUpCard />
                                </div>
                                <XPChart studyLogs={studyLogs} bojRating={bojRating} />
                            </div>
                        )}

                        {activeTab === 'PATTERN' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in zoom-in-95 fade-in duration-500">
                                <SkillRadar studyLogs={studyLogs} />
                                <PlatformDonut studyLogs={studyLogs} />
                                <div className="lg:col-span-2">
                                    <SuccessRateBar studyLogs={studyLogs} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'EFFICIENCY' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in zoom-in-95 fade-in duration-500">
                                <ActivityBar studyLogs={studyLogs} />
                                <SolvingTimeChart studyLogs={studyLogs} />
                            </div>
                        )}

                        {activeTab === 'RETENTION' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in zoom-in-95 fade-in duration-500">
                                <MaturityChart />
                                <ReviewDefenseRate />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StatsView;
