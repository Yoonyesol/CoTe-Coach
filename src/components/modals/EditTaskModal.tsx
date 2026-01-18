import React, { useState, useEffect } from 'react';
import { X, Search, Link as LinkIcon, AlertCircle, Save } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { DailyTask } from '../../types/study';
import { CommonModalProps } from '../../types/modal';

interface EditTaskModalProps extends CommonModalProps {
    task: DailyTask;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
    const { updateDailyTask } = useUserStore();
    const { showAlert } = useModalStore();

    const [platform, setPlatform] = useState(task.site);
    const [difficulty, setDifficulty] = useState(task.difficulty);
    const [title, setTitle] = useState(task.problemTitle);
    const [url, setUrl] = useState(task.url || '');
    const [tagsInput, setTagsInput] = useState(task.tags?.join(', ') || '');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLockBodyScroll(isOpen);

    // Sync with task when it changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setPlatform(task.site);
            setDifficulty(task.difficulty);
            setTitle(task.problemTitle);
            setUrl(task.url || '');
            setTagsInput(task.tags?.join(', ') || '');
        }
    }, [isOpen, task]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title) return;

        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        await updateDailyTask(task.id, {
            problemTitle: title,
            site: platform,
            difficulty: difficulty || '미정',
            url: url || undefined,
            tags: tags.length > 0 ? tags : undefined
        });

        showAlert(
            "정보 수정 완료",
            "문제 정보가 성공적으로 업데이트되었습니다."
        );
        onClose();
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
                        className="absolute inset-0 bg-base-900/60 backdrop-blur-sm cursor-pointer"
                        onClick={onClose}
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass-card w-full max-w-md bg-white border-none shadow-2xl relative z-10 overflow-hidden sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl flex flex-col max-h-[90vh] sm:max-h-auto"
                    >
                        <div className="flex justify-between items-center p-5 border-b border-base-100 shrink-0 bg-white sticky top-0 z-20">
                            <h2 className="text-lg font-black text-base-900 font-sans">문제 정보 수정</h2>
                            <button onClick={onClose} className="p-2 -mr-2 hover:bg-base-100 rounded-lg transition-colors cursor-pointer">
                                <X className="w-5 h-5 text-base-400" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                            {/* Platform Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">플랫폼</label>
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
                                    <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">문제 링크 (URL)</label>
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

                            {/* Difficulty */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">
                                    난이도
                                </label>
                                <input
                                    type="text"
                                    placeholder="난이도 입력"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold caret-coral"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="p-4 rounded-2xl border bg-misty-light/30 border-misty/30 flex gap-3">
                                <AlertCircle className="text-misty-dark w-5 h-5 shrink-0" />
                                <p className="text-misty-dark text-xs font-medium leading-relaxed font-sans">
                                    수정된 정보는 저장 즉시 반영됩니다. 플랫폼과 제목을 변경하면 타이머 기록에도 영향을 줄 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 border-t border-base-100 bg-white shrink-0">
                            <button
                                onClick={handleSave}
                                disabled={!title}
                                className="w-full py-4 bg-misty-dark text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-misty transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg font-sans cursor-pointer"
                            >
                                <Save className="w-5 h-5" />
                                저장하기
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditTaskModal;
