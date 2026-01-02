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
import GoalBanner from '../components/GoalBanner';
import DailyPlanner from '../components/DailyPlanner';
import ReviewNotifications from '../components/ReviewNotifications';
import ProblemCard from '../components/ProblemCard';
import CustomProblemCard from '../components/CustomProblemCard';
import DailyHistory from '../components/DailyHistory';
import { StudyLog, DailyTask } from '../types/study';
import { getLocalDateString } from '../lib/dateUtils';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { useRecommendations } from '../hooks/useRecommendations';

interface HomeViewProps {
    isLoading: boolean;
    onDailyGoalOpen: () => void;
    onAddModalOpen: () => void;
    onGoalModalOpen: () => void;
    onReviewOpen: (problem: any) => void;
    onReviewDetailOpen: (plan: any) => void;
    onEditLog: (log: StudyLog) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
    isLoading,
    onDailyGoalOpen,
    onAddModalOpen,
    onGoalModalOpen,
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
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-base-900 leading-tight">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4 font-sans">{nickname || email.split('@')[0]}님!</span></h1>
                        <div className="text-sm font-medium text-base-400 mt-2 font-sans flex items-center gap-1.5 flex-wrap">
                            <span>오늘의 목표인</span>
                            <button
                                onClick={onDailyGoalOpen}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-base-50 text-base-600 rounded-md font-sans font-black hover:bg-misty-dark hover:text-white transition-all cursor-pointer border border-base-100/50 group"
                                title="클릭하여 목표 변경"
                            >
                                <span>{dailyProgress.goal}문제</span>
                            </button>
                            <span>중 {dailyProgress.solved}문제를 해결하셨어요! {dailyProgress.solved >= dailyProgress.goal ? '축하드려요! 🎉' : '조금만 더 힘내보아요! 🔥'}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onDailyGoalOpen}
                            className="flex items-center gap-2 px-4 py-3 bg-white border border-base-200 text-base-600 rounded-2xl font-black hover:bg-base-50 transition-all active:scale-95 shadow-sm font-sans text-sm cursor-pointer"
                            title="클릭하여 목표 변경"
                        >
                            <Target className="w-4 h-4 text-misty-dark" />
                            하루 목표
                        </button>
                        <button
                            onClick={onAddModalOpen}
                            className="flex items-center gap-2 px-5 py-3 bg-base-900 text-white rounded-2xl font-black hover:bg-base-800 transition-all active:scale-95 shadow-xl font-sans cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            문제 추가
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
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
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-black text-base-800 flex items-center gap-2 font-sans">
                                오늘의 추천 리스트 <span className="text-sm font-bold bg-wheat px-2 py-0.5 rounded-lg text-wheat-dark leading-none">
                                    {recommendations?.length || 0} PROBLEMS
                                </span>
                            </h2>
                            <p className="text-sm font-medium text-base-400 mt-1 font-sans">
                                사용자님의 레벨에 맞춰 <span className="text-base-600 font-bold">워밍업부터 챌린지까지</span> 준비했어요!
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2 bg-white border border-base-200 rounded-xl text-sm font-black text-base-600 hover:bg-base-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer group"
                                title="추천 필터 설정"
                                onClick={() => { }}
                            >
                                <Settings2 className="w-4 h-4" />
                                필터
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
                                className="px-4 py-2 bg-white border border-base-200 rounded-xl text-sm font-black text-base-600 hover:bg-base-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer group disabled:opacity-50"
                            >
                                <RefreshCw className={clsx(
                                    "w-4 h-4 transition-transform duration-500",
                                    (isLocalRefreshing || isRefreshing) ? "animate-spin" : "group-hover:rotate-180"
                                )} />
                                {(isLocalRefreshing || isRefreshing) ? '섞는 중...' : '다른 문제 보기'}
                            </button>
                        </div>
                    </div>
                )}

                {isRecsLoading || isRecsFetching || isRefreshing || isLocalRefreshing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <ProblemCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

            {/* Custom Problem List Section */}
            {(() => {
                const today = getLocalDateString(new Date());
                const todayTasks = dailyTasks.filter(t => t.targetDate === today && t.status === 'pending');

                if (todayTasks.length === 0) return null;

                const handleCompleteTask = (task: DailyTask) => {
                    onReviewOpen({
                        title: task.problemTitle,
                        platform: task.site,
                        difficulty: task.difficulty,
                    });
                };

                return (
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-black text-base-800 flex items-center gap-2 font-sans">
                                오늘의 커스텀 리스트 <span className="text-sm font-bold bg-lavender px-2 py-0.5 rounded-lg text-lavender-dark leading-none">
                                    {todayTasks.length} PROBLEMS
                                </span>
                            </h2>
                            <p className="text-sm font-medium text-base-400 mt-1 font-sans">
                                직접 추가한 문제들이에요. 카드에서 <span className="text-lavender-dark font-bold">시작</span> 버튼을 눌러 스톱워치를 켜세요!
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {todayTasks.map((task) => (
                                <CustomProblemCard
                                    key={task.id}
                                    task={task}
                                    onComplete={handleCompleteTask}
                                />
                            ))}
                        </div>
                    </section>
                );
            })()}

            {!isLoading && (
                <DailyHistory onEditLog={onEditLog} />
            )}
        </>
    );
};

export default HomeView;
