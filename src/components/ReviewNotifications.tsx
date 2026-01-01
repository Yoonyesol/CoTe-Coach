import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowRight, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

interface ReviewNotificationsProps {
    onReviewClick: (problem: { title: string, platform: string, difficulty: string }) => void;
}

const ReviewNotifications: React.FC<ReviewNotificationsProps> = ({ onReviewClick }) => {
    const { reviewPlans } = useUserStore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueReviews = reviewPlans.filter(plan => {
        if (plan.status === 'COMPLETED' || !plan.nextReviewAt) return false;
        const nextReviewDate = new Date(plan.nextReviewAt);
        nextReviewDate.setHours(0, 0, 0, 0);
        return nextReviewDate <= today;
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
            <div className="flex-1 min-h-0 relative z-10">
                <div className="h-full max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    <AnimatePresence mode="popLayout">
                        {dueReviews.length > 0 ? (
                            dueReviews.map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/40 flex items-center justify-between group/item hover:bg-white hover:border-lavender/30 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg flex-shrink-0 animate-in fade-in zoom-in">
                                            {plan.currentStage === 0 ? '🌱' : plan.currentStage >= 4 ? '🌳' : '🌿'}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-lavender-light text-lavender-dark rounded-md uppercase">
                                                    {plan.currentStage + 1}회차
                                                </span>
                                                <span className="text-[9px] font-bold text-base-400 truncate">{plan.platform} • {plan.difficulty}</span>
                                            </div>
                                            <h3 className="font-black text-base-800 text-sm truncate max-w-[150px] group-hover/item:text-lavender-dark transition-colors">
                                                {plan.problemTitle}
                                            </h3>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onReviewClick({
                                            title: plan.problemTitle,
                                            platform: plan.platform,
                                            difficulty: plan.difficulty
                                        })}
                                        className="p-2.5 bg-white text-lavender-dark rounded-xl shadow-sm hover:bg-lavender hover:text-white transition-all active:scale-90 border border-lavender/10"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))
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

            {/* Bottom Decoration */}
            {dueReviews.length > 0 && reviewPlans.some(p => p.status === 'COMPLETED') && (
                <div className="mt-4 pt-4 border-t border-base-100 flex items-center gap-2 relative z-10">
                    <Trophy className="w-3.5 h-3.5 text-sage-dark" />
                    <p className="text-[10px] font-bold text-sage-dark">
                        누적 {reviewPlans.filter(p => p.status === 'COMPLETED').length}개 정복 완료
                    </p>
                </div>
            )}
        </section>
    );
};

export default ReviewNotifications;
