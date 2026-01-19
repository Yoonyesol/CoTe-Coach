import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, TrendingUp, TrendingDown, Calendar, History } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GoldHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoldHistoryModal: React.FC<GoldHistoryModalProps> = ({ isOpen, onClose }) => {
    const { goldHistory, points, nickname, tier, bojHandle } = useUserStore();
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLockBodyScroll(isOpen);

    // Back button support for mobile
    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ modal: 'gold-history' }, '');

            const handlePopState = () => {
                onClose();
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isOpen, onClose]);

    const groupedHistory = useMemo(() => {
        const groups: Record<string, typeof goldHistory> = {};
        goldHistory.forEach(item => {
            const date = new Date(item.createdAt);
            const monthStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
            if (!groups[monthStr]) groups[monthStr] = [];
            groups[monthStr].push(item);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [goldHistory]);

    const modalVariants = getModalVariants(isMobile);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-base-900/60 backdrop-blur-sm cursor-pointer"
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass-card relative w-full sm:max-w-lg bg-white shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[80vh] overflow-hidden sm:rounded-[2.5rem] rounded-t-[2.5rem] rounded-b-none sm:rounded-b-[2.5rem] border-none"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-base-900 via-base-800 to-base-900 p-6 pt-[calc(env(safe-area-inset-top,24px)+24px)] sm:pt-6 flex items-center justify-between shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-wheat/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-wheat rounded-2xl flex items-center justify-center shadow-lg shadow-wheat/20 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-wheat-dark/20 to-transparent" />
                                    <Coins className="w-6 h-6 text-wheat-dark relative z-10" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-black text-white tracking-tight">골드 내역</h2>
                                    <p className="text-wheat/40 text-[10px] font-black uppercase tracking-[0.3em]">Royal Treasury History</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/80 hover:text-white border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Current Balance Card */}
                        <div className="px-6 pt-6 mb-2 shrink-0">
                            <div className="bg-gradient-to-br from-base-900 to-black rounded-[2rem] p-8 text-white shadow-2xl shadow-base-900/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-wheat/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-wheat/5 rounded-full -ml-24 -mb-24 blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <p className="text-[10px] font-black text-wheat/40 uppercase tracking-[0.2em] mb-2">Current Balance</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-wheat">{points.toLocaleString()}</span>
                                                <span className="text-sm font-black text-wheat/60 uppercase">Gold</span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-8 bg-gradient-to-br from-wheat/20 to-wheat/5 rounded-lg border border-wheat/20 backdrop-blur-sm flex items-center justify-center">
                                            <div className="w-6 h-4 bg-wheat/10 rounded-sm italic text-[8px] font-bold text-wheat/40 flex items-center justify-center">COACH</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{nickname || bojHandle || 'Anonymous User'}</p>
                                            <p className="text-xs font-bold text-wheat/60 tracking-wider uppercase">{tier}</p>
                                        </div>
                                        <Coins className="w-8 h-8 text-wheat opacity-20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                            {groupedHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <History className="w-12 h-12 mb-4" />
                                    <p className="text-sm font-bold">내역이 아직 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {groupedHistory.map(([month, items]) => (
                                        <div key={month} className="space-y-3">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar className="w-3.5 h-3.5 text-base-300" />
                                                <span className="text-[11px] font-black text-base-400 uppercase tracking-widest">{month}</span>
                                                <div className="flex-1 h-px bg-base-100" />
                                            </div>
                                            <div className="space-y-4">
                                                {items.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                                item.type === 'EARN' ? "bg-sage-light/30 text-sage-dark" : "bg-coral-light/30 text-coral-dark"
                                                            )}>
                                                                {item.type === 'EARN' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-base-800 line-clamp-1">{item.reason}</p>
                                                                <p className="text-[10px] font-bold text-base-400">
                                                                    {new Date(item.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={cn(
                                                                "text-sm font-black",
                                                                item.type === 'EARN' ? "text-sage-dark" : "text-coral-dark"
                                                            )}>
                                                                {item.type === 'EARN' ? '+' : ''}{item.amount.toLocaleString()} G
                                                            </p>
                                                            <p className="text-[9px] font-bold text-base-300">
                                                                잔액: {item.balanceAfter.toLocaleString()} G
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0 sm:pb-8 flex justify-center">
                            <p className="text-[10px] font-bold text-base-300 uppercase tracking-widest">
                                Showing last {goldHistory.length} transactions
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GoldHistoryModal;
