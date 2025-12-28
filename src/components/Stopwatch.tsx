import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { clsx } from 'clsx';

const Stopwatch: React.FC = () => {
    const { timer, stopTimer, resetTimer, getTotalElapsed, startTimer } = useUserStore();
    const [isExpanded, setIsExpanded] = useState(false);
    // 타이머의 숫자를 갱신하기 위한 '틱' 상태 (실제 시간값은 getTotalElapsed에서 계산)
    const [, setTick] = useState(0);

    // 실시간 UI 업데이트를 위한 인터벌 설정
    useEffect(() => {
        if (timer.isRunning) {
            const interval = window.setInterval(() => {
                setTick(t => t + 1);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [timer.isRunning]);

    // 브라우저 탭 타이틀 동기화 (렌더링 시점에 계산된 시간을 사용)
    const currentProblem = timer.currentProblemId;
    const currentTime = currentProblem ? getTotalElapsed(currentProblem) : 0;

    useEffect(() => {
        if (timer.isRunning && currentTime > 0) {
            const totalSeconds = Math.floor(currentTime / 1000);
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            document.title = `(${timeStr}) CoTe Coach`;
        } else {
            document.title = 'CoTe Coach';
        }
    }, [timer.isRunning, currentTime]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const msPart = Math.floor((ms % 1000) / 10);
        return {
            main: `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
            ms: msPart.toString().padStart(2, '0')
        };
    };

    if (!currentProblem) return null;

    const time = formatTime(currentTime);

    if (isExpanded) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-base-900/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="glass-card bg-white w-full max-max-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="bg-base-900 p-12 text-center text-white relative">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <Minimize2 className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col items-center gap-4">
                            <div className="px-4 py-1.5 bg-coral/20 text-coral rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                                {timer.isRunning ? 'Focus Mode Active' : 'Paused'}
                            </div>
                            <h2 className="text-2xl font-black font-sans leading-tight max-w-md mx-auto line-clamp-2">
                                {currentProblem}
                            </h2>
                            <div className="mt-8 flex items-baseline gap-2">
                                <span className="text-8xl font-black font-sans tracking-tighter tabular-nums">{time.main}</span>
                                <span className="text-3xl font-bold text-white/30 font-sans tabular-nums w-12 text-left">{time.ms}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-12 flex justify-center gap-8">
                        <button
                            onClick={timer.isRunning ? stopTimer : () => startTimer(currentProblem)}
                            className={clsx(
                                "w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl",
                                timer.isRunning ? "bg-base-100 text-base-400" : "bg-base-900 text-white"
                            )}
                        >
                            {timer.isRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm("기록을 초기화하시겠습니까?")) resetTimer();
                            }}
                            className="w-24 h-24 rounded-full bg-base-50 text-base-300 hover:bg-base-100 hover:text-base-500 flex items-center justify-center transition-all active:scale-90"
                        >
                            <RotateCcw className="w-10 h-10" />
                        </button>
                    </div>

                    <div className="px-12 pb-12 text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-4 bg-sage-light/30 border border-sage/20 rounded-2xl text-sage-dark">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-bold font-sans">
                                정확한 기록을 위해 페이지를 닫지 말아주세요. (백그라운드에서도 안전하게 측정됩니다)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(
            "fixed bottom-8 right-8 z-40 transition-all duration-500 animate-in slide-in-from-bottom-5",
            timer.isRunning ? "scale-105" : "scale-100"
        )}>
            <div className="glass-card bg-base-900 text-white p-1 pr-4 flex items-center gap-4 border-none shadow-2xl rounded-full">
                <button
                    onClick={timer.isRunning ? stopTimer : () => startTimer(currentProblem)}
                    className={clsx(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg",
                        timer.isRunning ? "bg-coral text-white" : "bg-white text-base-900 hover:bg-base-50"
                    )}
                >
                    {timer.isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <div className="cursor-pointer group flex items-center gap-4" onClick={() => setIsExpanded(true)}>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-sans leading-none mb-1 group-hover:text-misty transition-colors">
                            {currentProblem}
                        </span>
                        <span className="text-3xl font-black font-sans tracking-tighter leading-none tabular-nums">
                            {time.main}
                        </span>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                        <Maximize2 className="w-4 h-4 text-white/30 group-hover:text-white" />
                    </div>
                </div>

                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                    <button
                        onClick={() => resetTimer()}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Stopwatch;
