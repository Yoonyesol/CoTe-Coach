import React from 'react';
import { X, Info, HelpCircle, Target, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { DifficultyGuideModalProps } from '../../types/modal';

const DifficultyGuideModal: React.FC<DifficultyGuideModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-base-900/40 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Header */}
                        <div className="bg-base-900 p-8 text-white relative">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <HelpCircle className="w-6 h-6 text-misty" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black font-sans tracking-tight">추천 난이도 가이드</h2>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-0.5">Difficulty Selection Guide</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">

                            {/* Intro */}
                            <p className="text-sm font-bold text-base-500 leading-relaxed font-sans">
                                CoTe-Coach는 사용자의 티어를 기반으로 문제를 선정하지만, <br />
                                <span className="text-base-900">학습 목표에 따라 난이도를 직접 조절</span>할 수 있습니다.
                            </p>

                            {/* Levels Grid */}
                            <div className="space-y-4">
                                {/* Easy */}
                                <div className="p-5 bg-base-50 rounded-3xl border border-base-100 flex gap-4 items-start">
                                    <div className="p-2 bg-sage-light rounded-xl mt-1">
                                        <Target className="w-4 h-4 text-sage-dark" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-base-900">🐢 쉬움 (기초 다지기)</h3>
                                        <p className="text-[11px] font-bold text-base-400 leading-normal">
                                            현재 티어보다 <span className="text-sage-dark">약 2단계 낮은</span> 수준의 문제를 추천합니다. <br />
                                            알고리즘 개념을 처음 익혔거나 컨디션 관리가 필요할 때 추천합니다.
                                        </p>
                                    </div>
                                </div>

                                {/* Normal */}
                                <div className="p-5 bg-base-50 rounded-3xl border border-base-100 flex gap-4 items-start">
                                    <div className="p-2 bg-misty-light rounded-xl mt-1">
                                        <TrendingUp className="w-4 h-4 text-misty-dark" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-base-900">⚖️ 보통 (지속적인 성장)</h3>
                                        <p className="text-[11px] font-bold text-base-400 leading-normal">
                                            현재 티어에 <span className="text-misty-dark">가장 적합한</span> 수준의 문제를 추천합니다. <br />
                                            시스템이 제안하는 최적의 경로를 따라 꾸준히 성장하고 싶을 때 적합합니다.
                                        </p>
                                    </div>
                                </div>

                                {/* Hard */}
                                <div className="p-5 bg-base-50 rounded-3xl border border-base-100 flex gap-4 items-start">
                                    <div className="p-2 bg-coral/10 rounded-xl mt-1">
                                        <Zap className="w-4 h-4 text-coral" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-base-900">🔥 어려움 (한계 돌파)</h3>
                                        <p className="text-[11px] font-bold text-base-400 leading-normal">
                                            현재 티어보다 <span className="text-coral">1~2단계 높은</span> 도전적인 문제를 포함합니다. <br />
                                            실제 코딩 테스트의 고난도 문제를 대비하며 빠른 실력 향상을 원할 때 추천합니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-misty-dark/5 p-6 rounded-3xl border border-dashed border-misty/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-4 h-4 text-misty-dark" />
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-misty-dark">학습 꿀팁</h4>
                                </div>
                                <ul className="space-y-2">
                                    <li className="text-[11px] font-bold text-base-500 flex gap-2">
                                        <span className="text-misty-dark">•</span>
                                        평일에는 보통/어려움으로 열공하고 주말에는 쉬움으로 가볍게 복습해 보세요.
                                    </li>
                                    <li className="text-[11px] font-bold text-base-500 flex gap-2">
                                        <span className="text-misty-dark">•</span>
                                        실패 로그가 계속 쌓인다면 난이도를 낮춰 자신감을 회복하는 것이 중요합니다!
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-base-50 flex justify-center">
                            <button
                                onClick={onClose}
                                className="px-12 py-3.5 bg-base-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-base-900/20 cursor-pointer"
                            >
                                가이드 닫기
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DifficultyGuideModal;
