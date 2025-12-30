import React, { useState, useEffect } from 'react';
import { X, BarChart3, HelpCircle, Check } from 'lucide-react';
import { useUserStore, RecommendationSettings } from '../store/useUserStore';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import DifficultyGuideModal from './DifficultyGuideModal';

interface RecommendationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RecommendationSettingsModal: React.FC<RecommendationSettingsModalProps> = ({ isOpen, onClose }) => {
    const { recommendationSettings, setRecommendationSettings } = useUserStore();
    const [localSettings, setLocalSettings] = useState<RecommendationSettings>({
        ...recommendationSettings
    });
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings({
                ...recommendationSettings
            });
        }
    }, [isOpen, recommendationSettings]);

    const handleSave = () => {
        setRecommendationSettings(localSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-base-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-sm bg-white border-none shadow-2xl relative z-10 overflow-hidden rounded-[2rem] flex flex-col"
            >
                <div className="p-6 border-b border-base-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-misty/10 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-misty-dark" />
                        </div>
                        <h3 className="text-lg font-black font-sans uppercase tracking-tight">추천 필터 설정</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-base-50 rounded-xl transition-colors text-base-400 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
                    {/* Recommendation Difficulty */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-base-400 font-sans">추천 문제 난이도</label>
                            <button
                                onClick={() => setShowGuide(true)}
                                className="text-[10px] font-bold text-misty-dark hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <HelpCircle className="w-3 h-3" />
                                가이드
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 p-1 bg-base-50 rounded-2xl">
                            {(['EASY', 'NORMAL', 'HARD'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setLocalSettings({ ...localSettings, difficulty: level })}
                                    className={clsx(
                                        "py-2.5 rounded-xl text-[11px] font-black transition-all",
                                        localSettings.difficulty === level
                                            ? "bg-white text-base-900 shadow-sm"
                                            : "text-base-400 hover:text-base-600"
                                    )}
                                >
                                    {level === 'EASY' ? '쉬움' : level === 'NORMAL' ? '보통' : '어려움'}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-base-400 font-medium px-1 leading-relaxed">
                            {localSettings.difficulty === 'EASY' && "🐢 내 티어보다 낮은 문제를 추천받아 기초를 다집니다."}
                            {localSettings.difficulty === 'NORMAL' && "⚖️ 현재 내 티어에 가장 적합한 문제를 추천받습니다."}
                            {localSettings.difficulty === 'HARD' && "🔥 내 티어보다 높고 도전적인 문제를 추천받습니다."}
                        </p>
                    </div>

                    {/* Focus Algorithms */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-base-400 font-sans">집중 학습 알고리즘</label>
                            <span className="text-[10px] font-bold text-base-300 uppercase tracking-tight">
                                {localSettings.focusAlgorithms.length}/3 선택
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'dp', name: 'DP' },
                                { id: 'graphs', name: '그래프' },
                                { id: 'greedy', name: '그리디' },
                                { id: 'bfs', name: 'BFS/DFS' },
                                { id: 'string', name: '문자열' },
                                { id: 'data_structures', name: '자료구조' },
                                { id: 'backtracking', name: '백트래킹' },
                                { id: 'math', name: '수학' },
                            ].map((tag) => {
                                const isSelected = localSettings.focusAlgorithms.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        onClick={() => {
                                            const current = localSettings.focusAlgorithms;
                                            if (isSelected) {
                                                setLocalSettings({ ...localSettings, focusAlgorithms: current.filter(id => id !== tag.id) });
                                            } else if (current.length < 3) {
                                                setLocalSettings({ ...localSettings, focusAlgorithms: [...current, tag.id] });
                                            }
                                        }}
                                        className={clsx(
                                            "px-3 py-2 rounded-xl text-[11px] font-bold transition-all border-2 flex items-center gap-1.5",
                                            isSelected
                                                ? "bg-misty/10 border-misty text-misty-dark"
                                                : "bg-white border-base-100 text-base-400 hover:border-base-200"
                                        )}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-base-900 text-white rounded-2xl font-black shadow-lg hover:bg-base-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    >
                        <span>적용하기</span>
                        <Check className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            <DifficultyGuideModal
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
            />
        </div>
    );
};

export default RecommendationSettingsModal;
