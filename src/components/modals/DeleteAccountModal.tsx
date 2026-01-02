import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DELETION_REASONS = [
    "서비스가 이용하기 어려워요",
    "풀고 싶은 문제가 부족해요",
    "더 이상 코딩 테스트를 준비하지 않아요",
    "다른 서비스를 이용하기로 했어요",
    "자주 사용하지 않게 돼요",
    "직접 입력"
];

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
    const { verifyCurrentPassword, deleteAccount } = useAuthStore();
    const { showAlert } = useModalStore();

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedReason, setSelectedReason] = useState(DELETION_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'FORM' | 'FAREWELL'>('FORM');

    // Prevent background scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStep('FORM'); // Reset to form when opening
            setPassword('');
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleProceedToFarewell = async () => {
        if (!password) {
            showAlert("입력 확인", "본인 확인을 위해 비밀번호를 입력해 주세요.");
            return;
        }

        if (selectedReason === "직접 입력" && !customReason.trim()) {
            showAlert("입력 확인", "탈퇴 사유를 입력해 주세요.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Verify password first
            const { error: verifyError } = await verifyCurrentPassword(password);
            if (verifyError) {
                showAlert("인증 실패", "비밀번호가 올바르지 않습니다.");
                setIsLoading(false);
                return;
            }

            // Success - move to farewell step
            setStep('FAREWELL');
        } catch (err) {
            showAlert("오류 발생", "인증 처리 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const reason = selectedReason === "직접 입력" ? customReason : selectedReason;
            const { error: deleteError } = await deleteAccount(reason);
            if (deleteError) {
                showAlert("탈퇴 실패", "회원 탈퇴 처리 중 오류가 발생했습니다.");
                setIsLoading(false);
                return;
            }

            // Success (AuthStore will handle logout and state reset)
            onClose();
        } catch (err) {
            showAlert("오류 발생", "탈퇴 처리 중 예기치 않은 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-md bg-white border-none shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-base-100 shrink-0">
                    <h2 className="text-xl font-black text-red-600 font-sans">
                        {step === 'FORM' ? '회원 탈퇴' : '마지막 인사'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-base-100 rounded-lg transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-base-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'FORM' ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-black text-red-800">잠시만요! 정말 탈퇴하시겠습니까?</p>
                                        <p className="text-xs text-red-600 font-medium leading-relaxed mt-1">
                                            탈퇴 시 모든 학습 데이터, 포인트, 기록이 삭제되며 복구가 불가능합니다.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans px-1">
                                            탈퇴 사유 (필수)
                                        </label>
                                        <select
                                            value={selectedReason}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all text-sm font-bold appearance-none outline-none cursor-pointer"
                                        >
                                            {DELETION_REASONS.map(reason => (
                                                <option key={reason} value={reason}>{reason}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedReason === "직접 입력" && (
                                        <textarea
                                            placeholder="탈퇴 사유를 입력해 주세요."
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all text-sm font-bold min-h-[100px] resize-none outline-none"
                                        />
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest font-sans px-1">
                                            본인 확인 (비밀번호 입력)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="비밀번호를 입력해 주세요"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 pr-12 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all text-sm font-bold outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-base-400 hover:text-base-600"
                                            >
                                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-4 bg-base-100 text-base-600 rounded-2xl font-black text-sm hover:bg-base-200 transition-all active:scale-95"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleProceedToFarewell}
                                        disabled={isLoading}
                                        className="flex-2 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '다음 단계로'}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="farewell"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center py-4 space-y-8"
                            >
                                <div className="w-20 h-20 bg-base-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                    👋
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-base-900 font-sans tracking-tight">
                                        정말 떠나시는군요...
                                    </h3>
                                    <p className="text-sm text-base-500 font-medium leading-relaxed px-4">
                                        그동안 CoTe-Coach와 함께해주셔서 진심으로 감사했습니다.<br />
                                        사용자님의 코딩 테스트 합격을 항상 응원하겠습니다.<br />
                                        언제가 되든, 다시 돌아오신다면 기쁘게 맞이할게요!
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-base-900 text-white rounded-2xl font-black text-sm hover:bg-base-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '작별 인사하고 탈퇴하기'}
                                    </button>
                                    <button
                                        onClick={() => setStep('FORM')}
                                        className="w-full py-3 text-base-400 text-xs font-bold hover:text-base-600 transition-colors"
                                    >
                                        잠깐, 다시 생각할게요
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default DeleteAccountModal;
