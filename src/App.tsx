import { useState, useEffect } from 'react'
import MainLayout from './components/layout/MainLayout'
import { motion } from 'framer-motion';
import AddProblemModal from './components/modals/AddProblemModal'
import AccountSettingsModal from './components/modals/AccountSettingsModal'

import TierGuideModal from './components/modals/TierGuideModal'
import ReviewModal from './components/modals/ReviewModal'
import ReviewDetailModal from './components/modals/ReviewDetailModal'
import Stopwatch from './components/Stopwatch'
import LandingPage from './components/LandingPage'
import StudyLogDetailModal from './components/modals/StudyLogDetailModal'
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
import DeleteAccountModal from './components/modals/DeleteAccountModal'
import ContactModal from './components/modals/ContactModal'

// Page Components
import HomeView from './pages/HomeView'
import StatsView from './pages/StatsView'
import JournalView from './pages/JournalView'
import LibraryView from './pages/LibraryView'
import SettingsView from './pages/SettingsView'
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
            <HomeView
              isLoading={isDataLoading}
              nickname={nickname}
              email={user.email || ''}
              dailyProgress={dailyProgress}
              getStreak={getStreak}
              daysRemaining={daysRemaining}
              recommendations={recommendations}
              isRecsLoading={isRecsLoading}
              isRecsFetching={isRecsFetching}
              isRefreshing={isRefreshing}
              dailyTasks={dailyTasks}
              onDailyGoalOpen={() => setIsDailyGoalModalOpen(true)}
              onAddModalOpen={() => setIsAddModalOpen(true)}
              onGoalModalOpen={() => setIsGoalModalOpen(true)}
              onReviewOpen={handleReviewOpen}
              onReviewDetailOpen={handleReviewDetailOpen}
              onRefreshRecommendations={async () => {
                setIsRefreshing(true);
                await refreshRecommendations();
                setIsRefreshing(false);
              }}
              onRefetchRecommendations={refetch}
              onEditLog={setEditingLog}
            />
          ) : activeTab === 'JOURNAL' ? (
            <JournalView
              onLogClick={setEditingLog}
              onGoalClick={() => setIsGoalModalOpen(true)}
              onReviewPlanClick={handleReviewDetailOpen}
            />
          ) : activeTab === 'LIBRARY' ? (
            <LibraryView onProblemClick={setEditingLog} />
          ) : activeTab === 'SETTINGS' ? (
            <SettingsView
              onDeleteAccountOpen={() => setIsDeleteModalOpen(true)}
              onContactOpen={() => setIsContactModalOpen(true)}
            />
          ) : (
            <StatsView />
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
