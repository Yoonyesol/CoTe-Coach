import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Zap, Flame, Play, Pause, Timer as TimerIcon, CheckCircle, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DailyTask } from '../../types/study';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CustomProblemCardProps {
    task: DailyTask;
    onComplete: (task: DailyTask) => void;
    onEdit?: (task: DailyTask) => void;
}

const CustomProblemCard: React.FC<CustomProblemCardProps> = ({ task, onComplete, onEdit }) => {
    const { deleteDailyTask, timer, startTimer, stopTimer, getTotalElapsed, studyLogs } = useUserStore();
    const { showAlert, showConfirm } = useModalStore();

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isCurrent = timer.currentProblemId === task.problemId;
    const isOtherRunning = timer.isRunning && !isCurrent;
    const isAlreadySolved = studyLogs.some(l =>
        (l.problemId === task.problemId || l.problemTitle === task.problemTitle) &&
        l.result === 'SUCCESS'
    );
    const isCompleted = task.status === 'completed' || isAlreadySolved;
    const elapsed = getTotalElapsed(task.problemId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (ms: number) => {
        if (ms === 0) return "0:00";
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = (e: React.MouseEvent) => {
        e.stopPropagation();
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
        showConfirm(
            "문제 삭제",
            "이 문제를 리스트에서 삭제하시겠습니까?",
            async () => {
                await deleteDailyTask(task.id);
                setShowMenu(false);
            }
        );
    };

    const getPlatformLabel = (site: string) => {
        switch (site) {
            case 'BOJ': return '백준';
            case 'PROG': return 'Prog';
            case 'LC': return 'LeetCode';
            case 'SWEA': return 'SWEA';
            default: return site;
        }
    };

    const getPlatformColor = (site: string) => {
        switch (site) {
            case 'BOJ': return "text-blue-600 bg-blue-50";
            case 'PROG': return "text-indigo-600 bg-indigo-50";
            case 'LC': return "text-orange-600 bg-orange-50";
            case 'SWEA': return "text-teal-600 bg-teal-50";
            default: return "text-base-500 bg-base-50";
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className={cn(
                "glass-card group relative p-5 bg-white border border-base-100 transition-all duration-300 hover:shadow-xl flex flex-col h-full font-sans overflow-visible",
                isCurrent && "ring-2 ring-misty shadow-xl",
                (isOtherRunning || isCompleted) && "opacity-75 saturate-50"
            )}
        >
            {/* Top Row: Badges & Menu */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-1.5">
                    <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
                        isCompleted ? "bg-sage-light text-sage-dark" :
                            isCurrent && timer.isRunning ? "bg-coral text-white animate-pulse" : "bg-lavender-light text-lavender-dark"
                    )}>
                        {isCompleted ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5" /> Solved
                            </>
                        ) : isCurrent && timer.isRunning ? (
                            <>
                                <Flame className="w-3.5 h-3.5" /> Solving
                            </>
                        ) : (
                            <>
                                <Zap className="w-3 h-3" /> Custom
                            </>
                        )}
                    </span>
                    <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                        getPlatformColor(task.site)
                    )}>
                        {getPlatformLabel(task.site)}
                    </span>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 text-base-300 hover:text-base-600 hover:bg-base-50 rounded-lg transition-all"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-2xl border border-base-100 py-1.5 z-50 origin-top-right overflow-hidden"
                            >
                                <button
                                    onClick={() => { onEdit?.(task); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-base-600 hover:bg-base-50 flex items-center gap-2"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> 수정하기
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> 삭제하기
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Problem Title */}
            <div className="mb-4">
                <a
                    href={task.url || '#'}
                    target={task.url ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className={cn(
                        "inline-flex items-center gap-1.5 text-lg font-black text-base-900 leading-tight transition-colors hover:text-misty-dark",
                        (!task.url || isCompleted) && "cursor-default text-base-400"
                    )}
                >
                    <span className="line-clamp-2">{task.problemTitle}</span>
                    {task.url && <ExternalLink className="w-4 h-4 text-base-300 shrink-0" />}
                </a>
                <p className="text-xs font-bold text-base-400 mt-1">{task.difficulty}</p>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                    {task.tags.filter(t => t !== '__auto').map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold text-base-400 bg-base-50 px-2 py-0.5 rounded">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Bottom Section: Time & Actions */}
            <div className="mt-auto pt-4 border-t border-base-50 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-base-400">
                        <TimerIcon className="w-3.5 h-3.5" />
                        <span>{formatTime(elapsed)} 소요됨</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Start/Pause Timer */}
                    <button
                        onClick={handleStart}
                        disabled={isOtherRunning || isCompleted}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm",
                            isCurrent && timer.isRunning ? "bg-base-900 text-white" : "bg-base-100 text-base-600 hover:bg-base-200",
                            (isOtherRunning || isCompleted) && "opacity-50 grayscale cursor-not-allowed"
                        )}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                완료됨
                            </>
                        ) : (
                            <>
                                {isCurrent && timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isCurrent && timer.isRunning ? '일시정지' : (elapsed > 0 ? '계속하기' : '시작')}
                            </>
                        )}
                    </button>

                    {/* Complete & Review */}
                    <button
                        onClick={() => onComplete(task)}
                        disabled={isCompleted}
                        className={cn(
                            "flex-[1.5] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-misty/20",
                            isCompleted
                                ? "bg-base-100 text-base-400 cursor-not-allowed"
                                : "bg-misty text-white hover:bg-misty-dark"
                        )}
                    >
                        <CheckCircle className="w-4 h-4" />
                        {isCompleted ? '기록 제출됨' : '로그 작성 및 완료'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomProblemCard;
