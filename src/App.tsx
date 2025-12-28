import { useState } from 'react'
import MainLayout from './components/layout/MainLayout'
import UserTest from './components/UserTest'
import ProblemCard from './components/ProblemCard'
import AddProblemModal from './components/AddProblemModal'
import StudySettingsModal from './components/StudySettingsModal'
import ReviewModal from './components/ReviewModal'
import Stopwatch from './components/Stopwatch'
import { useUserStore } from './store/useUserStore'
import { useRecommendations } from './hooks/useRecommendations'
import { Plus, Settings2 } from 'lucide-react'

function App() {
  const { tier, points } = useUserStore();
  const { data: recommendations, isLoading, refetch } = useRecommendations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<{ title: string, platform: string, difficulty: string } | null>(null);

  const handleReviewOpen = (problem: { title: string, platform: string, difficulty: string }) => {
    setSelectedProblem(problem);
    setIsReviewModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-base-900 leading-tight">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4 font-sans">윤님!</span></h1>
            <p className="text-base-500 font-medium font-sans">오늘은 3개의 문제를 뿌셔볼까요? 🔥</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-3 bg-white border border-base-200 text-base-600 rounded-2xl font-black hover:bg-base-50 transition-all active:scale-95 shadow-sm"
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

        <AddProblemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        <StudySettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        {selectedProblem && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            problem={selectedProblem}
          />
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md::grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '오늘의 목표', val: '1 / 3', icon: '🎯' },
            { label: '연속 스트라이크', val: '12일', icon: '🔥' },
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

          {isLoading ? (
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

        {/* Test Tool */}
        <div className="opacity-30 hover:opacity-100 transition-opacity pt-12">
          <UserTest />
        </div>
      </div>
      <Stopwatch />
    </MainLayout>
  )
}

export default App
