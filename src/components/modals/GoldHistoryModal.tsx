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
    const { goldHistory, points } = useUserStore();
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
                        className="relative w-full sm:max-w-lg bg-white shadow-2xl flex flex-col h-[100dvh] sm:max-h-[80vh] overflow-hidden sm:rounded-3xl rounded-none sm:rounded-b-3xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-base-100 flex items-center justify-between bg-gradient-to-r from-wheat-light/30 to-white pt-[env(safe-area-inset-top,24px)] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-wheat rounded-2xl flex items-center justify-center shadow-lg shadow-wheat/20">
                                    <History className="w-5 h-5 text-wheat-dark" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-base-800">지갑 내역</h2>
                                    <p className="text-[10px] font-bold text-base-400 uppercase tracking-tight">Gold Transaction History</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-base-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-base-400" />
                            </button>
                        </div>

                        {/* Current Balance Card */}
                        <div className="px-6 pt-6 mb-2">
                            <div className="bg-base-900 rounded-2xl p-6 text-white shadow-xl shadow-base-900/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Current Balance</p>
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-6 h-6 text-wheat" />
                                            <span className="text-3xl font-black">{points.toLocaleString()}</span>
                                            <span className="text-sm font-bold text-white/60">G</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-md mb-2 uppercase tracking-wide">Royal Wallet</div>
                                        <div className="flex gap-1 justify-end">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-wheat/30" />)}
                                        </div>
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
