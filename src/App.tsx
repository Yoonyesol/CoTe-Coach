import MainLayout from './components/layout/MainLayout'

function App() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-base-900 leading-tight">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4">윤님!</span></h1>
            <p className="text-base-500 font-medium">오늘은 3개의 문제를 뿌셔볼까요? 🔥</p>
          </div>
          <button className="p-4 rounded-3xl bg-base-800 text-white hover:bg-black transition-colors shadow-xl">
            🌙
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '오늘의 목표', val: '1 / 3' },
            { label: '연속 스트라이크', val: '12일' },
            { label: '현재 티어', val: 'Solver II' },
            { label: '누적 포인트', val: '1,200G' }
          ].map((s, i) => (
            <div key={i} className="glass-card p-6 border-none hover:translate-y-[-4px] transition-transform cursor-pointer">
              <p className="text-xs font-bold text-base-400 mb-1 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-black text-base-800">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Daily Recommendations Area (Placeholder) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-base-800">오늘의 추천 문제 🤖</h2>
            <button className="text-sm font-bold text-misty-dark hover:underline">새로고침</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="glass-card p-8 border-dashed border-2 border-base-200 bg-transparent flex flex-col items-center justify-center text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="font-bold text-base-400">학습 데이터를 기반으로 문제를 찾고 있어요...</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default App
