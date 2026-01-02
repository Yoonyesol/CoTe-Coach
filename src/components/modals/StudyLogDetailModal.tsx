import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Trash2, Clock,
    BookOpen, Zap, MessageSquare,
    Calendar, History, TrendingUp, Edit3, BarChart3, Archive
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { clsx } from 'clsx';
import { StudyLog } from '../../types/study';
import { StudyLogDetailModalProps } from '../../types/modal';
import LogForm from '../common/LogForm';

import { useModalStore } from '../../store/useModalStore';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

const StudyLogDetailModal: React.FC<StudyLogDetailModalProps> = ({ log: initialLog, isOpen, onClose }) => {
    const { updateStudyLog, deleteStudyLog, studyLogs } = useUserStore();
    const { showConfirm, showAlert } = useModalStore();

    // CURRENT VIEW STATE
    const [currentLog, setCurrentLog] = useState<StudyLog>(initialLog);
    const [isEditing, setIsEditing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLockBodyScroll(isOpen);


    // HISTORY LOGS (All logs for the same problem)
    const historyLogs = useMemo(() => {
        return studyLogs
            .filter(l => l.problemId === currentLog.problemId)
            .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()); // Chronological for chart
    }, [studyLogs, currentLog.problemId]);

    const displayLogs = useMemo(() => [...historyLogs].sort((a, b) => b.stage - a.stage), [historyLogs]);

    // Aggregate Stats
    const stats = useMemo(() => {
        if (historyLogs.length === 0) return null;
        const totalTime = historyLogs.reduce((acc, curr) => acc + curr.elapsedTime, 0);
        const avgTime = totalTime / historyLogs.length;
        const firstTime = historyLogs[0].elapsedTime;
        const bestTime = Math.min(...historyLogs.map(l => l.elapsedTime));
        const improvement = firstTime > 0 ? ((firstTime - historyLogs[historyLogs.length - 1].elapsedTime) / firstTime) * 100 : 0;

        return { avgTime, firstTime, bestTime, improvement };
    }, [historyLogs]);

    // Trend Chart Component
    const TrendChart = () => {
        if (historyLogs.length < 2) return null;

        const padding = 20;
        const width = 400; // Adjusted for responsive Container
        const height = 120;
        const maxVal = Math.max(...historyLogs.map(l => l.elapsedTime));
        const minVal = Math.min(...historyLogs.map(l => l.elapsedTime));
        const range = maxVal - minVal || 1;

        const points = historyLogs.map((l, i) => {
            const x = (i / (historyLogs.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((l.elapsedTime - minVal) / range * (height - padding * 2) + padding);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="relative h-28 w-full bg-base-50/50 rounded-2xl border border-base-100/50 p-3 overflow-hidden group">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8DA290" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#8DA290" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={`M ${points.split(' ')[0]} L ${points} V ${height} H ${points.split(' ')[0]} Z`}
                        fill="url(#chartGradient)"
                    />
                    <polyline
                        fill="none"
                        stroke="#8DA290"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={points}
                        className="transition-all"
                    />
                    {historyLogs.map((l, i) => {
                        const x = (i / (historyLogs.length - 1)) * (width - padding * 2) + padding;
                        const y = height - ((l.elapsedTime - minVal) / range * (height - padding * 2) + padding);
                        return (
                            <circle
                                key={i}
                                cx={x} cy={y} r="3"
                                className="fill-white stroke-sage-dark stroke-2 transition-transform group-hover:scale-125"
                            />
                        );
                    })}
                </svg>
                <div className="absolute top-2 left-3 flex gap-1">
                    <span className="text-[9px] font-black text-base-300 uppercase tracking-widest">Growth Trend (Time)</span>
                </div>
            </div>
        );
    };

    // Sync form state when current log changes
    useEffect(() => {
        setIsEditing(false); // Reset to view mode when switching logs
    }, [currentLog]);

    const handleFormSubmit = async (data: any) => {
        await updateStudyLog(currentLog.id, {
            reflection: data.reflection,
            approach: data.approach,
            perceivedDifficulty: data.perceivedDifficulty,
            result: data.result,
            solvingMethod: data.solvingMethod,
            elapsedTime: data.elapsedTime,
            concepts: data.concepts,
            isFinished: data.isFinished,
            language: data.language
        });

        const updatedLog = {
            ...currentLog,
            reflection: data.reflection,
            approach: data.approach,
            perceivedDifficulty: data.perceivedDifficulty,
            result: data.result,
            solvingMethod: data.solvingMethod,
            elapsedTime: data.elapsedTime,
            concepts: data.concepts,
            isFinished: data.isFinished,
            language: data.language
        };
        setCurrentLog(updatedLog);
        setIsEditing(false);
    };

    const handleDelete = () => {
        showConfirm(
            '기록 삭제',
            '정말 이 기록을 삭제하시겠습니까? 삭제 시 복습 진행도가 이전 상태로 되돌아갈 수 있습니다.',
            async () => {
                await deleteStudyLog(currentLog.id);
                showAlert('삭제 완료', '학습 기록이 삭제되었습니다.');

                if (historyLogs.length > 1) {
                    const remainingHistory = historyLogs.filter(l => l.id !== currentLog.id);
                    const nextLog = remainingHistory[remainingHistory.length - 1]; // Use last remaining
                    setCurrentLog(nextLog);
                } else {
                    onClose();
                }
            }
        );
    };

    const modalVariants = getModalVariants(isMobile);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-base-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full md:max-w-4xl bg-white sm:rounded-[2rem] rounded-t-3xl rounded-b-none shadow-2xl overflow-hidden border-none sm:border sm:border-base-100 flex flex-col md:flex-row h-[98vh] md:h-auto md:max-h-[85vh]"
                    >
                        {/* LEFT PANEL: Detailed Content */}
                        <div className="flex-1 flex flex-col bg-white overflow-hidden">
                            {/* Header */}
                            <div className="p-8 pb-4 border-b border-base-50 flex justify-between items-start bg-gradient-to-r from-misty-light/10 to-white">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                                            currentLog.result === 'SUCCESS' ? "bg-sage-light text-sage-dark" : "bg-coral/10 text-coral"
                                        )}>
                                            {currentLog.result === 'SUCCESS' ? 'SUCCESS' : 'FAIL'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-base-100 text-base-500 rounded text-[10px] font-black uppercase tracking-widest">
                                            {currentLog.platform} • {currentLog.difficulty}
                                        </span>
                                        <span className="px-2 py-0.5 bg-lavender-light text-lavender-dark rounded text-[10px] font-black uppercase tracking-widest">
                                            STAGE {currentLog.stage === 0 ? 'Initial' : currentLog.stage}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-base-900 font-sans tracking-tight leading-tight">
                                        {currentLog.problemTitle}
                                    </h3>
                                    <p className="text-[11px] font-bold text-base-400 font-sans flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(currentLog.completedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 완료
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-base-100 rounded-xl transition-all md:hidden">
                                    <X className="w-6 h-6 text-base-300" />
                                </button>
                            </div>

                            {/* Content Body */}
                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                {isEditing ? (
                                    /* EDIT MODE */
                                    <div className="animate-in fade-in duration-300">
                                        <LogForm
                                            initialValues={{
                                                result: currentLog.result,
                                                solvingMethod: currentLog.solvingMethod,
                                                perceivedDifficulty: currentLog.perceivedDifficulty,
                                                elapsedMinutes: Math.floor(currentLog.elapsedTime / 60000),
                                                elapsedSeconds: Math.floor((currentLog.elapsedTime / 1000) % 60),
                                                approach: currentLog.approach,
                                                reflection: currentLog.reflection,
                                                concepts: currentLog.concepts,
                                                isFinished: currentLog.isFinished,
                                                language: currentLog.language
                                            }}
                                            onSubmit={handleFormSubmit}
                                            onCancel={() => setIsEditing(false)}
                                            submitLabel="기록 업데이트"
                                        />
                                    </div>
                                ) : (
                                    /* VIEW MODE */
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                            <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Time
                                                </p>
                                                <p className="text-sm font-black text-base-800">{Math.round(currentLog.elapsedTime / 60000)}m</p>
                                            </div>
                                            <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> Difficulty
                                                </p>
                                                <p className={clsx(
                                                    "text-sm font-black",
                                                    currentLog.perceivedDifficulty === 'HARD' ? "text-coral" :
                                                        currentLog.perceivedDifficulty === 'EASY' ? "text-sage-dark" : "text-misty-dark"
                                                )}>
                                                    {currentLog.perceivedDifficulty}
                                                </p>
                                            </div>
                                            <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" /> Method
                                                </p>
                                                <p className="text-sm font-black text-base-800">
                                                    {currentLog.solvingMethod === 'SELF' ? 'Self' : 'Ref'}
                                                </p>
                                            </div>
                                            <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <Archive className="w-3 h-3" /> Language
                                                </p>
                                                <p className="text-sm font-black text-base-800">
                                                    {currentLog.language || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <Zap className="w-3 h-3 text-coral" /> Improve
                                                </p>
                                                <p className={clsx(
                                                    "text-sm font-black",
                                                    (stats?.improvement || 0) > 0 ? "text-coral" : "text-base-400"
                                                )}>
                                                    {stats?.improvement && stats.improvement > 0 ? `-${Math.round(stats.improvement)}%` : '0%'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Growth Analysis Section */}
                                        {historyLogs.length >= 2 && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <TrendChart />
                                                <div className="bg-wheat/10 rounded-2xl border border-wheat/20 p-4 flex flex-col justify-center">
                                                    <h5 className="text-[10px] font-black text-wheat-dark uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <BarChart3 className="w-3 h-3" /> Growth Insights
                                                    </h5>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="font-bold text-base-400">최초 대비 단축</span>
                                                            <span className="font-black text-coral">-{Math.round(((stats?.firstTime || 0) - (stats?.bestTime || 0)) / 60000)}분</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="font-bold text-base-400">평균 풀이 시간</span>
                                                            <span className="font-black text-base-700">{Math.round((stats?.avgTime || 0) / 60000)}분</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Detailed Sections */}
                                        <div className="space-y-6">
                                            <section className="space-y-2">
                                                <h4 className="text-[10px] font-black text-base-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Zap className="w-3.5 h-3.5 text-wheat-dark" /> Solution Approach
                                                </h4>
                                                <div className="p-5 bg-wheat/5 border-l-4 border-wheat rounded-r-2xl">
                                                    <p className="text-xs font-bold text-base-800 leading-relaxed whitespace-pre-wrap">
                                                        {currentLog.approach || '작성된 접근법이 없습니다.'}
                                                    </p>
                                                </div>
                                            </section>

                                            <section className="space-y-2">
                                                <h4 className="text-[10px] font-black text-base-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <MessageSquare className="w-3.5 h-3.5 text-misty-dark" /> Reflection
                                                </h4>
                                                <div className="p-5 bg-misty-light/10 border-l-4 border-misty rounded-r-2xl">
                                                    <p className="text-xs font-bold text-base-700 leading-relaxed whitespace-pre-wrap italic">
                                                        "{currentLog.reflection || '작성된 소감이 없습니다.'}"
                                                    </p>
                                                </div>
                                            </section>

                                            {currentLog.concepts.length > 0 && (
                                                <section className="space-y-3">
                                                    <h4 className="text-[10px] font-black text-base-400 uppercase tracking-[0.2em]">Concepts Learned</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentLog.concepts.map(c => (
                                                            <span key={c} className="px-3 py-1 bg-base-900 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
                                                                #{c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions Footer (Only visible in View Mode, LogForm has its own buttons) */}
                            {!isEditing && (
                                <div className="p-6 bg-base-50/50 flex gap-3 border-t border-base-100">
                                    <button onClick={handleDelete} className="cursor-pointer p-4 text-coral hover:bg-coral/10 rounded-2xl transition-all group" title="Delete record">
                                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="cursor-pointer flex-1 bg-misty-dark text-white py-4 rounded-2xl font-black text-sm hover:bg-misty-dark/90 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95">
                                        <Edit3 className="w-4 h-4" /> 이 기록 수정하기
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT PANEL: History Timeline */}
                        <div className="w-full md:w-72 bg-base-50 border-l border-base-100 flex flex-col h-[30vh] md:h-auto overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-base-100 flex justify-between items-center">
                                <h4 className="text-[11px] font-black text-base-400 uppercase tracking-widest flex items-center gap-2">
                                    <History className="w-4 h-4" /> Challenge History
                                </h4>
                                <button onClick={onClose} className="cursor-pointer p-2 hover:bg-base-100 rounded-xl transition-all hidden md:block">
                                    <X className="w-5 h-5 text-base-300" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-3 md:space-y-4">
                                {displayLogs.map((h, i) => (
                                    <button
                                        key={h.id}
                                        onClick={() => setCurrentLog(h)}
                                        className={clsx(
                                            "cursor-pointer w-full p-3 md:p-4 rounded-2xl text-left transition-all border-2 relative group",
                                            h.id === currentLog.id
                                                ? "bg-white border-misty-dark shadow-md"
                                                : "bg-transparent border-transparent hover:bg-white/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={clsx(
                                                "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                                                h.stage === 0 ? "bg-base-200 text-base-500" : "bg-lavender-light text-lavender-dark"
                                            )}>
                                                {h.stage === 0 ? 'Initial' : `${h.stage}차 복습`}
                                            </span>
                                            <span className="text-[9px] font-bold text-base-300">
                                                {new Date(h.completedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className={clsx(
                                            "text-[10px] font-black",
                                            h.id === currentLog.id ? "text-base-900" : "text-base-400"
                                        )}>
                                            {h.result === 'SUCCESS' ? '✅ 성공' : '❌ 실패'} {h.language ? `(${h.language})` : ''}
                                        </p>

                                        {/* Timeline line */}
                                        {i < displayLogs.length - 1 && (
                                            <div className="absolute left-[2.5rem] bottom-[-1rem] w-[2px] h-4 bg-base-200 z-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 md:p-6 bg-white/50 border-t border-base-100">
                                <p className="text-[10px] font-bold text-base-300 leading-tight">
                                    전체 해결 {historyLogs.length}회 • 평균 시간 {Math.round((stats?.avgTime || 0) / 60000)}분
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StudyLogDetailModal;
