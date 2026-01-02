import React from 'react';
import { ExternalLink, Zap, Play, Pause, Timer as TimerIcon, CheckCircle, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DailyTask } from '../../types/study';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CustomProblemCardProps {
    task: DailyTask;
    onComplete: (task: DailyTask) => void;
}

const CustomProblemCard: React.FC<CustomProblemCardProps> = ({ task, onComplete }) => {
    const { deleteDailyTask, timer, startTimer, stopTimer, getTotalElapsed } = useUserStore();
    const { showAlert } = useModalStore();

    const isCurrent = timer.currentProblemId === task.problemId;
    const isOtherRunning = timer.isRunning && !isCurrent;
    const elapsed = getTotalElapsed(task.problemId);

    const formatTime = (ms: number) => {
        if (ms === 0) return null;
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (isOtherRunning) {
            showAlert(
                "타이머 중복",
                "이미 다른 문제를 풀이 중입니다. 현재 진행 중인 타이머를 먼저 중단해주세요!"
            );
            return;
        }

        if (isCurrent && timer.isRunning) {
            stopTimer();
        } else {
            startTimer(task.problemId);
        }
    };

    const handleDelete = async () => {
        await deleteDailyTask(task.id);
    };

    const getPlatformLabel = (site: string) => {
        switch (site) {
            case 'BOJ': return '백준';
            case 'PROG': return 'Programmers';
            case 'LC': return 'LeetCode';
            case 'SWEA': return 'SWEA';
            default: return site;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className={cn(
                "glass-card p-6 border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between h-full group font-sans",
                "border-lavender",
                isCurrent && "ring-4 ring-misty shadow-2xl scale-[1.02]",
                isOtherRunning && "opacity-60 saturate-50"
            )}
        >
            <div className="space-y-4">
                {/* Card Header: Type Label */}
                <div className="flex justify-between items-center">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black",
                        isCurrent && timer.isRunning ? "bg-coral-light text-coral-dark" : "bg-lavender-light text-lavender-dark"
                    )}>
                        {isCurrent && timer.isRunning ? (
                            <>
                                <Zap className="w-4 h-4 animate-pulse" />
                                문제 풀이 중...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                직접 추가
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {elapsed > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-base-100 rounded-lg text-[10px] font-black text-base-500">
                                <TimerIcon className="w-3 h-3" />
                                {formatTime(elapsed)}
                            </div>
                        )}
                        <span className="text-xs font-bold text-base-400">{getPlatformLabel(task.site)}</span>
                    </div>
                </div>

                {/* Card Body: Problem Info */}
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-base-800 line-clamp-2 leading-tight group-hover:text-lavender-dark transition-colors">
                        {task.problemTitle}
                    </h3>
                    <p className="text-sm font-bold text-base-500">{task.difficulty}</p>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/50 rounded-lg text-xs font-medium text-base-600 border border-white/50">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Card Footer: Action */}
            <div className="mt-6 pt-4 border-t border-white/30 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        onClick={handleStart}
                        disabled={isOtherRunning}
                        className={cn(
                            "w-full sm:flex-1 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer",
                            isCurrent && timer.isRunning ? "bg-coral text-white" : "bg-base-100 text-base-600 hover:bg-base-200",
                            isOtherRunning && "cursor-not-allowed opacity-50"
                        )}
                    >
                        {isCurrent && timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isCurrent && timer.isRunning ? '중단' : (elapsed > 0 ? '이어서 풀기' : '풀이 시작')}
                    </button>

                    {task.url && (
                        <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm cursor-pointer w-full sm:w-auto bg-white border border-base-200 text-base-800 hover:bg-base-50"
                        >
                            문제 열기
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}

                    <button
                        onClick={() => onComplete(task)}
                        className="w-full sm:w-auto p-2.5 bg-sage-light text-sage-dark border-2 border-sage/30 rounded-xl hover:bg-sage hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer group flex items-center justify-center gap-2"
                        title="완료 처리"
                    >
                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="sm:hidden font-black text-sm">완료 체크</span>
                    </button>

                    <button
                        onClick={handleDelete}
                        className="w-full sm:w-auto p-2.5 bg-base-50 text-base-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer flex items-center justify-center gap-2"
                        title="삭제"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="sm:hidden font-black text-sm">삭제</span>
                    </button>
                </div>

                {/* Review Submission Button: Only shown when time is recorded and not currently running */}
                {elapsed > 0 && !timer.isRunning && (
                    <button
                        onClick={() => onComplete(task)}
                        className="w-full py-2.5 bg-misty-light text-misty-dark border-2 border-misty/30 rounded-xl text-xs font-black hover:bg-misty hover:text-white transition-all flex items-center justify-center gap-2 animate-in slide-in-from-top-2 cursor-pointer"
                    >
                        <CheckCircle className="w-4 h-4" />
                        복습 로그 작성하고 기록 완료하기
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default CustomProblemCard;
