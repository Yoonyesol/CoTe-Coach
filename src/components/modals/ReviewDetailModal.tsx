import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, CheckCircle2, Calendar, Zap, AlertCircle, ChevronLeft, ChevronRight, BarChart3, MessageSquare, BookOpen, History } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { clsx } from 'clsx';
import { ReviewDetailModalProps } from '../../types/modal';
import { motion, AnimatePresence } from 'framer-motion';

import { backdropVariants, getModalVariants } from '../../lib/animations';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ isOpen, onClose, plan, onStartReview, onQuickLog, onViewFullDetail }) => {
    const { timer, studyLogs } = useUserStore();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLockBodyScroll(isOpen);

    // NEW: Log Navigation Logic
    const historyLogs = useMemo(() => {
        if (!plan) return [];
        return studyLogs
            .filter(l => l.problemTitle === plan.problemTitle)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }, [studyLogs, plan?.problemTitle]);

    const [currentLogIndex, setCurrentLogIndex] = useState(0);
    const displayedLog = historyLogs[currentLogIndex];

    if (!isOpen || !plan) return null;

    const isCurrentTiming = timer.currentProblemId === plan.problemTitle && timer.isRunning;

    // Stage Label Logic
    const stageLabel = plan.currentStage === 0
        ? "기본 풀이 완료"
        : `${plan.currentStage}차 복습 완료`;

    const modalVariants = getModalVariants(isMobile);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none text-left">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 bg-base-900/60 backdrop-blur-sm pointer-events-auto"
                        onClick={onClose}
                    />
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass-card bg-white w-full md:max-w-lg overflow-hidden shadow-2xl relative flex flex-col h-screen md:h-auto md:max-h-[85vh] sm:rounded-3xl rounded-none pointer-events-auto"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-lavender" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2.5 bg-base-100/80 hover:bg-base-100 rounded-full transition-all z-20 flex items-center justify-center shadow-sm"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-base-600" />
                        </button>

                        <div className="p-8 pb-4 overflow-y-auto custom-scrollbar">
                            {/* Problem Identity */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-lavender-light rounded-2xl flex items-center justify-center shadow-sm text-3xl flex-shrink-0">
                                    {plan.currentStage === 0 ? '🌱' : plan.currentStage >= 4 ? '🌳' : '🌿'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-lavender text-white rounded-md uppercase tracking-wider">
                                            {plan.currentStage + 1}회차 복습
                                        </span>
                                        <span className="text-[10px] font-bold text-base-400 capitalize">{plan.platform} • {plan.difficulty}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-base-900 leading-tight truncate pr-4">
                                        {plan.problemTitle}
                                    </h2>
                                </div>
                            </div>

                            {/* Stats/History Card */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-base-50 p-4 rounded-2xl border border-base-100 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 text-base-400 mb-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">상태</span>
                                    </div>
                                    <p className="text-sm font-black text-lavender-dark">{stageLabel}</p>
                                </div>
                                <div className="bg-base-50 p-4 rounded-2xl border border-base-100 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 text-base-400 mb-1">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">기록 통계</span>
                                    </div>
                                    <button
                                        onClick={() => displayedLog && onViewFullDetail(displayedLog)}
                                        className="text-xs font-black text-base-800 hover:text-lavender-dark transition-colors flex items-center gap-1"
                                    >
                                        상세보기 <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* NEW: Log History Viewer */}
                            <div className="mb-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-base-400 uppercase tracking-widest flex items-center gap-2">
                                        <History className="w-4 h-4" /> 과거 풀이 로그 ({historyLogs.length})
                                    </h4>
                                    {historyLogs.length > 1 && (
                                        <div className="flex gap-1">
                                            <button
                                                disabled={currentLogIndex === historyLogs.length - 1}
                                                onClick={() => setCurrentLogIndex(prev => prev + 1)}
                                                className="p-1 rounded-md hover:bg-base-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                disabled={currentLogIndex === 0}
                                                onClick={() => setCurrentLogIndex(prev => prev - 1)}
                                                className="p-1 rounded-md hover:bg-base-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={displayedLog?.id || 'empty'}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="bg-wheat/5 border border-wheat/20 rounded-2xl p-5 min-h-[160px] flex flex-col"
                                    >
                                        {displayedLog ? (
                                            <>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-black text-wheat-dark px-2 py-0.5 bg-wheat/20 rounded">
                                                        {displayedLog.stage === 0 ? '기본 풀이' : `${displayedLog.stage}차 복습`}
                                                        {displayedLog.language && ` (${displayedLog.language})`}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-base-400">
                                                        {new Date(displayedLog.completedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[120px] custom-scrollbar pr-2">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-base-300 uppercase italic">
                                                            <BookOpen className="w-3 h-3" /> Approach
                                                        </div>
                                                        <p className="text-xs font-bold text-base-700 leading-relaxed">
                                                            {displayedLog.approach || '작성된 접근법이 없습니다.'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-base-300 uppercase italic">
                                                            <MessageSquare className="w-3 h-3" /> Reflection
                                                        </div>
                                                        <p className="text-xs font-bold text-base-600 leading-relaxed italic">
                                                            "{displayedLog.reflection || '작성된 소감이 없습니다.'}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                                <AlertCircle className="w-8 h-8 mb-2" />
                                                <p className="text-xs font-bold">풀이 로그가 없습니다.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 pb-6">
                                <button
                                    onClick={() => onStartReview(plan)}
                                    className={clsx(
                                        "group relative w-full py-3 rounded-xl font-black text-[13px] transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 overflow-hidden",
                                        isCurrentTiming
                                            ? "bg-coral text-white border-b-2 border-coral-dark"
                                            : "bg-base-900 text-white hover:bg-black border-b-2 border-black"
                                    )}
                                >
                                    {isCurrentTiming ? (
                                        <>
                                            <Zap className="w-4 h-4 animate-pulse" />
                                            <span>풀이 진행 중 (타이머 정지)</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                            <span>이 문제 지금 복습하기</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => onQuickLog(plan)}
                                    className="w-full py-3 bg-white border border-base-200 text-base-600 rounded-xl font-black text-[13px] hover:bg-base-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                                    이미 풀었습니다 (로그 작성)
                                </button>
                            </div>
                        </div>

                        {/* Footer Quote */}
                        <div className="p-4 bg-base-50 text-center border-t border-base-100 mt-auto">
                            <p className="text-[10px] font-bold text-base-300 italic">"복습은 기억의 정원사를 고용하는 것과 같습니다."</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default ReviewDetailModal;

