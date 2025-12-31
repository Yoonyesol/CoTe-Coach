import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { calculateEarnedXp } from '../../lib/xp';
import { useModalStore } from '../../store/useModalStore';

import { AddProblemModalProps } from '../../types/modal';

const AddProblemModal: React.FC<AddProblemModalProps> = ({ isOpen, onClose }) => {
    const { addXp, level } = useUserStore();
    const { showAlert } = useModalStore();
    const [platform, setPlatform] = useState<'PROG' | 'LC' | 'SWEA'>('PROG');
    const [difficulty, setDifficulty] = useState('');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');

    // Prevent background scrolling when modal is open
    useEffect(() => {
        const mainElement = document.querySelector('main');
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (mainElement) mainElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            if (mainElement) mainElement.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
            if (mainElement) mainElement.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!title || !difficulty) return;

        const earnedXp = calculateEarnedXp(platform, difficulty, level);
        addXp(earnedXp);

        showAlert(
            "등록 완료",
            `${title} (${platform}) 등록 완료! ${earnedXp}XP가 지급되었습니다.`
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="glass-card w-full max-w-md bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200 relative z-10">
                <div className="flex justify-between items-center p-6 border-b border-base-100">
                    <h2 className="text-xl font-black text-base-900 font-sans">외부 문제 기록하기</h2>
                    <button onClick={onClose} className="p-1 hover:bg-base-100 rounded-lg transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-base-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Platform Select */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">플랫폼 선택</label>
                        <div className="flex gap-2">
                            {(['PROG', 'LC', 'SWEA'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPlatform(p)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all cursor-pointer ${platform === p
                                        ? 'bg-misty-dark text-white ring-4 ring-misty-light'
                                        : 'bg-base-50 text-base-400 hover:bg-base-100'
                                        }`}
                                >
                                    {p === 'PROG' ? 'Prog' : p === 'LC' ? 'LC' : 'SWEA'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title & URL */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">문제 제목</label>
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
                            <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">문제 URL (선택)</label>
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
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans">난이도</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="">난이도를 선택하세요</option>
                            {platform === 'PROG' && [1, 2, 3, 4, 5].map(v => <option key={v} value={v}>Level {v}</option>)}
                            {platform === 'LC' && ['Easy', 'Medium', 'Hard'].map(v => <option key={v} value={v}>{v}</option>)}
                            {platform === 'SWEA' && [1, 2, 3, 4, 5, 6].map(v => <option key={v} value={`D${v}`}>D{v}</option>)}
                        </select>
                    </div>

                    <div className="bg-sage-light/50 p-4 rounded-2xl border border-sage/30 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-sage-dark shrink-0" />
                        <p className="text-xs text-sage-dark font-medium leading-relaxed font-sans">
                            외부 사이트 문제는 수동으로 난이도를 입력하여 기록합니다. <br />
                            기록 즉시 티어 점수(XP)가 반영됩니다!
                        </p>
                    </div>
                </div>

                <div className="p-6 pt-0">
                    <button
                        onClick={handleAdd}
                        disabled={!title || !difficulty}
                        className="w-full py-4 bg-base-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-base-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg font-sans cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        기록 및 평점 받기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProblemModal;
