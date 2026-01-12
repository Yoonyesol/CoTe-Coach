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
import { StudyLog } from './types/study'
import { useAuthStore } from './store/useAuthStore'
import DeleteAccountModal from './components/modals/DeleteAccountModal'
import ContactModal from './components/modals/ContactModal'
import ShopModal from './components/modals/ShopModal'

// Lazy Load Page Components
const LandingView = lazy(() => import('./pages/LandingView'));
const HomeView = lazy(() => import('./pages/HomeView'));
const StatsView = lazy(() => import('./pages/StatsView'));
const JournalView = lazy(() => import('./pages/JournalView'));
const LibraryView = lazy(() => import('./pages/LibraryView'));
const SettingsView = lazy(() => import('./pages/SettingsView'));

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
    closeRecommendationSettings
  } = useModalStore();
  const { user, initialize, isLoading: isAuthLoading, initialized: authInitialized } = useAuthStore();

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
    </>
  );
}

export default App
