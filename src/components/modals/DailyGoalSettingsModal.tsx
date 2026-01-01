import React, { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { motion } from 'framer-motion';

interface DailyGoalSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DailyGoalSettingsModal: React.FC<DailyGoalSettingsModalProps> = ({ isOpen, onClose }) => {
    const { recommendationSettings, setRecommendationSettings } = useUserStore();
    const [localGoal, setLocalGoal] = useState<number>(recommendationSettings.dailyTargetFallback);

    useEffect(() => {
        if (isOpen) {
            setLocalGoal(recommendationSettings.dailyTargetFallback);
        }
    }, [isOpen, recommendationSettings.dailyTargetFallback]);

    const handleSave = () => {
        setRecommendationSettings({
            ...recommendationSettings,
            dailyTargetFallback: localGoal
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-base-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-sm bg-white border-none shadow-2xl relative z-10 overflow-hidden rounded-[2rem] flex flex-col"
            >
                <div className="p-6 border-b border-base-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-misty/10 rounded-xl">
                            <Target className="w-5 h-5 text-misty-dark" />
                        </div>
                        <h3 className="text-lg font-black font-sans uppercase tracking-tight">하루 목표 설정</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-base-50 rounded-xl transition-colors text-base-400 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-4xl font-black text-base-900">{localGoal}<span className="text-sm ml-1 text-base-400">문제</span></p>
                            <p className="text-[10px] text-base-400 font-bold uppercase tracking-widest">Daily Target</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={localGoal}
                                onChange={(e) => setLocalGoal(parseInt(e.target.value))}
                                className="w-full accent-misty-dark h-2 bg-base-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between px-1">
                                <span className="text-[10px] font-bold text-base-300">1문제</span>
                                <span className="text-[10px] font-bold text-base-300">10문제</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-sage-light/20 p-4 rounded-2xl border border-sage-light/30">
                        <p className="text-xs text-sage-dark leading-relaxed font-medium">
                            💡 기본 목표: 별도의 챌린지나 목표 기간이 아닐 때, 나의 페이스를 유지하기 위한 하루 권장량입니다.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-base-900 text-white rounded-2xl font-black shadow-lg hover:bg-base-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>설정 완료</span>
                        <Check className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default DailyGoalSettingsModal;
