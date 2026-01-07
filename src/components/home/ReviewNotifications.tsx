import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowRight, Trophy, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ReviewNotificationsProps {
    onPlanClick: (plan: any) => void;
}

const ReviewNotifications: React.FC<ReviewNotificationsProps> = ({ onPlanClick }) => {
    const { reviewPlans, timer } = useUserStore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueReviews = reviewPlans.filter(plan => {
        if (plan.status === 'COMPLETED' || !plan.nextReviewAt) return false;
        const nextReviewDate = new Date(plan.nextReviewAt);
        nextReviewDate.setHours(0, 0, 0, 0);
        return nextReviewDate <= today;
    });

    const completedToday = reviewPlans.filter(plan => {
        if (!plan.lastCompletedAt) return false;
        const lastDate = new Date(plan.lastCompletedAt);
        lastDate.setHours(0, 0, 0, 0);
        return lastDate.getTime() === today.getTime() && (plan.status === 'COMPLETED' || (plan.nextReviewAt && new Date(plan.nextReviewAt) > today));
    });

    return (
        <section className="glass-card p-6 border-none h-full flex flex-col group relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform pointer-events-none">🔔</div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-lavender-light p-2.5 rounded-2xl shadow-sm">
                        <Bell className={clsx("w-5 h-5 text-lavender-dark", dueReviews.length > 0 && "animate-bounce")} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-base-800 font-sans tracking-tight">잊기 전에 복습하세요!</h2>
                        <p className="text-[10px] font-bold text-base-400 uppercase tracking-widest font-sans">Review Notifications</p>
                    </div>
                </div>
                {dueReviews.length > 0 && (
                    <span className="px-3 py-1 bg-lavender text-white text-[10px] font-black rounded-full shadow-sm animate-pulse">
                        {dueReviews.length} DUE
                    </span>
                )}
            </div>

            {/* Scrollable List Area */}
            <div className="flex-1 min-h-0 relative z-10 flex flex-col">
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-3">
                    <AnimatePresence mode="popLayout">
                        {dueReviews.length > 0 ? (
                            dueReviews.map((plan, index) => {
                                const isTiming = timer.currentProblemId === plan.problemTitle && timer.isRunning;
                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => onPlanClick(plan)}
                                        className={clsx(
                                            "p-4 rounded-2xl border flex items-center justify-between group/item transition-all cursor-pointer",
                                            isTiming
                                                ? "bg-lavender-light/30 border-lavender shadow-md ring-1 ring-lavender/20"
                                                : "bg-white/50 backdrop-blur-sm border-white/40 hover:bg-white hover:border-lavender/30 hover:shadow-md"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg flex-shrink-0 animate-in fade-in zoom-in">
                                                {plan.currentStage === 0 ? '🌱' : plan.currentStage >= 4 ? '🌳' : '🌿'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[8px] md:text-[9px] font-black px-1.5 py-0.5 bg-lavender-light text-lavender-dark rounded-md uppercase shrink-0">
                                                        {plan.currentStage + 1}회차
                                                    </span>
                                                    <span title={`${plan.platform} • ${plan.difficulty}`} className="text-[9px] md:text-[10px] font-bold text-base-400 truncate">{plan.platform} • {plan.difficulty}</span>
                                                    {isTiming && (
                                                        <span className="flex h-1.5 w-1.5 rounded-full bg-coral animate-ping shrink-0" />
                                                    )}
                                                </div>
                                                <h3 title={plan.problemTitle} className="font-black text-base-800 text-xs md:text-sm truncate group-hover/item:text-lavender-dark transition-colors">
                                                    {plan.problemTitle}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="ml-3 p-2.5 bg-white text-base-300 group-hover/item:text-lavender-dark group-hover/item:bg-lavender-light/50 rounded-xl transition-all flex-shrink-0">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center py-12"
                            >
                                <div className="w-16 h-16 bg-sage-light/50 rounded-3xl flex items-center justify-center text-3xl mb-4">
                                    ✨
                                </div>
                                <h3 className="font-black text-base-800 text-sm">모든 복습을 마쳤습니다!</h3>
                                <p className="text-[11px] font-bold text-base-400 mt-1 max-w-[200px]">
                                    {reviewPlans.some(p => p.status === 'COMPLETED')
                                        ? `이미 ${reviewPlans.filter(p => p.status === 'COMPLETED').length}개의 문제를 정복하셨네요. 대단해요!`
                                        : '오늘 예정된 복습 일정이 없습니다.'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Decoration - Fixed at bottom if exists */}
            {dueReviews.length > 0 && reviewPlans.some(p => p.status === 'COMPLETED') && (
                <div className="mt-4 pt-4 border-t border-base-100 flex items-center gap-2 relative z-10 flex-shrink-0">
                    <Trophy className="w-3.5 h-3.5 text-sage-dark" />
                    <p className="text-[10px] font-bold text-sage-dark">
                        누적 {reviewPlans.filter(p => p.status === 'COMPLETED').length}개 정복 완료
                    </p>
                </div>
            )}

            {/* Completed Today Section - Fixed at bottom if exists */}
            {completedToday.length > 0 && (
                <div className="mt-6 pt-6 border-t border-base-100 relative z-10 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4 text-base-300" />
                        <h3 className="text-[10px] font-black text-base-300 uppercase tracking-widest">Completed Today</h3>
                    </div>
                    <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {completedToday.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => onPlanClick(plan)}
                                className="p-3 bg-base-50/50 border border-base-100 rounded-xl flex items-center justify-between group/item cursor-pointer hover:bg-base-100 transition-all opacity-60"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-sm">✅</span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black px-1 py-0.5 bg-base-200 text-base-400 rounded uppercase">
                                                {plan.currentStage === 0 ? '기본 완료' : `${plan.currentStage}차 완료`}
                                            </span>
                                            <h4 title={plan.problemTitle} className="text-xs font-bold text-base-400 truncate max-w-[150px]">
                                                {plan.problemTitle}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-3 h-3 text-base-200 group-hover/item:text-base-400 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ReviewNotifications;
