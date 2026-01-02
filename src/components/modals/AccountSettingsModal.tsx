import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Link as LinkIcon, Link2Off, Trash2, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { fetchSolvedAcUser } from '../../api/solvedac';
import { SolvedAcUser } from '../../types/user';
import { motion, AnimatePresence } from 'framer-motion';

import { backdropVariants, getModalVariants } from '../../lib/animations';
import { AccountSettingsModalProps } from '../../types/modal';

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
    const { bojHandle, linkBojAccount, unlinkBojAccount } = useUserStore();
    const { showAlert, showConfirm } = useModalStore();

    // Profile State
    const [handle, setHandle] = useState(bojHandle || '');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<SolvedAcUser | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setHandle(bojHandle || '');
            setVerifiedUser(null);
            setProfileError(null);
        }
    }, [isOpen, bojHandle]);

    // Prevent background scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleVerify = async () => {
        if (!handle.trim()) return;
        setIsVerifying(true);
        setProfileError(null);
        setVerifiedUser(null);
        try {
            const data = await fetchSolvedAcUser(handle.trim());
            setVerifiedUser(data);
        } catch (err: any) {
            setProfileError('사용자를 찾을 수 없습니다. 핸들을 확인해주세요.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleLinkAccount = () => {
        if (verifiedUser) {
            linkBojAccount(verifiedUser.handle, verifiedUser.rating); // Use rating instead of tier
            showAlert("연동 완료", `백준 계정이 연동되었습니다! 실시간 레이팅이 반영되었습니다. ✨`);
            setVerifiedUser(null);
        }
    };

    const handleUnlink = () => {
        showConfirm(
            "계정 연동 해제",
            '정말 백준 계정 연동을 해제하시겠습니까? 레벨과 경험치가 초기화됩니다.',
            () => {
                unlinkBojAccount();
                setHandle('');
                setVerifiedUser(null);
                showAlert("연동 해제 완료", "계정 연동이 해제되었습니다.");
            }
        );
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const modalVariants = getModalVariants(isMobile);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                        className="glass-card w-full max-w-md bg-white border-none shadow-2xl relative z-10 overflow-hidden flex flex-col sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-base-100 shrink-0">
                            <h2 className="text-xl font-black text-base-900 font-sans">계정 연동</h2>
                            <button onClick={onClose} className="p-1 hover:bg-base-100 rounded-lg transition-colors cursor-pointer">
                                <X className="w-5 h-5 text-base-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans flex items-center gap-2">
                                        <LinkIcon size={12} className="text-misty" /> Solved.ac (백준) 핸들
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                            <input
                                                type="text"
                                                placeholder="예: koosaga"
                                                value={handle}
                                                onChange={(e) => setHandle(e.target.value)}
                                                className="w-full pl-10 pr-4 py-4 bg-base-50 border-none rounded-2xl focus:ring-2 focus:ring-misty transition-all text-sm font-bold caret-coral"
                                            />
                                        </div>
                                        <button
                                            onClick={handleVerify}
                                            disabled={isVerifying || !handle.trim()}
                                            className="px-6 py-4 bg-misty-dark text-white rounded-2xl font-black text-sm hover:bg-misty transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                        >
                                            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : '검증'}
                                        </button>
                                    </div>
                                </div>

                                {bojHandle && !verifiedUser && (
                                    <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-400 shadow-sm">
                                                <Link2Off size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-red-300 uppercase shrink-0">Linked Account</p>
                                                <p className="text-sm font-black text-red-600 shrink-0">{bojHandle}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUnlink}
                                            className="p-2 hover:bg-white rounded-xl text-red-500 transition-all cursor-pointer group"
                                        >
                                            <Trash2 size={18} className="group-hover:scale-110" />
                                        </button>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {verifiedUser && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-sage-light/30 rounded-2xl border border-sage/30 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-sage/20">🏅</div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-sage-dark uppercase tracking-tighter">Verified</p>
                                                        <p className="text-lg font-black text-base-800">{verifiedUser.handle}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-base-400 uppercase">Tier</p>
                                                    <p className="text-lg font-black text-misty-dark">Lv.{verifiedUser.tier}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleLinkAccount}
                                                className="w-full py-3 bg-base-900 text-white rounded-xl font-black text-sm hover:bg-base-800 transition-all active:scale-95 shadow-md"
                                            >
                                                이 계정으로 연동하기
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {profileError && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100">
                                        <AlertCircle size={14} /> {profileError}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AccountSettingsModal;
