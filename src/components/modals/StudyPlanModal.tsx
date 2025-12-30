import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, BarChart3, Save } from 'lucide-react';
import { useUserStore, StudyPlan } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { motion } from 'framer-motion';

interface StudyPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StudyPlanModal: React.FC<StudyPlanModalProps> = ({ isOpen, onClose }) => {
    const { studyPlan, setStudyPlan } = useUserStore();
    const { showAlert } = useModalStore();
    const [localPlan, setLocalPlan] = useState<StudyPlan>({
        ...studyPlan
    });

    useEffect(() => {
        if (isOpen) {
            setLocalPlan({
                ...studyPlan
            });
        }
    }, [isOpen, studyPlan]);

    // Prevent background scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleSave = () => {
        setStudyPlan(localPlan);
        showAlert("플랜 저장 완료", "개인화된 학습 목표가 설정되었습니다. 이제 달려볼까요? 🔥");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-md max-h-[90vh] bg-white border-none shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
                {/* Header with gradient background */}
                <div className="bg-misty-dark p-8 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-xl transition-colors text-white z-20 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 text-white mb-2 relative z-10">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black font-sans uppercase tracking-tight">학습 플랜 설정</h2>
                    </div>
                    <p className="text-white/80 text-sm font-medium font-sans relative z-10">나에게 맞는 학습 강도로 목표 티어를 달성하세요.</p>
                </div>
                <style>{`
                    #study-plan-content::-webkit-scrollbar {
                        width: 6px;
                    }
                    #study-plan-content::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    #study-plan-content::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 9999px;
                    }
                    #study-plan-content::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                `}</style>
                <div className="flex-1 -mt-8 bg-white rounded-t-[2.5rem] relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex flex-col min-h-0 overflow-hidden">
                    <div
                        id="study-plan-content"
                        className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 mt-10"
                    >
                        {/* Target Tier */}
                        <div className="space-y-3 pt-5">
                            <div className="flex items-center gap-2 text-base-400">
                                <BarChart3 className="w-4 h-4 text-misty" />
                                <label className="text-[10px] font-black uppercase tracking-widest font-sans">목표 티어</label>
                            </div>
                            <div className="relative">
                                <select
                                    value={localPlan.targetTier}
                                    onChange={(e) => setLocalPlan({ ...localPlan, targetTier: e.target.value })}
                                    className="w-full px-5 py-4 bg-base-50 border-none rounded-2xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold font-sans appearance-none shadow-inner cursor-pointer"
                                >
                                    {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map(t => (
                                        [5, 4, 3, 2, 1].map(v => (
                                            <option key={`${t} ${v}`} value={`${t} ${v}`}>{t} {v}</option>
                                        ))
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-base-300">
                                    <Save className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Daily Problem Count */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-base-400">
                                    <Target className="w-4 h-4 text-misty" />
                                    <label className="text-[10px] font-black uppercase tracking-widest font-sans">일일 목표 문제 수</label>
                                </div>
                                <span className="text-3xl font-black text-misty-dark font-sans tracking-tight">{localPlan.problemCount}</span>
                            </div>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={localPlan.problemCount}
                                    onChange={(e) => setLocalPlan({ ...localPlan, problemCount: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-base-100 rounded-lg appearance-none cursor-pointer accent-misty-dark"
                                />
                            </div>
                            <div className="p-4 bg-base-50 rounded-2xl border border-base-100/50">
                                <p className="text-[11px] text-base-500 font-bold font-sans leading-relaxed text-center">
                                    {localPlan.problemCount <= 2 && "🐢 가벼운 워밍업 모드입니다. 부담 없이 시작해봐요!"}
                                    {localPlan.problemCount > 2 && localPlan.problemCount <= 5 && "🚀 가장 추천하는 학습 강도입니다. 꾸준함이 생명!"}
                                    {localPlan.problemCount > 5 && "🔥 상당히 도전적인 계획입니다. 빡세게 달려볼까요?"}
                                </p>
                            </div>
                        </div>

                        {/* Target Date */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-base-400">
                                <Calendar className="w-4 h-4 text-misty" />
                                <label className="text-[10px] font-black uppercase tracking-widest font-sans">달성 목표일</label>
                            </div>
                            <input
                                type="date"
                                value={localPlan.targetDate.split('T')[0]}
                                onChange={(e) => setLocalPlan({ ...localPlan, targetDate: new Date(e.target.value).toISOString() })}
                                className="w-full px-5 py-4 bg-base-50 border-none rounded-2xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold font-sans shadow-inner"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-5 bg-base-900 text-white rounded-[1.25rem] font-black shadow-xl hover:bg-base-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group cursor-pointer"
                        >
                            <span>플랜 저장하고 시작하기</span>
                            <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudyPlanModal;
