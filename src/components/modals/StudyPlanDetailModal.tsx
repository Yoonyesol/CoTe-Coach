import React from 'react';
import { X, Target, Calendar, BarChart3, TrendingUp, Award, Edit } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { motion } from 'framer-motion';

import { StudyPlanDetailModalProps } from '../../types/modal';

const StudyPlanDetailModal: React.FC<StudyPlanDetailModalProps> = ({ isOpen, onClose, onEditPlan }) => {
    const { studyPlan, getDailyProgress, getDaysRemaining, level, tier } = useUserStore();

    if (!isOpen) return null;

    const dailyProgress = getDailyProgress();
    const daysRemaining = getDaysRemaining();
    const progressPercentage = Math.min(100, (dailyProgress.solved / dailyProgress.goal) * 100);

    // Calculate tier progress (example: current level vs target tier level)
    const targetTierMap: Record<string, number> = {
        'Bronze 5': 1, 'Bronze 4': 2, 'Bronze 3': 3, 'Bronze 2': 4, 'Bronze 1': 5,
        'Silver 5': 6, 'Silver 4': 7, 'Silver 3': 8, 'Silver 2': 9, 'Silver 1': 10,
        'Gold 5': 11, 'Gold 4': 12, 'Gold 3': 13, 'Gold 2': 14, 'Gold 1': 15,
        'Platinum 5': 16, 'Platinum 4': 17, 'Platinum 3': 18, 'Platinum 2': 19, 'Platinum 1': 20,
        'Diamond 5': 21, 'Diamond 4': 22, 'Diamond 3': 23, 'Diamond 2': 24, 'Diamond 1': 25,
    };

    const currentTierLevel = targetTierMap[tier] || level;
    const targetTierLevel = targetTierMap[studyPlan.targetTier] || 30;
    const tierProgressPercentage = Math.min(100, (currentTierLevel / targetTierLevel) * 100);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-2xl bg-white border-none shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-misty-dark to-misty p-8 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl" />

                    <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-xl transition-colors text-white z-20 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 text-white mb-3 relative z-10">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                            <Target className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black font-sans tracking-tight">학습 플랜</h2>
                            <p className="text-white/80 text-sm font-bold">나의 코딩 성장 여정</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 -mt-8 bg-white rounded-t-[2.5rem] relative z-20 overflow-y-auto space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Daily Goal */}
                        <div className="p-5 bg-gradient-to-br from-sage-light to-sage-light/30 rounded-2xl border border-sage/30 space-y-2">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-sage-dark" />
                                <p className="text-[10px] font-black text-sage-dark uppercase tracking-tighter">오늘의 목표</p>
                            </div>
                            <p className="text-3xl font-black text-base-900">{dailyProgress.solved}<span className="text-lg text-base-400">/{dailyProgress.goal}</span></p>
                            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-sage-dark rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* D-Day */}
                        <div className="p-5 bg-gradient-to-br from-coral/10 to-coral/5 rounded-2xl border border-coral/20 space-y-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-coral" />
                                <p className="text-[10px] font-black text-coral uppercase tracking-tighter">남은 기간</p>
                            </div>
                            <p className="text-3xl font-black text-base-900">D-{daysRemaining}</p>
                            <p className="text-xs font-bold text-base-500">{new Date(studyPlan.targetDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}까지</p>
                        </div>

                        {/* Target Tier */}
                        <div className="p-5 bg-gradient-to-br from-misty-light to-misty-light/30 rounded-2xl border border-misty/30 space-y-2">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-misty-dark" />
                                <p className="text-[10px] font-black text-misty-dark uppercase tracking-tighter">목표 티어</p>
                            </div>
                            <p className="text-lg font-black text-base-900">{studyPlan.targetTier}</p>
                            <p className="text-xs font-bold text-base-500">현재: {tier}</p>
                        </div>
                    </div>

                    {/* Tier Progress */}
                    <div className="p-6 bg-base-50 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-misty-dark" />
                                <h3 className="text-sm font-black text-base-900 uppercase tracking-wider">티어 달성 진행도</h3>
                            </div>
                            <span className="text-2xl font-black text-misty-dark">{Math.round(tierProgressPercentage)}%</span>
                        </div>
                        <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-misty to-misty-dark rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${tierProgressPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-base-500">
                            <span>Lv.{currentTierLevel}</span>
                            <span>Lv.{targetTierLevel} 도달 목표</span>
                        </div>
                    </div>

                    {/* Study Intensity */}
                    <div className="p-6 bg-gradient-to-br from-lavender-light/30 to-lavender-light/10 rounded-2xl border border-lavender/20 space-y-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-lavender-dark" />
                            <h3 className="text-sm font-black text-base-900 uppercase tracking-wider">학습 강도</h3>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-lavender-dark">{studyPlan.problemCount}</span>
                            <span className="text-lg font-bold text-base-500 mb-1">문제 / 일</span>
                        </div>
                        <p className="text-sm font-medium text-base-600">
                            {studyPlan.problemCount <= 2 && "가벼운 워밍업 모드로 진행 중입니다 🐢"}
                            {studyPlan.problemCount > 2 && studyPlan.problemCount <= 5 && "균형잡힌 학습 강도로 진행 중입니다 🚀"}
                            {studyPlan.problemCount > 5 && "도전적인 강도로 빠르게 성장하고 있습니다 🔥"}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-white border-2 border-base-200 text-base-600 rounded-2xl font-black hover:bg-base-50 transition-all"
                        >
                            닫기
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onEditPlan();
                            }}
                            className="flex-1 py-4 bg-base-900 text-white rounded-2xl font-black shadow-lg hover:bg-base-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Edit className="w-5 h-5" />
                            플랜 수정하기
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudyPlanDetailModal;
