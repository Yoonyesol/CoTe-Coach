import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import ShopModal from '../ShopModal';
import { LayoutDashboard, BarChart3, ShoppingBag, Trophy, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const ITEM_EMOJIS: Record<string, string> = {
    'item_1': '🕶️', 'item_2': '🧢', 'item_3': '👑',
    'item_4': '🛋️', 'item_5': '🖥️', 'item_6': '💰', 'item_7': '✨'
};

interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: 'HOME' | 'STATS';
    onTabChange: (tab: 'HOME' | 'STATS') => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange }) => {
    const { tier, level, xp, points, equippedItems } = useUserStore();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const progress = xp % 100;

    const navItems = [
        { id: 'HOME', icon: <LayoutDashboard className="w-6 h-6" />, label: '대시보드' },
        { id: 'STATS', icon: <BarChart3 className="w-6 h-6" />, label: '상세 통계' },
    ] as const;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-base-100 overflow-hidden font-sans">
            {/* 1. Navigation Rail (Leftmost) */}
            <nav className="w-20 bg-base-900 flex flex-col items-center py-8 gap-6 z-30 shrink-0">
                <div className="w-10 h-10 bg-misty rounded-xl flex items-center justify-center mb-4">
                    <span className="text-xl font-black text-base-900">C</span>
                </div>

                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={clsx(
                            "group relative p-3 rounded-2xl transition-all duration-300",
                            activeTab === item.id
                                ? "bg-white text-base-900 shadow-lg shadow-white/10 scale-110"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                        title={item.label}
                    >
                        {item.icon}
                    </button>
                ))}

                <div className="mt-auto flex flex-col gap-6">
                    <button
                        onClick={() => setIsShopOpen(true)}
                        className="p-3 rounded-2xl text-white/40 hover:text-wheat hover:bg-white/5 transition-all outline-none"
                        title="상점"
                    >
                        <ShoppingBag className="w-6 h-6" />
                    </button>
                    <button className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all outline-none">
                        <Trophy className="w-6 h-6" />
                    </button>
                    <button className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all outline-none" title="설정">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* 2. Character Sidebar */}
            <aside className="w-full md:w-[320px] lg:w-[360px] h-[400px] md:h-screen bg-sage-light/50 border-r border-base-200 relative overflow-hidden flex flex-col z-20 shrink-0">
                <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-12">
                        <span className="text-xl font-black bg-gradient-to-br from-misty-dark to-lavender-dark bg-clip-text text-transparent">CoTe Coach</span>
                        <div className="glass-card px-3 py-1.5 text-xs font-black text-wheat-dark border-none shadow-sm flex items-center gap-1.5">
                            <span className="text-sm">💰</span> {points.toLocaleString()}G
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        {/* Equipped Decoration (Aura) */}
                        {equippedItems.includes('item_7') && (
                            <div className="absolute w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" />
                        )}

                        {/* Character Container */}
                        <div className="relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl z-20">
                                {equippedItems.includes('item_3') ? ITEM_EMOJIS['item_3'] :
                                    equippedItems.includes('item_2') ? ITEM_EMOJIS['item_2'] : ''}
                            </div>
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xl z-20 ml-1">
                                {equippedItems.includes('item_1') ? ITEM_EMOJIS['item_1'] : ''}
                            </div>
                            <div className="text-9xl mb-4 animate-bounce-soft relative z-10 drop-shadow-2xl">🐧</div>

                            <div className="absolute -right-16 bottom-4 text-4xl animate-in zoom-in duration-500">
                                {equippedItems.includes('item_5') ? ITEM_EMOJIS['item_5'] : ''}
                            </div>
                            <div className="absolute -left-16 bottom-4 text-4xl animate-in zoom-in duration-500">
                                {equippedItems.includes('item_4') ? ITEM_EMOJIS['item_4'] : ''}
                            </div>
                            <div className="absolute -bottom-8 left-12 text-3xl animate-in zoom-in duration-500">
                                {equippedItems.includes('item_6') ? ITEM_EMOJIS['item_6'] : ''}
                            </div>
                        </div>

                        <div className="mt-12 text-center space-y-2">
                            <p className="text-xl font-black text-base-900 font-sans">코딩 초보 펭군</p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-white shadow-sm">
                                <span className="text-[10px] font-black text-misty-dark uppercase tracking-tighter shrink-0">Lv. {level}</span>
                                <div className="w-24 h-2 bg-base-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-misty" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-base-400 shrink-0">{progress}%</span>
                            </div>
                            <p className="text-xs font-black text-misty-dark uppercase tracking-widest">{tier}</p>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                        <button className="game-button bg-white text-base-800 text-[10px] shadow-sm font-black border-none ring-1 ring-base-100 hover:bg-base-50 transition-colors">가방 확인</button>
                        <button className="game-button bg-white text-base-800 text-[10px] shadow-sm font-black border-none ring-1 ring-base-100 hover:bg-base-50 transition-colors">프로필 설정</button>
                    </div>
                </div>

                <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
            </aside>

            {/* 3. Main Content */}
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-8 bg-white/30 backdrop-blur-sm z-10 scrollbar-hide">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
