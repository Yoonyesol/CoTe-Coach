import { useState, useEffect } from 'react'
import MainLayout from './components/layout/MainLayout'
import DailyPlanner from './components/DailyPlanner'
import StatsDashboard from './components/StatsDashboard'
import Heatmap from './components/Heatmap'
import { motion } from 'framer-motion'
import ProblemCard from './components/ProblemCard'
import AddProblemModal from './components/AddProblemModal'
import StudySettingsModal from './components/StudySettingsModal'
import ReviewModal from './components/ReviewModal'
import Stopwatch from './components/Stopwatch'
import LandingPage from './components/LandingPage'
import GlobalModal from './components/GlobalModal'
import { useUserStore } from './store/useUserStore'
import { useAuthStore } from './store/useAuthStore'
import { useRecommendations } from './hooks/useRecommendations'
import { Plus, Settings2, Loader2 } from 'lucide-react'

function App() {
  const { tier, points, getDailyProgress, getDaysRemaining } = useUserStore();
  const { user, isLoading: isAuthLoading, initialize } = useAuthStore();
  const { data: recommendations, isLoading: isRecsLoading, refetch } = useRecommendations();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const dailyProgress = getDailyProgress();
  const daysRemaining = getDaysRemaining();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<{ title: string, platform: string, difficulty: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'STATS'>('HOME');

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
      <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeTab === 'HOME' ? (
            <>
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-black text-base-900 leading-tight">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4 font-sans">{user.email?.split('@')[0]}님!</span></h1>
                  <p className="text-sm font-medium text-base-400 mt-1 font-sans">
                    오늘의 목표인 <span className="text-base-800 font-bold">{dailyProgress.goal}문제</span> 중 {dailyProgress.solved}문제를 해결하셨어요! {dailyProgress.solved >= dailyProgress.goal ? '축하드려요! 🎉' : '조금만 더 힘내보아요! 🔥'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
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

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: '오늘의 목표', val: `${dailyProgress.solved} / ${dailyProgress.goal}`, icon: '🎯' },
                  { label: '목표 달성 D-Day', val: `D-${daysRemaining}`, icon: '📆' },
                  { label: '현재 티어', val: tier, icon: '🏆' },
                  { label: '누적 포인트', val: `${points.toLocaleString()}G`, icon: '💰' }
                ].map((l, i) => (
                  <div key={i} className="glass-card p-6 border-none hover:translate-y-[-4px] transition-transform cursor-pointer relative overflow-hidden group">
                    <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">
                      {l.icon}
                    </div>
                    <p className="text-xs font-bold text-base-400 mb-1 tracking-wider uppercase relative z-10 font-sans">{l.label}</p>
                    <p className="text-2xl font-black text-base-800 relative z-10 font-sans">{l.val}</p>
                  </div>
                ))}
              </div>

              {/* Daily Planner Section */}
              <DailyPlanner
                solvedCount={dailyProgress.solved}
                goalCount={dailyProgress.goal}
                daysRemaining={daysRemaining}
              />

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
                  <button
                    onClick={() => refetch()}
                    className="text-sm font-bold text-misty-dark hover:underline flex items-center gap-1 transition-all active:scale-95 font-sans"
                  >
                    새로고침
                  </button>
                </div>

                {isRecsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="glass-card h-64 animate-pulse bg-base-100" />
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
            </>
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
      <StudySettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      {selectedProblem && (
        <ReviewModal
          key={`${selectedProblem.title}-${isReviewModalOpen}`}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          problem={selectedProblem}
        />
      )}
      <Stopwatch />
      <GlobalModal />
    </>
  )
}

export default App
