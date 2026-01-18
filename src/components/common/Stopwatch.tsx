import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, AlertCircle, X, Timer as TimerIcon, CheckCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface StopwatchProps {
    onComplete?: (problem: { title: string, platform: string, difficulty: string }) => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({ onComplete }) => {
    const { timer, stopTimer, resetTimer, getTotalElapsed, startTimer, dailyTasks, reviewPlans, studyLogs } = useUserStore();
    const { showConfirm } = useModalStore();
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

    // 브라우저 탭 타이틀 동기화
    const currentProblemId = timer.currentProblemId;
    const currentTime = currentProblemId ? getTotalElapsed(currentProblemId) : 0;

    // Resolve readable title
    const resolvedTitle = (() => {
        if (!currentProblemId) return null;
        const task = dailyTasks.find(t => t.problemId === currentProblemId);
        if (task) return task.problemTitle;
        const plan = reviewPlans.find(p => p.problemId === currentProblemId);
        if (plan) return plan.problemTitle;
        const log = studyLogs.find(l => l.problemId === currentProblemId);
        if (log) return log.problemTitle;
        return currentProblemId;
    })();

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

    const handleComplete = () => {
        if (!currentProblemId) return;

        stopTimer();
        setIsExpanded(false);

        // Find problem details to open the log modal correctly
        const task = dailyTasks.find(t => t.problemId === currentProblemId);
        const plan = reviewPlans.find(p => p.problemId === currentProblemId);
        const log = studyLogs.find(l => l.problemId === currentProblemId);

        const problemData = {
            title: resolvedTitle || currentProblemId,
            platform: task?.site || plan?.platform || log?.platform || 'BOJ' as any,
            difficulty: task?.difficulty || plan?.difficulty || log?.difficulty || '미정'
        };

        onComplete?.(problemData);
    };

    if (!currentProblemId) return null;

    const time = formatTime(currentTime);

    if (isExpanded) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-base-900/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
                <div className="glass-card bg-white w-full md:max-w-2xl h-[100dvh] md:h-auto overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:block rounded-none md:rounded-3xl">
                    <div className="bg-base-900 p-6 md:p-12 text-center text-white relative flex-1 md:flex-none flex flex-col justify-center">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="absolute right-4 top-4 md:right-6 md:top-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all z-20"
                        >
                            <Minimize2 className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col items-center gap-4">
                            <div className="px-4 py-1.5 bg-coral/20 text-coral rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                                {timer.isRunning ? 'Focus Mode Active' : 'Paused'}
                            </div>
                            <h2 className="text-xl md:text-2xl font-black leading-tight max-w-md mx-auto line-clamp-2 px-4">
                                {resolvedTitle}
                            </h2>
                            <div className="mt-8 flex items-baseline gap-2">
                                <span className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums">{time.main}</span>
                                <span className="text-2xl md:text-3xl font-bold text-white/30 tabular-nums w-12 text-left">{time.ms}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 flex justify-center gap-4 md:gap-8 items-center bg-white flex-1 md:flex-none">
                        <button
                            onClick={timer.isRunning ? stopTimer : () => startTimer(currentProblemId)}
                            className={clsx(
                                "w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl shrink-0",
                                timer.isRunning ? "bg-base-100 text-base-400" : "bg-base-900 text-white"
                            )}
                        >
                            {timer.isRunning ? <Pause className="w-6 h-6 md:w-10 md:h-10 fill-current" /> : <Play className="w-6 h-6 md:w-10 md:h-10 fill-current ml-2" />}
                        </button>

                        <button
                            onClick={handleComplete}
                            className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-misty text-white hover:bg-misty-dark flex flex-col items-center justify-center transition-all active:scale-90 shadow-xl shrink-0 gap-1"
                        >
                            <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                            <span className="text-[10px] md:text-xs font-black">해결완료</span>
                        </button>

                        <button
                            onClick={() => {
                                showConfirm(
                                    "기록 초기화",
                                    "현재 문제의 공부 기록을 초기화하시겠습니까?",
                                    () => resetTimer()
                                );
                            }}
                            className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-base-50 text-base-300 hover:bg-base-100 hover:text-base-500 flex items-center justify-center transition-all active:scale-90 shrink-0"
                        >
                            <RotateCcw className="w-6 h-6 md:w-10 md:h-10" />
                        </button>
                    </div>

                    <div className="px-6 pb-8 md:px-12 md:pb-12 text-center bg-white">
                        <div className="inline-flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 bg-sage-light/30 border border-sage/20 rounded-2xl text-sage-dark">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs md:text-sm font-bold text-left md:text-center">
                                정확한 기록을 위해 페이지를 닫지 말아주세요.<br className="md:hidden" /> (백그라운드에서도 측정됩니다)
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
                    <div className="glass-card bg-base-900 text-white p-1 pr-3 md:pr-4 flex items-center gap-3 md:gap-4 border-none shadow-2xl rounded-full relative group/timer">
                        {/* Close/Hide Button */}
                        <button
                            onClick={() => setIsHidden(true)}
                            className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-base-900 text-white rounded-full flex items-center justify-center border border-white/20 transition-all hover:bg-red-600 hover:scale-110 shadow-lg active:scale-90 cursor-pointer z-50 opacity-100 md:opacity-0 md:group-hover/timer:opacity-100"
                        >
                            <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </button>

                        <button
                            onClick={timer.isRunning ? stopTimer : () => startTimer(currentProblemId)}
                            className={clsx(
                                "w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer shrink-0",
                                timer.isRunning ? "bg-coral text-white" : "bg-white text-base-900 hover:bg-base-50"
                            )}
                        >
                            {timer.isRunning ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />}
                        </button>

                        <div className="cursor-pointer group flex items-center gap-3 md:gap-4 active:cursor-grabbing" onClick={() => setIsExpanded(true)}>
                            <div className="flex flex-col">
                                <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-0.5 md:mb-1 group-hover:text-misty transition-colors max-w-[100px] md:max-w-[120px] truncate">
                                    {resolvedTitle}
                                </span>
                                <span className="text-xl md:text-3xl font-black tracking-tighter leading-none tabular-nums">
                                    {time.main}
                                </span>
                            </div>
                            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors lg:block hidden">
                                <Maximize2 className="w-4 h-4 text-white/30 group-hover:text-white" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pl-2 md:pl-4 border-l border-white/10">
                            <button
                                onClick={handleComplete}
                                className="p-2 text-misty hover:text-white transition-colors cursor-pointer flex flex-col items-center group/complete"
                            >
                                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <button
                                onClick={() => {
                                    showConfirm(
                                        "기록 초기화",
                                        "현재 문제의 공부 기록을 초기화하시겠습니까?",
                                        () => resetTimer()
                                    );
                                }}
                                className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
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
