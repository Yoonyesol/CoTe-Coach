import MainLayout from './components/layout/MainLayout'
import UserTest from './components/UserTest'

function App() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-base-900">안녕하세요, <span className="text-misty-dark underline decoration-wheat decoration-4 underline-offset-4">윤님!</span></h1>
            <p className="text-base-500 font-medium">오늘은 3개의 문제를 뿌셔볼까요? 🔥</p>
          </div>
        </header>

        <UserTest />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['오늘의 목표', '연속 스트라이크', '현재 티어', '누적 포인트'].map((l, i) => (
            <div key={i} className="glass-card p-6 border-none hover:translate-y-[-4px] transition-transform cursor-pointer">
              <p className="text-xs font-bold text-base-400 mb-1 tracking-wider uppercase">{l}</p>
              <p className="text-2xl font-black text-base-800">{i === 0 ? '1 / 3' : i === 1 ? '12일' : i === 2 ? 'Solver II' : '1,200G'}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default App
