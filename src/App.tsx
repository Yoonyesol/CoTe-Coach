import { useState, useEffect } from 'react'
import MainLayout from './components/layout/MainLayout'
import DailyPlanner from './components/DailyPlanner'
import StatsDashboard from './components/StatsDashboard'
import Heatmap from './components/Heatmap'
import { motion } from 'framer-motion';
import ProblemCard from './components/ProblemCard'
import AddProblemModal from './components/modals/AddProblemModal'
import AccountSettingsModal from './components/modals/AccountSettingsModal'
import StudyPlanModal from './components/modals/StudyPlanModal'
import StudyPlanDetailModal from './components/modals/StudyPlanDetailModal'
import TierGuideModal from './components/modals/TierGuideModal'
import ReviewModal from './components/modals/ReviewModal'
import Stopwatch from './components/Stopwatch'
import LandingPage from './components/LandingPage'
import LearningJournal from './components/LearningJournal'
import DailyHistory from './components/DailyHistory'
import EditStudyLogModal from './components/modals/EditStudyLogModal'
import RecommendationSettingsModal from './components/modals/RecommendationSettingsModal'
import GlobalModal from './components/modals/GlobalModal'
import { useUserStore } from './store/useUserStore'
import { StudyLog } from './types/study'
import { useAuthStore } from './store/useAuthStore'
import { useRecommendations } from './hooks/useRecommendations'
import { Plus, Settings2, Loader2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import {
  ProblemCardSkeleton,
  StatSkeleton,
  ProfileHeaderSkeleton,
  DailyPlannerSkeleton
} from './components/common/Skeleton';

function App() {
  const {
    tier,
    points,
    getDailyProgress,
    getDaysRemaining,
    fetchUserData,
    refreshRating,
    refreshRecommendations
  } = useUserStore();
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
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPlanDetailModalOpen, setIsPlanDetailModalOpen] = useState(false);
  const [isTierGuideModalOpen, setIsTierGuideModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<{ title: string, platform: string, difficulty: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'STATS' | 'JOURNAL'>('HOME');
  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);
  const [isRecoModalOpen, setIsRecoModalOpen] = useState(false);

  const handleReviewOpen = (problem: { title: string, platform: string, difficulty: string }) => {
    setSelectedProblem(problem);
    setIsReviewModalOpen(true);
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
        onTabChange={setActiveTab}
        onAccountSettingsOpen={() => setIsAccountModalOpen(true)}
        onTierClick={() => setIsTierGuideModalOpen(true)}
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
                    <h1 className="text-3xl font-black text-base-900 leading-tight">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4 font-sans">{user.email?.split('@')[0]}님!</span></h1>
                    <p className="text-sm font-medium text-base-400 mt-1 font-sans">
                      오늘의 목표인 <span className="text-base-800 font-bold">{dailyProgress.goal}문제</span> 중 {dailyProgress.solved}문제를 해결하셨어요! {dailyProgress.solved >= dailyProgress.goal ? '축하드려요! 🎉' : '조금만 더 힘내보아요! 🔥'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsPlanModalOpen(true)}
                      className="p-3 bg-white border border-base-200 text-base-600 rounded-2xl font-black hover:bg-base-50 transition-all active:scale-95 shadow-sm outline-none"
                      title="학습 플랜 설정"
                    >
                      <Settings2 className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-base-900 text-white rounded-2xl font-black hover:bg-base-800 transition-all active:scale-95 shadow-xl font-sans"
                    >
                      <Plus className="w-5 h-5" />
                      문제 추가
                    </button>
                  </div>
                </header>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isDataLoading ? (
                  <>
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                  </>
                ) : (
                  <>
                    <div className="glass-card p-6 border-none hover:translate-y-[-4px] transition-transform cursor-pointer relative overflow-hidden group">
                      <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">🎯</div>
                      <p className="text-xs font-bold text-base-400 mb-1 tracking-wider uppercase relative z-10 font-sans">오늘의 목표</p>
                      <p className="text-2xl font-black text-base-800 relative z-10 font-sans">{dailyProgress.solved} / {dailyProgress.goal}</p>
                    </div>

                    <div className="glass-card p-6 border-none hover:translate-y-[-4px] transition-transform cursor-pointer relative overflow-hidden group">
                      <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">📆</div>
                      <p className="text-xs font-bold text-base-400 mb-1 tracking-wider uppercase relative z-10 font-sans">목표 달성 D-Day</p>
                      <p className="text-2xl font-black text-base-800 relative z-10 font-sans">D-{daysRemaining}</p>
                    </div>

                    <div onClick={() => setIsTierGuideModalOpen(true)} className="glass-card p-6 border-none hover:translate-y-[-4px] transition-transform cursor-pointer relative overflow-hidden group flex flex-col justify-center">
                      <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">🏆</div>
                      <p className="text-xs font-bold text-base-400 mb-0.5 tracking-wider uppercase font-sans">현재 티어</p>
                      <p className="text-xl font-black text-base-800 font-sans leading-none">{tier}</p>
                    </div>

                    <div className="glass-card p-6 border-none hover:translate-y-[-4px] transition-transform cursor-pointer relative overflow-hidden group">
                      <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">💰</div>
                      <p className="text-xs font-bold text-base-400 mb-1 tracking-wider uppercase relative z-10 font-sans">누적 포인트</p>
                      <p className="text-2xl font-black text-base-800 relative z-10 font-sans">{points.toLocaleString()}G</p>
                    </div>
                  </>
                )}
              </div>

              {/* Daily Planner Section */}
              {isDataLoading ? (
                <DailyPlannerSkeleton />
              ) : (
                <DailyPlanner
                  solvedCount={dailyProgress.solved}
                  goalCount={dailyProgress.goal}
                  daysRemaining={daysRemaining}
                  onPlanDetailClick={() => setIsPlanDetailModalOpen(true)}
                />
              )}

              {/* Recommendation Section */}
              <section className="space-y-6">
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
                  <div className="flex gap-2">
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

              <DailyHistory onEditLog={setEditingLog} />
            </>
          ) : activeTab === 'JOURNAL' ? (
            <LearningJournal />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-base-900 font-sans tracking-tight">학습 분석 리포트</h2>
                <p className="text-sm font-medium text-base-400 font-sans">성실하게 쌓아온 사용자님의 <span className="text-misty-dark font-black">학습 흔적</span>을 분석해 보았어요.</p>
              </div>

              {/* Stats Dashboard Section */}
              <StatsDashboard />

              {/* Learning Heatmap */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-base-800 font-sans">코딩 잔디 현황</h3>
                  <p className="text-xs font-bold text-base-400 uppercase tracking-widest font-sans">Streak Consistency</p>
                </div>
                <Heatmap />
              </div>
            </div>
          )}
        </motion.div>
      </MainLayout>

      {/* Global Modals & Overlays (Outside for true 100% viewport coverage) */}
      <AddProblemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <AccountSettingsModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />
      <StudyPlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      <StudyPlanDetailModal
        isOpen={isPlanDetailModalOpen}
        onClose={() => setIsPlanDetailModalOpen(false)}
        onEditPlan={() => setIsPlanModalOpen(true)}
      />
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
        <EditStudyLogModal
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

      <GlobalModal />
    </>
  )
}

export default App
