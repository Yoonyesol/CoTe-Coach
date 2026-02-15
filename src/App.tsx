import { useState, useEffect, Suspense, lazy } from 'react'
import MainLayout from './components/layout/MainLayout'
import { motion } from 'framer-motion';
import AddProblemModal from './components/modals/AddProblemModal'
import AccountSettingsModal from './components/modals/AccountSettingsModal'

import TierGuideModal from './components/modals/TierGuideModal'
import ReviewModal from './components/modals/ReviewModal'
import ReviewDetailModal from './components/modals/ReviewDetailModal'
import Stopwatch from './components/common/Stopwatch'
import StudyLogDetailModal from './components/modals/StudyLogDetailModal'
import RecommendationSettingsModal from './components/modals/RecommendationSettingsModal'
import GlobalModal from './components/modals/GlobalModal'
import GoalModal from './components/modals/GoalModal'
import DailyGoalSettingsModal from './components/modals/DailyGoalSettingsModal'
import { useUserStore } from './store/useUserStore'
import { useModalStore } from './store/useModalStore'
import { useAuthStore } from './store/useAuthStore'
import DeleteAccountModal from './components/modals/DeleteAccountModal'
import ContactModal from './components/modals/ContactModal'
import ShopModal from './components/modals/ShopModal'
import RewardedAdModal from './components/modals/RewardedAdModal'
import EditTaskModal from './components/modals/EditTaskModal'
import GoldHistoryModal from './components/modals/GoldHistoryModal'
import { StudyLog, DailyTask } from './types/study'

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
    closeGoldHistory
  } = useModalStore();
  const { user, initialize, isLoading: isAuthLoading, initialized: authInitialized } = useAuthStore();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    console.log('[App] 🚀 initialize() 호출');
    initialize();

    // Check for hydration status
    const checkHydration = () => {
      if (useUserStore.persist.hasHydrated()) {
        console.log('[App] ✅ Hydration 완료 (즉시)');
        setIsHydrated(true);
      } else {
        console.log('[App] ⏳ Hydration 대기 중...');
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
    console.log('[App] 📊 syncData 체크:', { isHydrated, authInitialized, userId: user?.id });
    if (!isHydrated || !authInitialized) return;

    const syncData = async () => {
      console.log('[App] 🔄 syncData 시작, user:', user?.id || 'guest');
      setIsDataLoading(true);
      try {
        // If user is logged in, prioritize Supabase data
        if (user) {
          console.log('[App] 📥 fetchUserData 시작...');
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
        setIsDataLoading(false);
      }
    };

    syncData();
  }, [isHydrated, authInitialized, user?.id, fetchUserData, refreshRating, showAlert]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTierGuideModalOpen, setIsTierGuideModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewDetailModalOpen, setIsReviewDetailModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<{ id?: string, title: string, platform: string, difficulty: string } | null>(null);
  const [selectedReviewPlan, setSelectedReviewPlan] = useState<any>(null);
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

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

  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const handleReviewOpen = (problem: { id?: string, title: string, platform: string, difficulty: string }) => {
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
      id: plan.problemId,
      title: plan.problemTitle,
      platform: plan.platform,
      difficulty: plan.difficulty
    });
  };

  console.log('[App] 🎨 렌더링 분기:', { isAuthLoading, user: !!user, isDataLoading });

  if (isAuthLoading) {
    console.log('[App] ⏳ 인증 로딩 중 → 스피너 표시');
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-coral animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log('[App] 👤 비로그인 → 랜딩 페이지 표시');
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
          <Suspense fallback={
            <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-coral animate-spin" />
            </div>
          }>
            {activeTab === 'HOME' ? (
              <HomeView
                isLoading={isDataLoading}
                onDailyGoalOpen={() => setIsDailyGoalModalOpen(true)}
                onAddModalOpen={() => setIsAddModalOpen(true)}
                onGoalModalOpen={() => setIsGoalModalOpen(true)}
                onRecommendationSettingsOpen={openRecommendationSettings}
                onReviewOpen={handleReviewOpen}
                onReviewDetailOpen={handleReviewDetailOpen}
                onEditLog={setEditingLog}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsEditTaskModalOpen(true);
                }}
              />
            ) : activeTab === 'JOURNAL' ? (
              <JournalView
                onLogClick={setEditingLog}
                onGoalClick={() => setIsGoalModalOpen(true)}
                onReviewPlanClick={handleReviewDetailOpen}
              />
            ) : activeTab === 'LIBRARY' ? (
              <LibraryView onProblemClick={setEditingLog} />
            ) : activeTab === 'MY_PROBLEMS' ? (
              <MyProblemsView
                onAddModalOpen={() => setIsAddModalOpen(true)}
                onReviewOpen={handleReviewOpen}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsEditTaskModalOpen(true);
                }}
              />
            ) : activeTab === 'SETTINGS' ? (
              <SettingsView
                onDeleteAccountOpen={() => setIsDeleteModalOpen(true)}
                onContactOpen={() => setIsContactModalOpen(true)}
              />
            ) : (
              <StatsView />
            )}
          </Suspense>
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
      <Stopwatch onComplete={handleReviewOpen} />
      <RecommendationSettingsModal
        isOpen={isRecommendationSettingsOpen}
        onClose={closeRecommendationSettings}
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
      <ShopModal
        isOpen={isShopOpen}
        onClose={closeShop}
        initialCategory={shopInitialCategory}
      />
      <RewardedAdModal
        isOpen={isRewardedAdModalOpen}
        onClose={closeRewardedAdModal}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
        />
      )}

      <GoldHistoryModal
        isOpen={isGoldHistoryOpen}
        onClose={closeGoldHistory}
      />
    </>
  );
}

export default App;
