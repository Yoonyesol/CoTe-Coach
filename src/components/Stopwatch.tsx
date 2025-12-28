import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, AlertCircle, X, Timer as TimerIcon } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Stopwatch: React.FC = () => {
    const { timer, stopTimer, resetTimer, getTotalElapsed, startTimer } = useUserStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
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
                <div className="glass-card bg-white w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
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
        <AnimatePresence>
            {isHidden ? (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => setIsHidden(false)}
                    className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-base-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-base-800 transition-colors group border-2 border-white/20"
                >
                    <TimerIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    {timer.isRunning && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-coral rounded-full border-2 border-white animate-pulse" />
                    )}
                </motion.button>
            ) : (
                <motion.div
                    drag
                    dragMomentum={false}
                    dragElastic={0.1}
                    dragConstraints={{
                        top: -window.innerHeight + 150,
                        left: -window.innerWidth + 350,
                        right: 8,
                        bottom: 8
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={clsx(
                        "fixed bottom-8 right-8 z-40 touch-none", // drag needs touch-none
                        timer.isRunning ? "scale-105" : "scale-100"
                    )}
                >
                    <div className="glass-card bg-base-900 text-white p-1 pr-4 flex items-center gap-4 border-none shadow-2xl rounded-full relative group/timer">
                        {/* Close/Hide Button */}
                        <button
                            onClick={() => setIsHidden(true)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-base-900 text-white rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover/timer:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg active:scale-90"
                        >
                            <X className="w-3 h-3" />
                        </button>

                        <button
                            onClick={timer.isRunning ? stopTimer : () => startTimer(currentProblem)}
                            className={clsx(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg",
                                timer.isRunning ? "bg-coral text-white" : "bg-white text-base-900 hover:bg-base-50"
                            )}
                        >
                            {timer.isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>

                        <div className="cursor-pointer group flex items-center gap-4 active:cursor-grabbing" onClick={() => setIsExpanded(true)}>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-sans leading-none mb-1 group-hover:text-misty transition-colors max-w-[120px] truncate">
                                    {currentProblem}
                                </span>
                                <span className="text-3xl font-black font-sans tracking-tighter leading-none tabular-nums">
                                    {time.main}
                                </span>
                            </div>
                            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors lg:block hidden">
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
                    {/* Drag Handle Indicator */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 rounded-full group-hover/timer:bg-white/30 transition-colors" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Stopwatch;
