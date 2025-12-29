import React, { useState, useEffect } from 'react';
import { X, Check, Search, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { fetchSolvedAcUser, SolvedAcUser } from '../api/solvedac';
import { useModalStore } from '../store/useModalStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
    const { bojHandle, setBojHandle } = useUserStore();
    const { showAlert } = useModalStore();
    const [handle, setHandle] = useState(bojHandle || '');
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<SolvedAcUser | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handleVerify = async () => {
        if (!handle.trim()) return;

        setIsLoading(true);
        setError(null);
        setVerifiedUser(null);

        try {
            const data = await fetchSolvedAcUser(handle.trim());
            setVerifiedUser(data);
        } catch (err: any) {
            setError('사용자를 찾을 수 없습니다. 핸들을 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (verifiedUser) {
            setBojHandle(verifiedUser.handle);
            showAlert("연동 완료", "백준 계정이 성공적으로 연동되었습니다!");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-md bg-white border-none shadow-2xl relative z-10 overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-base-100">
                    <h2 className="text-xl font-black text-base-900 font-sans">프로필 & 계정 연동</h2>
                    <button onClick={onClose} className="p-1 hover:bg-base-100 rounded-lg transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-base-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* BOJ Handle Input */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-base-400 uppercase tracking-widest font-sans flex items-center gap-2">
                                <LinkIcon size={12} /> Solved.ac (백준) 핸들
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                    <input
                                        type="text"
                                        placeholder="예: koosaga"
                                        value={handle}
                                        onChange={(e) => setHandle(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold caret-coral"
                                    />
                                </div>
                                <button
                                    onClick={handleVerify}
                                    disabled={isLoading || !handle.trim()}
                                    className="px-6 py-3 bg-misty-dark text-white rounded-xl font-black text-sm hover:bg-misty transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검증'}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-600 font-bold leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Verified User Info */}
                        <AnimatePresence>
                            {verifiedUser && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 bg-sage-light/30 rounded-2xl border border-sage/30 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-sage/20">
                                                🏅
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-sage-dark uppercase tracking-tighter">Verified Account</p>
                                                <p className="text-lg font-black text-base-800">{verifiedUser.handle}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-base-400 uppercase">Tier</p>
                                            <p className="text-lg font-black text-misty-dark">Lv.{verifiedUser.tier}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 pt-2 border-t border-sage/20">
                                        <div>
                                            <p className="text-[10px] font-black text-base-400 uppercase">Solved</p>
                                            <p className="text-sm font-black text-base-700">{verifiedUser.solvedCount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-base-400 uppercase">Rating</p>
                                            <p className="text-sm font-black text-base-700">{verifiedUser.rating}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!verifiedUser && !error && !isLoading && (
                            <div className="bg-base-50 p-4 rounded-2xl border border-base-100 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-base-300 shrink-0" />
                                <p className="text-xs text-base-500 font-medium leading-relaxed font-sans">
                                    백준(solved.ac) 핸들을 연동하여 실시간 티어와 해결한 문제 수를 대시보드에서 확인하세요!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-0">
                    <button
                        onClick={handleSave}
                        disabled={!verifiedUser}
                        className="w-full py-4 bg-base-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-base-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg font-sans cursor-pointer"
                    >
                        <Check className="w-5 h-5" />
                        계정 연동하기
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileSettingsModal;
