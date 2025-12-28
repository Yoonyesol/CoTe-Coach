import React, { useState } from 'react';
import { X, Target, Calendar, BarChart3, Save } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

interface StudySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StudySettingsModal: React.FC<StudySettingsModalProps> = ({ isOpen, onClose }) => {
    const { studyPlan, setStudyPlan } = useUserStore();
    const [localPlan, setLocalPlan] = useState(studyPlan);

    if (!isOpen) return null;

    const handleSave = () => {
        setStudyPlan(localPlan);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="bg-misty-dark p-8 pb-12 relative">
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-xl transition-colors text-white">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 text-white mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black font-sans uppercase tracking-tight">학습 플랜 설정</h2>
                    </div>
                    <p className="text-white/80 font-medium font-sans">목표 등급과 학습 강도를 조절하세요.</p>
                </div>

                <div className="px-8 py-6 -mt-6 bg-white rounded-t-3xl relative z-10 space-y-6">
                    {/* Target Tier */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-base-400">
                            <BarChart3 className="w-4 h-4" />
                            <label className="text-xs font-black uppercase tracking-widest font-sans">목표 티어 (Solved.ac 기준)</label>
                        </div>
                        <select
                            value={localPlan.targetTier}
                            onChange={(e) => setLocalPlan({ ...localPlan, targetTier: e.target.value })}
                            className="w-full px-4 py-3 bg-base-50 border-none rounded-2xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold font-sans appearance-none"
                        >
                            {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map(t => (
                                [5, 4, 3, 2, 1].map(v => (
                                    <option key={`${t} ${v}`} value={`${t} ${v}`}>{t} {v}</option>
                                ))
                            ))}
                        </select>
                    </div>

                    {/* Daily Problem Count */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-base-400">
                            <Save className="w-4 h-4" />
                            <label className="text-xs font-black uppercase tracking-widest font-sans">일일 목표 문제 수</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={localPlan.problemCount}
                                onChange={(e) => setLocalPlan({ ...localPlan, problemCount: parseInt(e.target.value) })}
                                className="flex-1 accent-misty-dark"
                            />
                            <span className="text-2xl font-black text-base-800 w-12 text-center font-sans tracking-tight">
                                {localPlan.problemCount}
                            </span>
                        </div>
                        <p className="text-xs text-base-400 font-medium font-sans leading-relaxed">
                            {localPlan.problemCount <= 2 && "가벼운 워밍업 모드입니다. 부담 없이 시작해봐요!"}
                            {localPlan.problemCount > 2 && localPlan.problemCount <= 5 && "가장 추천하는 학습 강도입니다. 꾸준함이 생명!"}
                            {localPlan.problemCount > 5 && "상당히 도전적인 계획입니다. 빡세게 달려볼까요? 🔥"}
                        </p>
                    </div>

                    {/* Target Date */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-base-400">
                            <Calendar className="w-4 h-4" />
                            <label className="text-xs font-black uppercase tracking-widest font-sans">달성 목표일</label>
                        </div>
                        <input
                            type="date"
                            value={localPlan.targetDate.split('T')[0]}
                            onChange={(e) => setLocalPlan({ ...localPlan, targetDate: new Date(e.target.value).toISOString() })}
                            className="w-full px-4 py-3 bg-base-50 border-none rounded-2xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold font-sans"
                        />
                    </div>
                </div>

                <div className="p-8 bg-base-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-white border border-base-200 text-base-600 rounded-2xl font-black hover:bg-base-100 transition-all font-sans"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-4 bg-base-900 text-white rounded-2xl font-black hover:bg-base-800 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 font-sans"
                    >
                        플랜 저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudySettingsModal;
