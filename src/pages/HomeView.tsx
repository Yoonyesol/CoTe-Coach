import React, { useState } from 'react';
import { Target, RefreshCw, Plus, Settings2 } from 'lucide-react';
import clsx from 'clsx';
import {
    ProfileHeaderSkeleton,
    DailyPlannerSkeleton,
    SectionHeaderSkeleton,
    GoalBannerSkeleton,
    ReviewNotificationsSkeleton,
    ProblemCardSkeleton
} from '../components/common/Skeleton';
import GoalBanner from '../components/home/GoalBanner';
import DailyPlanner from '../components/home/DailyPlanner';
import ReviewNotifications from '../components/home/ReviewNotifications';
import ProblemCard from '../components/problems/ProblemCard';
import CustomProblemCard from '../components/problems/CustomProblemCard';
import DailyHistory from '../components/home/DailyHistory';
import { StudyLog, DailyTask } from '../types/study';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { useRecommendations } from '../hooks/useRecommendations';

interface HomeViewProps {
    isLoading: boolean;
    onDailyGoalOpen: () => void;
    onAddModalOpen: () => void;
    onGoalModalOpen: () => void;
    onRecommendationSettingsOpen: () => void;
    onReviewOpen: (problem: { id?: string, title: string, platform: string, difficulty: string }) => void;
    onReviewDetailOpen: (plan: any) => void;
    onEditLog: (log: StudyLog) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
    isLoading,
    onDailyGoalOpen,
    onAddModalOpen,
    onGoalModalOpen,
    onRecommendationSettingsOpen,
    onReviewOpen,
    onReviewDetailOpen,
    onEditLog
}) => {
    const {
        getDailyProgress,
        getDaysRemaining,
        refreshRecommendations,
        dailyTasks,
        getStreak,
        nickname
    } = useUserStore();
    const { user } = useAuthStore();
    const { data: recommendations, isLoading: isRecsLoading, isFetching: isRecsFetching, refetch } = useRecommendations();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLocalRefreshing, setIsLocalRefreshing] = useState(false);

    const dailyProgress = getDailyProgress();
    const daysRemaining = getDaysRemaining();
    const email = user?.email || '';

    return (
        <>
            {isLoading ? (
                <ProfileHeaderSkeleton />
            ) : (
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2 min-w-0 flex-1">
                        <h1 className="text-2xl md:text-3xl font-black text-base-900 leading-tight truncate">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4 font-sans">{nickname || email.split('@')[0]}님!</span></h1>
                        <div className="text-xs md:text-sm font-medium text-base-400 font-sans flex items-center gap-1.5 flex-wrap">
                            <span>오늘의 목표인</span>
                            <button
                                onClick={onDailyGoalOpen}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-base-50 text-base-600 rounded-md font-sans font-black hover:bg-misty-dark hover:text-white transition-all cursor-pointer border border-base-100/50 group"
                                title="클릭하여 목표 변경"
                            >
                                <span>{dailyProgress.goal}문제</span>
                            </button>
                            <span>중 {dailyProgress.solved}문제를 해결하셨어요!</span>
                            <span className="font-bold text-base-600 italic whitespace-nowrap">{dailyProgress.solved >= dailyProgress.goal ? '축하드려요! 🎉' : '조금만 더 힘내보아요! 🔥'}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto shrink-0">
                        <button
                            onClick={onDailyGoalOpen}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-base-200 text-base-600 rounded-2xl font-black hover:bg-base-50 transition-all active:scale-95 shadow-sm font-sans text-sm cursor-pointer whitespace-nowrap"
                            title="클릭하여 목표 변경"
                        >
                            <Target className="w-4 h-4 text-misty-dark" />
                            <span>하루 목표</span>
                        </button>
                        <button
                            onClick={onAddModalOpen}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-base-900 text-white rounded-2xl font-black hover:bg-base-800 transition-all active:scale-95 shadow-xl font-sans cursor-pointer text-sm whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            <span>문제 추가</span>
                        </button>
                    </div>
                </header>
            )}

            {/* Goal Banner */}
            {isLoading ? (
                <GoalBannerSkeleton />
            ) : (
                <GoalBanner onOpenGoalModal={onGoalModalOpen} />
            )}

            {/* Main Activity Row: Planner & Reviews */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                {/* Daily Planner Section */}
                {isLoading ? (
                    <DailyPlannerSkeleton />
                ) : (
                    <DailyPlanner
                        solvedCount={dailyProgress.solved}
                        goalCount={dailyProgress.goal}
                        daysRemaining={daysRemaining}
                        streak={getStreak()}
                    />
                )}

                {/* Review Notifications Section */}
                {isLoading ? (
                    <ReviewNotificationsSkeleton />
                ) : (
                    <ReviewNotifications onPlanClick={onReviewDetailOpen} />
                )}
            </div>

            {/* Recommendation Section */}
            <section className="space-y-6">
                {isLoading || isRecsLoading ? (
                    <SectionHeaderSkeleton />
                ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6">
                        <div className="space-y-1">
                            <h2 className="text-xl md:text-2xl font-black text-base-800 flex items-center gap-2 font-sans flex-wrap">
                                오늘의 추천 리스트
                                <span className="text-[10px] md:text-sm font-bold bg-wheat px-2 py-0.5 rounded-lg text-wheat-dark leading-none">
                                    {recommendations?.length || 0} PROBLEMS
                                </span>
                            </h2>
                            <p className="text-xs md:text-sm font-medium text-base-400 font-sans">
                                사용자님의 레벨에 맞춰 <span className="text-base-600 font-bold">워밍업부터 챌린지까지</span> 준비했어요!
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-white border border-base-200 rounded-xl text-xs md:text-sm font-black text-base-600 hover:bg-base-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm cursor-pointer group"
                                title="추천 필터 설정"
                                onClick={onRecommendationSettingsOpen}
                            >
                                <Settings2 className="w-4 h-4" />
                                <span>필터</span>
                            </button>
                            <button
                                onClick={async () => {
                                    setIsLocalRefreshing(true);
                                    setIsRefreshing(true);
                                    await refreshRecommendations();
                                    await refetch();
                                    setIsRefreshing(false);
                                    setIsLocalRefreshing(false);
                                }}
                                disabled={isLocalRefreshing || isRefreshing}
                                className="flex-[2] sm:flex-none px-3 md:px-4 py-2 bg-white border border-base-200 rounded-xl text-xs md:text-sm font-black text-base-600 hover:bg-base-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm cursor-pointer group disabled:opacity-50 min-w-max"
                            >
                                <RefreshCw className={clsx(
                                    "w-4 h-4 transition-transform duration-500 shrink-0",
                                    (isLocalRefreshing || isRefreshing) ? "animate-spin" : "group-hover:rotate-180"
                                )} />
                                <span className="whitespace-nowrap">{(isLocalRefreshing || isRefreshing) ? '섞는 중...' : '다른 문제 보기'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {isRecsLoading || isRecsFetching || isRefreshing || isLocalRefreshing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <ProblemCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {recommendations?.map((p, i) => (
                            <ProblemCard
                                key={i}
                                type={p.type}
                                title={p.title}
                                platform={p.platform}
                                difficulty={p.difficulty}
                                level={p.level}
                                tags={p.tags}
                                problemUrl={p.problemUrl}
                                onReview={onReviewOpen}
                            />
                        ))}
                        {recommendations?.length === 0 && (
                            <div className="col-span-full py-20 text-center glass-card border-dashed">
                                <p className="text-base-400 font-bold">추천할 수 있는 문제를 찾지 못했습니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {(() => {
                // Separate tasks by origin (Manual vs Auto)
                const manualTasks = dailyTasks.filter(t => t.status === 'pending' && !t.tags?.includes('__auto'));
                const autoTasks = dailyTasks.filter(t => t.status === 'pending' && t.tags?.includes('__auto'));

                if (manualTasks.length === 0 && autoTasks.length === 0) return null;

                const handleCompleteTask = (task: DailyTask) => {
                    onReviewOpen({
                        id: task.problemId,
                        title: task.problemTitle,
                        platform: task.site,
                        difficulty: task.difficulty,
                    });
                };

                return (
                    <>
                        {/* 1. Manual Custom List */}
                        {manualTasks.length > 0 && (
                            <section className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-base-800 flex items-center gap-2 font-sans">
                                        나만의 커스텀 리스트 <span className="text-sm font-bold bg-lavender px-2 py-0.5 rounded-lg text-lavender-dark leading-none">
                                            {manualTasks.length} PROBLEMS
                                        </span>
                                    </h2>
                                    <p className="text-sm font-medium text-base-400 mt-1 font-sans">
                                        직접 추가한 문제들이에요. 목표를 달성할 때까지 사라지지 않아요!
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {manualTasks.map((task) => (
                                        <CustomProblemCard
                                            key={task.id}
                                            task={task}
                                            onComplete={handleCompleteTask}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. Active Problems (Started via Timer) */}
                        {autoTasks.length > 0 && (
                            <section className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-base-800 flex items-center gap-2 font-sans">
                                        진행 중인 문제함 <span className="text-sm font-bold bg-misty-light px-2 py-0.5 rounded-lg text-misty-dark leading-none">
                                            {autoTasks.length} KEEP
                                        </span>
                                    </h2>
                                    <p className="text-sm font-medium text-base-400 mt-1 font-sans">
                                        풀이를 시작했던 문제들을 보관하고 있어요. 추천 리스트에서 사라져도 여기서 계속 풀 수 있어요.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {autoTasks.map((task) => (
                                        <CustomProblemCard
                                            key={task.id}
                                            task={task}
                                            onComplete={handleCompleteTask}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                );
            })()}

            {!isLoading && (
                <DailyHistory onEditLog={onEditLog} />
            )}
        </>
    );
};

export default HomeView;
