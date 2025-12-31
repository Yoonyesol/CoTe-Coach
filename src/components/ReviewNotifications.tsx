import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowRight, Trophy } from 'lucide-react';

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

    if (dueReviews.length === 0) return null;

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="bg-lavender-light p-2 rounded-lg">
                    <Bell className="w-5 h-5 text-lavender-dark animate-bounce" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-base-800 font-sans">잊기 전에 복습하세요!</h2>
                    <p className="text-xs font-bold text-base-400 uppercase tracking-widest font-sans">Review Notifications</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-lavender text-white text-[10px] font-black rounded-full">
                    {dueReviews.length} PROBLEMS DUE
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {dueReviews.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-5 border-lavender/30 bg-lavender-light/10 flex items-center justify-between group hover:border-lavender transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl">
                                    {plan.currentStage === 0 ? '🌱' : plan.currentStage >= 4 ? '🌳' : '🌿'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-lavender-light text-lavender-dark rounded uppercase">
                                            {plan.currentStage + 1}회차 복습
                                        </span>
                                        <span className="text-[10px] font-bold text-base-400">{plan.platform} • {plan.difficulty}</span>
                                    </div>
                                    <h3 className="font-black text-base-800 text-sm mt-1 group-hover:text-lavender-dark transition-colors">
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
                                className="p-3 bg-white text-lavender-dark rounded-xl shadow-sm hover:bg-lavender hover:text-white transition-all active:scale-90 border border-lavender/20"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Mastered Message (Optional/Fun) */}
            {reviewPlans.some(p => p.status === 'COMPLETED') && (
                <div className="flex items-center gap-2 px-4 py-3 bg-sage-light/20 rounded-2xl border border-sage/10">
                    <Trophy className="w-4 h-4 text-sage-dark" />
                    <p className="text-[11px] font-bold text-sage-dark">
                        이미 {reviewPlans.filter(p => p.status === 'COMPLETED').length}개의 문제를 완전히 마스터하셨어요! 멋져요! ✨
                    </p>
                </div>
            )}
        </section>
    );
};

export default ReviewNotifications;
