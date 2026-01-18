import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Trash2, Clock,
    BookOpen, Zap, MessageSquare,
    Calendar, History, TrendingUp, Edit3, BarChart3, Save, Code2, Link, Edit2, ChevronLeft
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { clsx } from 'clsx';
import { StudyLog } from '../../types/study';
import { Platform } from '../../types/user';
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
        setCurrentLog(initialLog);
    }, [initialLog]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Back button support for mobile
    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ modal: 'study-log-detail' }, '');

            const handlePopState = () => {
                onClose();
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isOpen, onClose]);

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

    const [isEditingProblem, setIsEditingProblem] = useState(false);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftUrl, setDraftUrl] = useState('');
    const [draftPlatform, setDraftPlatform] = useState<Platform>('BOJ');
    const [draftBojTier, setDraftBojTier] = useState('');
    const [draftLevel, setDraftLevel] = useState('');

    useEffect(() => {
        setIsEditing(false);
        setIsEditingProblem(false);
        if (currentLog) {
            setDraftTitle(currentLog.problemTitle);
            setDraftUrl(currentLog.url || '');
            setDraftPlatform(currentLog.platform);

            if (currentLog.platform === 'BOJ') {
                const parts = currentLog.difficulty.split(' ');
                setDraftBojTier(parts[0] || 'Bronze');
                setDraftLevel(parts[1] || '1');
            } else {
                setDraftLevel(currentLog.difficulty.replace('Level ', '') || '1');
            }
        }
    }, [currentLog]);

    const handleProblemUpdate = async () => {
        if (!currentLog) return;

        const finalDifficulty = draftPlatform === 'BOJ'
            ? `${draftBojTier} ${draftLevel}`.trim()
            : `Level ${draftLevel}`;

        try {
            await updateStudyLog(currentLog.id, {
                problemTitle: draftTitle,
                difficulty: finalDifficulty,
                url: draftUrl,
                platform: draftPlatform
            });

            // Local state update for immediate feedback
            setCurrentLog({
                ...currentLog,
                problemTitle: draftTitle,
                difficulty: finalDifficulty,
                url: draftUrl,
                platform: draftPlatform
            });

            setIsEditingProblem(false);
        } catch (error) {
            console.error('Failed to update problem info:', error);
        }
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

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 pointer-events-none">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-base-900/60 backdrop-blur-sm pointer-events-auto"
                    />
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full md:max-w-4xl bg-white sm:rounded-[2rem] rounded-none shadow-2xl overflow-hidden border-none sm:border sm:border-base-100 flex flex-col md:flex-row h-[100dvh] sm:h-auto md:max-h-[85vh] mb-0 pointer-events-auto"
                    >
                        {/* LEFT PANEL: Detailed Content */}
                        <div className="flex-1 flex flex-col bg-white overflow-hidden">
                            {/* Header */}
                            <div className="bg-base-900 px-4 sm:p-6 text-white flex justify-between items-center shrink-0 h-[calc(64px+env(safe-area-inset-top,0px))] sm:h-auto pt-[env(safe-area-inset-top,12px)] sm:pt-6 border-b border-white/10">
                                <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                                    <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer sm:hidden flex items-center justify-center">
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <div className="hidden sm:flex p-2 bg-white/10 rounded-lg shrink-0">
                                        <BookOpen className="w-5 h-5 text-misty" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-sm sm:text-lg font-black font-sans leading-tight truncate">학습 기록 상세</h2>
                                        <p className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest font-sans truncate">
                                            {currentLog?.problemTitle || 'Loading...'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="hidden sm:block p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-6 sm:px-8 py-4 overflow-y-auto custom-scrollbar flex-1">

                                <div className="space-y-4 pr-8">
                                    {isEditingProblem ? (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {/* Platform Selector */}
                                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                                {(['BOJ', 'PROG', 'LC', 'SWEA'] as const).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setDraftPlatform(p)}
                                                        className={clsx(
                                                            "px-2.5 py-1 rounded text-[10px] font-black transition-all whitespace-nowrap",
                                                            draftPlatform === p
                                                                ? "bg-misty-dark text-white shadow-sm"
                                                                : "bg-base-100 text-base-400 hover:bg-base-200"
                                                        )}
                                                    >
                                                        {p === 'BOJ' ? '백준' : p === 'PROG' ? 'Prog' : p === 'LC' ? 'LC' : 'SWEA'}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Difficulty Selectors */}
                                                <div className="flex gap-1">
                                                    {draftPlatform === 'BOJ' && (
                                                        <select
                                                            value={draftBojTier}
                                                            onChange={(e) => setDraftBojTier(e.target.value)}
                                                            className="px-2 py-1 bg-base-100 border-2 border-transparent focus:border-misty rounded text-[10px] sm:text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                                                        >
                                                            {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'].map(v => (
                                                                <option key={v} value={v}>{v}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    <select
                                                        value={draftLevel}
                                                        onChange={(e) => setDraftLevel(e.target.value)}
                                                        className="px-2 py-1 bg-base-100 border-2 border-transparent focus:border-misty rounded text-[10px] sm:text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                                                    >
                                                        {draftPlatform === 'BOJ'
                                                            ? [1, 2, 3, 4, 5].map(v => <option key={v} value={v.toString()}>{v}</option>)
                                                            : [1, 2, 3, 4, 5].map(v => <option key={v} value={v.toString()}>Level {v}</option>)
                                                        }
                                                    </select>
                                                </div>

                                                <div className="relative flex-1 min-w-[150px]">
                                                    <Link className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-base-300" />
                                                    <input
                                                        type="text"
                                                        value={draftUrl}
                                                        onChange={(e) => setDraftUrl(e.target.value)}
                                                        placeholder="문제 URL"
                                                        className="w-full pl-7 pr-2 py-1 bg-base-100 border-2 border-transparent focus:border-misty rounded text-[10px] sm:text-[11px] font-black uppercase tracking-widest outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={draftTitle}
                                                onChange={(e) => setDraftTitle(e.target.value)}
                                                placeholder="문제 제목"
                                                className="w-full text-xl sm:text-2xl font-black text-base-900 font-sans tracking-tight leading-tight bg-transparent border-b-2 border-misty/30 focus:border-misty outline-none pb-1"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleProblemUpdate}
                                                    className="px-4 py-1.5 bg-base-900 text-white text-[11px] font-black rounded-lg hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <Save className="w-3.5 h-3.5" /> 저장
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingProblem(false)}
                                                    className="px-4 py-1.5 bg-base-100 text-base-500 text-[11px] font-black rounded-lg hover:bg-base-200 transition-all"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-widest",
                                                    currentLog.result === 'SUCCESS' ? "bg-sage-light text-sage-dark" : "bg-coral/10 text-coral"
                                                )}>
                                                    {currentLog.result === 'SUCCESS' ? 'SUCCESS' : 'FAIL'}
                                                </span>
                                                <span className="px-2 py-1 bg-base-100 text-base-500 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                                                    {currentLog.platform} • {currentLog.difficulty}
                                                </span>
                                                <span className="px-2 py-1 bg-lavender-light text-lavender-dark rounded text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                                                    STAGE {currentLog.stage === 0 ? 'Initial' : currentLog.stage}
                                                </span>
                                                {!isEditing && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsEditingProblem(true);
                                                        }}
                                                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1 bg-white border border-base-200 text-base-600 rounded-lg text-[10px] sm:text-[11px] font-black hover:bg-base-50 transition-all shadow-sm"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" /> 정보 수정
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-xl sm:text-2xl font-black text-base-900 font-sans tracking-tight leading-tight pr-4">
                                                    {currentLog.problemTitle}
                                                </h3>
                                                <p className="text-[11px] sm:text-xs font-bold text-base-400 font-sans flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(currentLog.completedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 완료
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                {isEditing ? (
                                    /* EDIT MODE: RECORD */
                                    <div className="animate-in fade-in duration-300">
                                        <LogForm
                                            mode="LOG"
                                            initialValues={{
                                                result: currentLog.result,
                                                solvingMethod: currentLog.solvingMethod,
                                                perceivedDifficulty: currentLog.perceivedDifficulty,
                                                elapsedHours: Math.floor(currentLog.elapsedTime / 3600000),
                                                elapsedMinutes: Math.floor((currentLog.elapsedTime / 60000) % 60),
                                                elapsedSeconds: Math.floor((currentLog.elapsedTime / 1000) % 60),
                                                approach: currentLog.approach,
                                                reflection: currentLog.reflection,
                                                concepts: currentLog.concepts,
                                                isFinished: currentLog.isFinished,
                                                language: currentLog.language
                                            }}
                                            onSubmit={async (data: any) => {
                                                try {
                                                    await updateStudyLog(currentLog.id, {
                                                        ...data
                                                    });
                                                    // Local state update for immediate feedback
                                                    setCurrentLog({
                                                        ...currentLog,
                                                        ...data
                                                    });
                                                    setIsEditing(false);
                                                } catch (error) {
                                                    console.error('Failed to update study log:', error);
                                                }
                                            }}
                                            onCancel={() => setIsEditing(false)}
                                            submitLabel="기록 업데이트"
                                        />
                                    </div>
                                ) : (
                                    /* VIEW MODE (Also visible when editing PROBLEM info) */
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                                            <div className="bg-base-50 p-3 sm:p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> Time
                                                </p>
                                                <p className="text-sm font-black text-base-800">
                                                    {currentLog.elapsedTime >= 3600000 && `${Math.floor(currentLog.elapsedTime / 3600000)}h `}
                                                    {Math.floor((currentLog.elapsedTime / 60000) % 60)}m
                                                </p>
                                            </div>
                                            <div className="bg-base-50 p-3 sm:p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
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
                                            <div className="bg-base-50 p-3 sm:p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <BookOpen className="w-3 h-3" /> Method
                                                </p>
                                                <p className="text-sm font-black text-base-800">
                                                    {currentLog.solvingMethod === 'SELF' ? 'Self' : 'Ref'}
                                                </p>
                                            </div>
                                            <div className="bg-base-50 p-3 sm:p-4 rounded-2xl border border-base-100/50">
                                                <p className="text-[10px] font-black text-base-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <Code2 className="w-3 h-3" /> Language
                                                </p>
                                                <p className="text-sm font-black text-base-800 truncate">
                                                    {currentLog.language || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-base-50 p-3 sm:p-4 rounded-2xl border border-base-100/50 col-span-2 sm:col-span-1">
                                                <p className="text-[10px] font-black text-base-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                    <Zap className="w-3 h-3 text-amber-500" /> Improve
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

                            {/* Actions Footer */}
                            {!isEditing && !isEditingProblem && (
                                <div className="p-4 sm:p-6 bg-base-50/50 flex items-center gap-3 border-t border-base-100 shrink-0">
                                    <button
                                        onClick={handleDelete}
                                        className="cursor-pointer p-3 text-coral hover:bg-coral/10 rounded-xl transition-all group flex items-center justify-center border border-base-200 hover:border-coral/20 bg-white"
                                        title="Delete record"
                                    >
                                        <Trash2 className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="cursor-pointer flex-1 bg-base-900 text-white py-3 rounded-xl font-black text-[13px] hover:bg-base-800 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 tracking-tight"
                                    >
                                        <Edit3 className="w-4 h-4" /> 기록 수정하기
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
                                    전체 해결 {historyLogs.length}회 • 평균 시간 {((stats?.avgTime || 0) >= 3600000) && `${Math.floor((stats?.avgTime || 0) / 3600000)}h `}{Math.round(((stats?.avgTime || 0) / 60000) % 60)}분
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default StudyLogDetailModal;
