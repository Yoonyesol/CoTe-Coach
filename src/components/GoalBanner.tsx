import React from 'react';
import { Target, Calendar, Zap, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { getLocalDateString } from '../lib/dateUtils';
import clsx from 'clsx';

interface GoalBannerProps {
    onOpenGoalModal: () => void;
}

const GoalBanner: React.FC<GoalBannerProps> = ({ onOpenGoalModal }) => {
    const { getActiveGoal, studyLogs, updateGoal } = useUserStore();
    const activeGoal = getActiveGoal();

    // Calculate D-Day
    const getDDay = () => {
        if (!activeGoal) return null;
        const today = new Date();
        const endDate = new Date(activeGoal.endDate);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Calculate progress for goal period
    const getProgress = () => {
        if (!activeGoal) return { todaySolved: 0, todayGoal: 2, totalSolved: 0, totalDays: 0, expectedTotal: 0 };

        const today = getLocalDateString(new Date());
        const startDate = new Date(activeGoal.startDate);
        const endDate = new Date(activeGoal.endDate);
        const daysPassed = Math.max(1, Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Count logs in goal period
        const logsInPeriod = studyLogs.filter(log => {
            const logDate = getLocalDateString(new Date(log.completedAt));
            return logDate >= activeGoal.startDate && logDate <= activeGoal.endDate;
        });

        const todayLogs = studyLogs.filter(log => {
            const logDate = getLocalDateString(new Date(log.completedAt));
            return logDate === today;
        });

        return {
            todaySolved: todayLogs.length,
            todayGoal: activeGoal.dailyTarget,
            totalSolved: logsInPeriod.length,
            totalDays,
            expectedTotal: daysPassed * activeGoal.dailyTarget
        };
    };

    const dDay = getDDay();
    const progress = getProgress();

    const handleComplete = async () => {
        if (activeGoal) {
            await updateGoal(activeGoal.id, { status: 'COMPLETED' });
        }
    };

    // No active goal - show "Set Goal" button
    if (!activeGoal) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 border-none bg-gradient-to-r from-white to-lavender-light/20 shadow-lg mb-8"
            >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-lavender-light rounded-2xl">
                            <Target className="w-6 h-6 text-lavender-dark" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-base-800 font-sans">학습 목표 설정</h3>
                            <p className="text-sm font-medium text-base-400">시험 대비나 집중 학습이 필요할 때 목표를 설정해보세요!</p>
                        </div>
                    </div>
                    <button
                        onClick={onOpenGoalModal}
                        className="px-6 py-3 bg-lavender text-white font-black rounded-xl hover:bg-lavender-dark transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        목표 설정하기
                    </button>
                </div>
            </motion.div>
        );
    }

    // Has active goal - show progress banner
    const progressPercent = Math.min(100, (progress.totalSolved / progress.expectedTotal) * 100) || 0;
    const isAhead = progress.totalSolved >= progress.expectedTotal;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-none bg-gradient-to-r from-misty-light/50 to-coral-light/30 shadow-lg mb-8"
        >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left: Goal Info */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-coral-light rounded-2xl">
                        <Target className="w-6 h-6 text-coral" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-black text-base-800 font-sans">{activeGoal.name}</h3>
                            <span className={clsx(
                                "px-2 py-0.5 rounded-lg text-xs font-black",
                                dDay !== null && dDay <= 7 ? "bg-coral/10 text-coral" : "bg-misty-light text-misty-dark"
                            )}>
                                D{dDay !== null && dDay >= 0 ? `-${dDay}` : (dDay !== null ? `+${Math.abs(dDay)}` : '')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-base-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {activeGoal.startDate} ~ {activeGoal.endDate}
                            </span>
                            {activeGoal.focusTags.length > 0 && (
                                <span className="px-2 py-0.5 bg-white/50 rounded text-[10px] font-black">
                                    {activeGoal.focusTags.slice(0, 3).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center: Progress */}
                <div className="flex-1 max-w-md">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-base-500">
                            오늘 <span className="text-misty-dark">{progress.todaySolved}/{progress.todayGoal}</span>
                        </span>
                        <span className="text-xs font-black text-base-500">
                            누적 <span className={isAhead ? "text-sage" : "text-coral"}>{progress.totalSolved}</span>/{progress.expectedTotal} 문제
                        </span>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={clsx(
                                "h-full rounded-full",
                                isAhead ? "bg-gradient-to-r from-sage to-sage-dark" : "bg-gradient-to-r from-coral to-misty"
                            )}
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenGoalModal}
                        className="p-2 bg-white/50 text-base-500 rounded-xl hover:bg-white hover:text-misty-dark transition-all cursor-pointer"
                        title="관리"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleComplete}
                        className="px-4 py-2 bg-sage-light text-sage-dark font-black text-sm rounded-xl hover:bg-sage hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <CheckCircle className="w-4 h-4" />
                        완료
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default GoalBanner;
