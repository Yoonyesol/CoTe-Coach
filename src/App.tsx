import { useState, useEffect } from 'react'
import MainLayout from './components/layout/MainLayout'
import DailyPlanner from './components/DailyPlanner'
import StatsDashboard from './components/StatsDashboard'
import { motion } from 'framer-motion';
import ProblemCard from './components/ProblemCard'
import CustomProblemCard from './components/CustomProblemCard'
import AddProblemModal from './components/modals/AddProblemModal'
import AccountSettingsModal from './components/modals/AccountSettingsModal'

import TierGuideModal from './components/modals/TierGuideModal'
import ReviewModal from './components/modals/ReviewModal'
import ReviewDetailModal from './components/modals/ReviewDetailModal'
import Stopwatch from './components/Stopwatch'
import LandingPage from './components/LandingPage'
import LearningJournal from './components/LearningJournal'
import DailyHistory from './components/DailyHistory'
import ReviewNotifications from './components/ReviewNotifications'
import StudyLogDetailModal from './components/modals/StudyLogDetailModal'
import ProblemLibrary from './components/ProblemLibrary'
import RecommendationSettingsModal from './components/modals/RecommendationSettingsModal'
import GlobalModal from './components/modals/GlobalModal'
import GoalBanner from './components/GoalBanner'
import GoalModal from './components/modals/GoalModal'
import DailyGoalSettingsModal from './components/modals/DailyGoalSettingsModal'
import { useUserStore } from './store/useUserStore'
import { useModalStore } from './store/useModalStore'
import { StudyLog, DailyTask } from './types/study'
import { useAuthStore } from './store/useAuthStore'
import { useRecommendations } from './hooks/useRecommendations'
import SettingsView from './components/SettingsView'
import DeleteAccountModal from './components/modals/DeleteAccountModal'
import ContactModal from './components/modals/ContactModal'
import {
  RefreshCw, Settings2, Plus, Target, Loader2, Target as TargetIcon
} from 'lucide-react';
import { getLocalDateString } from './lib/dateUtils'
import clsx from 'clsx';
import {
  ProfileHeaderSkeleton,
  DailyPlannerSkeleton,
  ProblemCardSkeleton,
  GoalBannerSkeleton,
  ReviewNotificationsSkeleton,
  DailyHistorySkeleton,
  SectionHeaderSkeleton
} from './components/common/Skeleton';

function App() {
  const {
    getDailyProgress,
    getDaysRemaining,
    fetchUserData,
    refreshRating,
    refreshRecommendations,
    dailyTasks,
    stopTimer,
    timer,
    startTimer,
    fetchGoals,
    getActiveGoal,
    getStreak,
    nickname
  } = useUserStore();
  const { showAlert } = useModalStore();
  const { user, initialize, isLoading: isAuthLoading, initialized: authInitialized } = useAuthStore();
  const { data: recommendations, isLoading: isRecsLoading, isFetching: isRecsFetching, refetch } = useRecommendations();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    initialize();

    // Check for hydration status
    const checkHydration = () => {
      if (useUserStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        const unsub = useUserStore.persist.onFinishHydration(() => {
          setIsHydrated(true);
          unsub();
        });
      }
    };

    checkHydration();
  }, [initialize]);

  // 1. Initial Data Sync: Local Storage Hydration & Supabase Fetch
  useEffect(() => {
    if (!isHydrated || !authInitialized) return;

    const syncData = async () => {
      setIsDataLoading(true);
      // If user is logged in, prioritize Supabase data
      if (user) {
        await fetchUserData(user.id);
        await fetchGoals(user.id);
      } else {
        // Fallback for guest mode: recalculate from local storage
        refreshRating();
      }

      // Sync tier string with level
      const currentState = useUserStore.getState();
      const correctTier = currentState.calculateTier(currentState.level);
      if (currentState.tier !== correctTier) {
        useUserStore.setState({ tier: correctTier });
      }
      setIsDataLoading(false);
    };

    syncData();
  }, [isHydrated, authInitialized, user, fetchUserData, refreshRating]);

  const dailyProgress = getDailyProgress();
  const daysRemaining = getDaysRemaining();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTierGuideModalOpen, setIsTierGuideModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewDetailModalOpen, setIsReviewDetailModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<{ title: string, platform: string, difficulty: string } | null>(null);
  const [selectedReviewPlan, setSelectedReviewPlan] = useState<any>(null);
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY' | 'SETTINGS'>(() => {
    if (typeof window === 'undefined') return 'HOME';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'STATS') return 'STATS';
    if (tab === 'JOURNAL') return 'JOURNAL';
    if (tab === 'LIBRARY') return 'LIBRARY';
    if (tab === 'SETTINGS') return 'SETTINGS';
    return 'HOME';
  });

  const handleTabChange = (tab: 'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY' | 'SETTINGS') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'HOME') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    window.history.pushState({}, '', url);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'STATS') setActiveTab('STATS');
      else if (tab === 'JOURNAL') setActiveTab('JOURNAL');
      else if (tab === 'LIBRARY') setActiveTab('LIBRARY');
      else if (tab === 'SETTINGS') setActiveTab('SETTINGS');
      else setActiveTab('HOME');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);
  const [isRecoModalOpen, setIsRecoModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const handleReviewOpen = (problem: { title: string, platform: string, difficulty: string }) => {
    setSelectedProblem(problem);
    setIsReviewModalOpen(true);
  };

  const handleReviewDetailOpen = (plan: any) => {
    setSelectedReviewPlan(plan);
    setIsReviewDetailModalOpen(true);
  };

  const handleStartReview = (plan: any) => {
    if (timer.currentProblemId === plan.problemTitle && timer.isRunning) {
      stopTimer();
    } else {
      if (timer.isRunning && timer.currentProblemId !== plan.problemTitle) {
        showAlert(
          "타이머 중복",
          "이미 다른 문제를 풀이 중입니다. 현재 진행 중인 타이머를 먼저 중단해주세요!"
        );
        return;
      }
      startTimer(plan.problemTitle);
    }
    setIsReviewDetailModalOpen(false);
  };

  const handleQuickLog = (plan: any) => {
    // If this problem was being timed, stop it first
    if (timer.currentProblemId === plan.problemTitle && timer.isRunning) {
      stopTimer();
    }
    setIsReviewDetailModalOpen(false);
    handleReviewOpen({
      title: plan.problemTitle,
      platform: plan.platform,
      difficulty: plan.difficulty
    });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-coral animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      <MainLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAccountSettingsOpen={() => setIsAccountModalOpen(true)}
        onTierClick={() => setIsTierGuideModalOpen(true)}
        isLoading={isDataLoading}
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeTab === 'HOME' ? (
            <>
              {isDataLoading ? (
                <ProfileHeaderSkeleton />
              ) : (
                <header className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-black text-base-900 leading-tight">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4 font-sans">{nickname || user.email?.split('@')[0]}님!</span></h1>
                    <div className="text-sm font-medium text-base-400 mt-2 font-sans flex items-center gap-1.5 flex-wrap">
                      <span>오늘의 목표인</span>
                      <button
                        onClick={() => setIsDailyGoalModalOpen(true)}
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
                      onClick={() => setIsDailyGoalModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-3 bg-white border border-base-200 text-base-600 rounded-2xl font-black hover:bg-base-50 transition-all active:scale-95 shadow-sm font-sans text-sm cursor-pointer"
                      title="클릭하여 목표 변경"
                    >
                      <Target className="w-4 h-4 text-misty-dark" />
                      하루 목표
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-base-900 text-white rounded-2xl font-black hover:bg-base-800 transition-all active:scale-95 shadow-xl font-sans cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      문제 추가
                    </button>
                  </div>
                </header>
              )}

              {/* Goal Banner */}
              {isDataLoading ? (
                <GoalBannerSkeleton />
              ) : (
                <GoalBanner onOpenGoalModal={() => setIsGoalModalOpen(true)} />
              )}

              {/* Main Activity Row: Planner & Reviews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Daily Planner Section */}
                {isDataLoading ? (
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
                {isDataLoading ? (
                  <ReviewNotificationsSkeleton />
                ) : (
                  <ReviewNotifications onPlanClick={handleReviewDetailOpen} />
                )}
              </div>

              {/* Recommendation Section */}
              <section className="space-y-6">
                {isDataLoading || isRecsLoading ? (
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
                        onClick={() => setIsRecoModalOpen(true)}
                        className="px-4 py-2 bg-white border border-base-200 rounded-xl text-sm font-black text-base-600 hover:bg-base-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer group"
                        title="추천 필터 설정"
                      >
                        <Settings2 className="w-4 h-4" />
                        필터
                      </button>
                      <button
                        onClick={async () => {
                          setIsRefreshing(true);
                          await refreshRecommendations();
                          await refetch();
                          setIsRefreshing(false);
                        }}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-white border border-base-200 rounded-xl text-sm font-black text-base-600 hover:bg-base-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer group disabled:opacity-50"
                      >
                        <RefreshCw className={clsx(
                          "w-4 h-4 transition-transform duration-500",
                          isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                        )} />
                        {isRefreshing ? '섞는 중...' : '다른 문제 보기'}
                      </button>
                    </div>
                  </div>
                )}

                {isRecsLoading || isRecsFetching || isRefreshing ? (
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
                        onReview={handleReviewOpen}
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
                  stopTimer();
                  handleReviewOpen({
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

              {isDataLoading ? (
                <DailyHistorySkeleton />
              ) : (
                <DailyHistory onEditLog={setEditingLog} />
              )}
            </>
          ) : activeTab === 'JOURNAL' ? (
            <LearningJournal
              onLogClick={setEditingLog}
              onGoalClick={() => setIsGoalModalOpen(true)}
              onReviewPlanClick={handleReviewDetailOpen}
            />
          ) : activeTab === 'LIBRARY' ? (
            <ProblemLibrary onProblemClick={setEditingLog} />
          ) : activeTab === 'SETTINGS' ? (
            <SettingsView
              onDeleteAccountOpen={() => setIsDeleteModalOpen(true)}
              onContactOpen={() => setIsContactModalOpen(true)}
            />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-base-900 font-sans tracking-tight">학습 분석 리포트</h2>
                <p className="text-sm font-medium text-base-400 font-sans">성실하게 쌓아온 사용자님의 <span className="text-misty-dark font-black">학습 흔적</span>을 분석해 보았어요.</p>
              </div>

              {/* Stats Dashboard Section */}
              <StatsDashboard />
            </div>
          )}
        </motion.div>
      </MainLayout>

      {/* Global Modals & Overlays (Outside for true 100% viewport coverage) */}
      <AddProblemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <AccountSettingsModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />

      <TierGuideModal
        isOpen={isTierGuideModalOpen}
        onClose={() => setIsTierGuideModalOpen(false)}
      />
      {selectedProblem && (
        <ReviewModal
          key={`${selectedProblem.title}-${isReviewModalOpen}`}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          problem={selectedProblem}
        />
      )}
      {editingLog && (
        <StudyLogDetailModal
          log={editingLog}
          isOpen={!!editingLog}
          onClose={() => setEditingLog(null)}
        />
      )}
      <Stopwatch />
      <RecommendationSettingsModal
        isOpen={isRecoModalOpen}
        onClose={() => setIsRecoModalOpen(false)}
      />

      <ReviewDetailModal
        isOpen={isReviewDetailModalOpen}
        onClose={() => setIsReviewDetailModalOpen(false)}
        plan={selectedReviewPlan}
        onStartReview={handleStartReview}
        onQuickLog={handleQuickLog}
        onViewFullDetail={(log) => {
          setIsReviewDetailModalOpen(false);
          setEditingLog(log);
        }}
      />

      <DailyGoalSettingsModal
        isOpen={isDailyGoalModalOpen}
        onClose={() => setIsDailyGoalModalOpen(false)}
      />

      <GlobalModal />
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editGoal={getActiveGoal()}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}

export default App
