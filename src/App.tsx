import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import MainLayout from './components/layout/MainLayout'
import { motion } from 'framer-motion';

import Stopwatch from './components/common/Stopwatch'
import RecommendationSettingsModal from './components/modals/RecommendationSettingsModal'
import GlobalModal from './components/modals/GlobalModal'
import GlobalModalRenderer from './components/modals/GlobalModalRenderer'

import { useUserStore } from './store/useUserStore'
import { useModalStore } from './store/useModalStore'
import { useAuthStore } from './store/useAuthStore'

import ShopModal from './components/modals/ShopModal'
import RewardedAdModal from './components/modals/RewardedAdModal'
import GoldHistoryModal from './components/modals/GoldHistoryModal'

// Lazy Load Page Components
const LandingView = lazy(() => import('./pages/LandingView'));
const HomeView = lazy(() => import('./pages/HomeView'));
const StatsView = lazy(() => import('./pages/StatsView'));
const JournalView = lazy(() => import('./pages/JournalView'));
const LibraryView = lazy(() => import('./pages/LibraryView'));
const SettingsView = lazy(() => import('./pages/SettingsView'));
const MyProblemsView = lazy(() => import('./pages/MyProblemsView'));

import {
  Loader2
} from 'lucide-react';

function App() {
  const {
    fetchUserData,
    refreshRating,
    stopTimer,
    timer,
    startTimer,
    fetchGoals,
    getActiveGoal
  } = useUserStore();
  const {
    showAlert,
    isShopOpen,
    shopInitialCategory,
    closeShop,
    isRecommendationSettingsOpen,
    openRecommendationSettings,
    closeRecommendationSettings,
    isRewardedAdModalOpen,
    closeRewardedAdModal,
    isGoldHistoryOpen,
    closeGoldHistory,
    openGlobalModal,
    closeGlobalModal
  } = useModalStore();
  const { user, initialize, isLoading: isAuthLoading, initialized: authInitialized } = useAuthStore();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const isDataLoadingRef = useRef(false);

  useEffect(() => {
    initialize();

    // Check for hydration status
    const checkHydration = () => {
      if (useUserStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        const unsub = useUserStore.persist.onFinishHydration(() => {
          console.log('[App] ✅ Hydration 완료 (콜백)');
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
      isDataLoadingRef.current = true;

      // Safety timeout for data synchronization (4 seconds)
      // Uses ref instead of state to avoid stale closure issue
      const dataTimeout = setTimeout(() => {
        if (isDataLoadingRef.current) {
          console.warn('[App] Data sync timed out, unblocking UI');
          isDataLoadingRef.current = false;
          setIsDataLoading(false);
          showAlert(
            "동기화 지연",
            "서버 상태가 원활하지 않아 데이터 동기화가 지연되고 있습니다. 캐시된 데이터를 표시합니다."
          );
        }
      }, 4000);

      try {
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
      } catch (error: any) {
        console.error("Data sync failed:", error);

        // Smart Error Handling
        const isAuthError =
          error?.status === 401 ||
          error?.status === 403 ||
          error?.message?.includes('JWT') ||
          error?.message?.includes('token');

        if (isAuthError) {
          useAuthStore.getState().signOut();
        } else {
          // Network or other transient error -> Just warn, don't logout
          showAlert(
            "데이터 동기화 실패",
            "데이터를 불러오는 중 문제가 발생했습니다. (네트워크 연결을 확인해주세요)"
          );
        }
      } finally {
        clearTimeout(dataTimeout);
        isDataLoadingRef.current = false;
        setIsDataLoading(false);
      }
    };

    syncData();
  }, [isHydrated, authInitialized, user?.id, fetchUserData, refreshRating, showAlert]);



  const [activeTab, setActiveTab] = useState<'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY' | 'SETTINGS' | 'MY_PROBLEMS'>(() => {
    if (typeof window === 'undefined') return 'HOME';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'STATS') return 'STATS';
    if (tab === 'JOURNAL') return 'JOURNAL';
    if (tab === 'LIBRARY') return 'LIBRARY';
    if (tab === 'SETTINGS') return 'SETTINGS';
    if (tab === 'MY_PROBLEMS') return 'MY_PROBLEMS';
    return 'HOME';
  });

  const handleTabChange = (tab: 'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY' | 'SETTINGS' | 'MY_PROBLEMS') => {
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
      else if (tab === 'MY_PROBLEMS') setActiveTab('MY_PROBLEMS');
      else setActiveTab('HOME');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleReviewOpen = (problem: { id?: string, title: string, platform: string, difficulty: string }) => {
    openGlobalModal('REVIEW', { problem });
  };

  const handleReviewDetailOpen = (plan: any) => {
    openGlobalModal('REVIEW_DETAIL', {
      plan,
      onStartReview: handleStartReview,
      onQuickLog: handleQuickLog,
      onViewFullDetail: (log: any) => {
        closeGlobalModal();
        openGlobalModal('STUDY_LOG_DETAIL', { log });
      }
    });
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
    closeGlobalModal();
  };

  const handleQuickLog = (plan: any) => {
    // If this problem was being timed, stop it first
    if (timer.currentProblemId === plan.problemTitle && timer.isRunning) {
      stopTimer();
    }
    closeGlobalModal();
    handleReviewOpen({
      id: plan.problemId,
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
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-base-900 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-coral animate-spin" />
        </div>
      }>
        <LandingView />
      </Suspense>
    );
  }

  return (
    <>
      <MainLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAccountSettingsOpen={() => openGlobalModal('ACCOUNT_SETTINGS')}
        onTierClick={() => openGlobalModal('TIER_GUIDE')}
        isLoading={isDataLoading}
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Suspense fallback={
            <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-coral animate-spin" />
            </div>
          }>
            {activeTab === 'HOME' ? (
              <HomeView
                isLoading={isDataLoading}
                onDailyGoalOpen={() => openGlobalModal('DAILY_GOAL')}
                onAddModalOpen={() => openGlobalModal('ADD_PROBLEM')}
                onGoalModalOpen={() => openGlobalModal('GOAL', { editGoal: getActiveGoal() })}
                onRecommendationSettingsOpen={openRecommendationSettings}
                onReviewOpen={handleReviewOpen}
                onReviewDetailOpen={handleReviewDetailOpen}
                onEditLog={(log) => openGlobalModal('STUDY_LOG_DETAIL', { log })}
                onEditTask={(task) => openGlobalModal('EDIT_TASK', { task })}
              />
            ) : activeTab === 'JOURNAL' ? (
              <JournalView
                onLogClick={(log) => openGlobalModal('STUDY_LOG_DETAIL', { log })}
                onGoalClick={() => openGlobalModal('GOAL', { editGoal: getActiveGoal() })}
                onReviewPlanClick={handleReviewDetailOpen}
              />
            ) : activeTab === 'LIBRARY' ? (
              <LibraryView onProblemClick={(log) => openGlobalModal('STUDY_LOG_DETAIL', { log })} />
            ) : activeTab === 'MY_PROBLEMS' ? (
              <MyProblemsView
                onAddModalOpen={() => openGlobalModal('ADD_PROBLEM')}
                onReviewOpen={handleReviewOpen}
                onEditTask={(task) => openGlobalModal('EDIT_TASK', { task })}
              />
            ) : activeTab === 'SETTINGS' ? (
              <SettingsView
                onDeleteAccountOpen={() => openGlobalModal('DELETE_ACCOUNT')}
                onContactOpen={() => openGlobalModal('CONTACT')}
              />
            ) : (
              <StatsView />
            )}
          </Suspense>
        </motion.div>
      </MainLayout>

      <GlobalModalRenderer />

      {/* Global Modals & Overlays (Outside for true 100% viewport coverage) */}
      <Stopwatch onComplete={handleReviewOpen} />

      <RecommendationSettingsModal
        isOpen={isRecommendationSettingsOpen}
        onClose={closeRecommendationSettings}
      />

      <GlobalModal />
      <ShopModal
        isOpen={isShopOpen}
        onClose={closeShop}
        initialCategory={shopInitialCategory}
      />
      <RewardedAdModal
        isOpen={isRewardedAdModalOpen}
        onClose={closeRewardedAdModal}
      />
      <GoldHistoryModal
        isOpen={isGoldHistoryOpen}
        onClose={closeGoldHistory}
      />
    </>
  );
}

export default App;
