import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Link as LinkIcon, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { calculateEarnedXp } from '../../lib/xp';
import { getTodayString } from '../../lib/dateUtils';
import { useModalStore } from '../../store/useModalStore';
import { clsx } from 'clsx';

import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

import { AddProblemModalProps } from '../../types/modal';

type TabType = 'SOLVE_NOW' | 'ALREADY_SOLVED';

const AddProblemModal: React.FC<AddProblemModalProps> = ({ isOpen, onClose }) => {
    const { addDailyTask, addStudyLog, level } = useUserStore();
    const { showAlert } = useModalStore();
    const [activeTab, setActiveTab] = useState<TabType>('SOLVE_NOW');
    const [platform, setPlatform] = useState<'BOJ' | 'PROG' | 'LC' | 'SWEA'>('PROG');
    const [difficulty, setDifficulty] = useState('');
    const [bojTier, setBojTier] = useState('');
    const [bojLevel, setBojLevel] = useState('');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLockBodyScroll(isOpen);

    // Combine BOJ tier + level into difficulty
    useEffect(() => {
        if (platform === 'BOJ' && bojTier && bojLevel) {
            setDifficulty(`${bojTier} ${bojLevel}`);
        }
    }, [platform, bojTier, bojLevel]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setUrl('');
            setTagsInput('');
            setDifficulty('');
            setBojTier('');
            setBojLevel('');
            setActiveTab('SOLVE_NOW');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSolveNow = async () => {
        if (!title) return;

        const today = getTodayString();
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        await addDailyTask({
            problemId: `custom-${Date.now()}`,
            problemTitle: title,
            site: platform,
            difficulty: difficulty || '미정',
            targetDate: today,
            url: url || undefined,
            tags: tags.length > 0 ? tags : undefined
        });

        showAlert(
            "문제 추가 완료",
            `${title}이(가) 오늘의 문제 목록에 추가되었습니다!`
        );
        onClose();
    };

    const handleAlreadySolved = async () => {
        if (!title || !difficulty) return;

        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        await addStudyLog({
            problemId: `custom-${Date.now()}`,
            problemTitle: title,
            platform: platform,
            difficulty: difficulty,
            perceivedDifficulty: 'NORMAL',
            elapsedTime: 0,
            reflection: '외부 문제 직접 기록',
            approach: '',
            concepts: tags,
            result: 'SUCCESS',
            solvingMethod: 'SELF'
        });

        const earnedXp = calculateEarnedXp(platform, difficulty, level);
        showAlert(
            "기록 완료",
            `${title} 기록 완료! ${earnedXp}XP가 지급되었습니다.`
        );
        onClose();
    };

    const modalVariants = getModalVariants(isMobile);

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none text-left">
                    {/* Click backdrop to close */}
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
                        className="glass-card w-full sm:w-full max-w-md bg-white border-none shadow-2xl relative z-10 overflow-hidden sm:rounded-2xl rounded-none flex flex-col h-screen sm:h-auto pointer-events-auto"
                    >
                        <div className="flex justify-between items-center p-5 border-b border-base-100 shrink-0 bg-white sticky top-0 z-20">
                            <h2 className="text-lg font-black text-base-900 font-sans">문제 추가</h2>
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-base-100/50 hover:bg-base-100 rounded-full transition-all flex items-center justify-center shadow-sm"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-base-500" />
                            </button>
                        </div>

                        {/* Tab Selector */}
                        <div className="flex border-b border-base-100 shrink-0 bg-base-50/50">
                            <button
                                onClick={() => setActiveTab('SOLVE_NOW')}
                                className={clsx(
                                    "flex-1 py-3 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2",
                                    activeTab === 'SOLVE_NOW'
                                        ? "text-misty-dark border-b-2 border-misty-dark bg-misty-light/20"
                                        : "text-base-400 hover:bg-base-50"
                                )}
                            >
                                <Play className="w-4 h-4" />
                                지금 풀기
                            </button>
                            <button
                                onClick={() => setActiveTab('ALREADY_SOLVED')}
                                className={clsx(
                                    "flex-1 py-3 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2",
                                    activeTab === 'ALREADY_SOLVED'
                                        ? "text-sage-dark border-b-2 border-sage bg-sage-light/20"
                                        : "text-base-400 hover:bg-base-50"
                                )}
                            >
                                <CheckCircle className="w-4 h-4" />
                                이미 해결함
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                            {/* Platform Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">플랫폼 선택</label>
                                <div className="flex gap-2">
                                    {(['BOJ', 'PROG', 'LC', 'SWEA'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPlatform(p)}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${platform === p
                                                ? 'bg-misty-dark text-white ring-2 ring-misty-light'
                                                : 'bg-base-50 text-base-400 hover:bg-base-100'
                                                }`}
                                        >
                                            {p === 'BOJ' ? '백준' : p === 'PROG' ? 'Prog' : p === 'LC' ? 'LC' : 'SWEA'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title & ID */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">문제 제목 *</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                        <input
                                            type="text"
                                            placeholder="예: 타겟 넘버"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold caret-coral"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">문제 링크 (선택)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold caret-coral"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">태그 (쉼표로 구분)</label>
                                    <input
                                        type="text"
                                        placeholder="예: DFS, 재귀, 완전탐색"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold caret-coral"
                                    />
                                </div>
                            </div>

                            {/* Difficulty - Required only for "Already Solved" */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">
                                    난이도 {activeTab === 'ALREADY_SOLVED' && '*'}
                                </label>
                                {platform === 'BOJ' ? (
                                    <div className="flex gap-2">
                                        <select
                                            value={bojTier}
                                            onChange={(e) => setBojTier(e.target.value)}
                                            className="flex-1 px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">티어</option>
                                            {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                        <select
                                            value={bojLevel}
                                            onChange={(e) => setBojLevel(e.target.value)}
                                            className="w-24 px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">레벨</option>
                                            {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">난이도를 선택하세요</option>
                                        {platform === 'PROG' && [1, 2, 3, 4, 5].map(v => <option key={v} value={`Level ${v}`}>Level {v}</option>)}
                                        {platform === 'LC' && ['Easy', 'Medium', 'Hard'].map(v => <option key={v} value={v}>{v}</option>)}
                                        {platform === 'SWEA' && [1, 2, 3, 4, 5, 6].map(v => <option key={v} value={`D${v}`}>D{v}</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className={clsx(
                                "p-4 rounded-2xl border flex gap-3",
                                activeTab === 'SOLVE_NOW'
                                    ? "bg-misty-light/30 border-misty/30"
                                    : "bg-sage-light/50 border-sage/30"
                            )}>
                                <AlertCircle className={clsx(
                                    "w-5 h-5 shrink-0",
                                    activeTab === 'SOLVE_NOW' ? "text-misty-dark" : "text-sage-dark"
                                )} />
                                <p className={clsx(
                                    "text-xs font-medium leading-relaxed font-sans",
                                    activeTab === 'SOLVE_NOW' ? "text-misty-dark" : "text-sage-dark"
                                )}>
                                    {activeTab === 'SOLVE_NOW'
                                        ? "오늘의 문제 목록에 추가됩니다. 카드에서 스톱워치를 시작하여 풀이를 시작하세요!"
                                        : "이미 해결한 문제를 직접 기록합니다. 기록 즉시 티어 점수(XP)가 반영됩니다!"
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="p-5 border-t border-base-100 bg-white shrink-0">
                            {activeTab === 'SOLVE_NOW' ? (
                                <button
                                    onClick={handleSolveNow}
                                    disabled={!title}
                                    className="w-full py-4 bg-misty-dark text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-misty transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg font-sans cursor-pointer"
                                >
                                    <Play className="w-5 h-5" />
                                    오늘의 문제에 추가
                                </button>
                            ) : (
                                <button
                                    onClick={handleAlreadySolved}
                                    disabled={!title || !difficulty}
                                    className="w-full py-4 bg-sage text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-sage-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg font-sans cursor-pointer"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    기록 및 평점 받기
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default AddProblemModal;
