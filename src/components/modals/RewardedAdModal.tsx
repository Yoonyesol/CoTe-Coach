import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Gift, Loader2, Sparkles, Coins } from 'lucide-react';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { useUserStore } from '../../store/useUserStore';

interface RewardedAdModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'WATCHING' | 'COMPLETED'>('IDLE');
    const [timeLeft, setTimeLeft] = useState(15);
    const { watchAdAndEarnGold } = useUserStore();

    useEffect(() => {
        if (!isOpen) {
            setStatus('IDLE');
            setTimeLeft(15);
        }
    }, [isOpen]);

    useEffect(() => {
        let timer: any;
        if (status === 'WATCHING' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (status === 'WATCHING' && timeLeft === 0) {
            handleComplete();
        }
        return () => clearInterval(timer);
    }, [status, timeLeft]);

    const handleStart = () => {
        setStatus('LOADING');
        // Simulate ad SDK loading
        setTimeout(() => {
            setStatus('WATCHING');
        }, 1500);
    };

    const handleComplete = async () => {
        setStatus('COMPLETED');
        await watchAdAndEarnGold();
    };

    if (!isOpen) return null;

    const modalVariants = getModalVariants(window.innerWidth < 640);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 bg-base-900/80 backdrop-blur-md"
                        onClick={status === 'COMPLETED' || status === 'IDLE' ? onClose : undefined}
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass-card bg-white w-full max-w-md overflow-hidden shadow-2xl rounded-3xl border border-white/20 relative"
                    >
                        {(status === 'IDLE' || status === 'COMPLETED') && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-base-100 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-base-400" />
                            </button>
                        )}

                        <div className="p-8 flex flex-col items-center text-center">
                            {status === 'IDLE' && (
                                <>
                                    <div className="w-20 h-20 bg-wheat-light/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <PlayCircle className="w-10 h-10 text-wheat-dark" />
                                    </div>
                                    <h3 className="text-xl font-black text-base-900 font-sans mb-2">무료 골드 충전소</h3>
                                    <p className="text-sm text-base-500 font-medium mb-8 leading-relaxed">
                                        짧은 광고를 시청하고 캐릭터 꾸미기에 필요한<br />
                                        <span className="text-wheat-dark font-bold font-sans">100 Gold</span>를 즉시 획득하세요!
                                    </p>
                                    <button
                                        onClick={handleStart}
                                        className="w-full py-4 bg-base-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-base-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        광고 시청 시작하기
                                    </button>
                                </>
                            )}

                            {status === 'LOADING' && (
                                <div className="py-12 flex flex-col items-center">
                                    <Loader2 className="w-12 h-12 text-misty-dark animate-spin mb-4" />
                                    <p className="text-sm font-bold text-base-400 font-sans animate-pulse">광고를 불러오는 중입니다...</p>
                                </div>
                            )}

                            {status === 'WATCHING' && (
                                <div className="py-8 w-full">
                                    <div className="relative w-32 h-32 mx-auto mb-8">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="60"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                className="text-base-100"
                                            />
                                            <motion.circle
                                                cx="64"
                                                cy="64"
                                                r="60"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                className="text-misty-dark"
                                                strokeDasharray={377}
                                                initial={{ strokeDashoffset: 377 }}
                                                animate={{ strokeDashoffset: (timeLeft / 15) * 377 }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-base-900 font-sans">{timeLeft}</span>
                                            <span className="text-[10px] font-bold text-base-400 uppercase tracking-tighter">Seconds</span>
                                        </div>
                                    </div>
                                    <p className="text-base font-black text-base-900 font-sans mb-1">광고 시청 중</p>
                                    <p className="text-xs text-base-400 font-bold">종료 시까지 기다려 주세요. 보상이 곧 지급됩니다!</p>
                                    <div className="mt-8 flex gap-1 justify-center">
                                        {[1, 2, 3].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                                                className="w-1.5 h-1.5 rounded-full bg-misty-dark"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {status === 'COMPLETED' && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="py-6"
                                >
                                    <div className="relative mb-6">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                            className="absolute inset-0 scale-150"
                                        >
                                            <Sparkles className="w-full h-full text-wheat/40" />
                                        </motion.div>
                                        <div className="w-24 h-24 bg-wheat rounded-full flex items-center justify-center shadow-2xl shadow-wheat/50 relative z-10">
                                            <Gift className="w-12 h-12 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-base-900 font-sans mb-2">보상 획득 완료!</h3>
                                    <p className="text-sm text-base-500 font-medium mb-8">
                                        성공적으로 광고를 시청하셨습니다.<br />
                                        <span className="text-wheat-dark font-black font-sans flex items-center justify-center gap-1.5 text-lg mt-1">
                                            <Coins className="w-5 h-5" /> 100 Gold가 지급되었습니다.
                                        </span>
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-sage-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-sage transition-all shadow-xl active:scale-95"
                                    >
                                        확인
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RewardedAdModal;
