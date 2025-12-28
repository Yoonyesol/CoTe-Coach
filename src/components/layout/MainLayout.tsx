import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import ShopModal from '../ShopModal';

// 아이템 목록은 상점과 공유하거나 중앙 관리가 좋지만, 여기서는 시각화를 위해 매핑만 사용
const ITEM_EMOJIS: Record<string, string> = {
    'item_1': '🕶️', 'item_2': '🧢', 'item_3': '👑',
    'item_4': '🛋️', 'item_5': '🖥️', 'item_6': '💰', 'item_7': '✨'
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tier, level, xp, points, equippedItems } = useUserStore();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const progress = xp % 100;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-base-100 overflow-hidden font-sans">
            <aside className="w-full md:w-[400px] lg:w-[500px] h-[400px] md:h-screen bg-sage-light/50 border-r border-base-200 relative overflow-hidden flex flex-col">
                <div className="p-6 flex justify-between items-center z-10">
                    <span className="text-2xl font-black bg-gradient-to-br from-misty-dark to-lavender-dark bg-clip-text text-transparent">CoTe Coach</span>
                    <div className="glass-card px-3 py-1 text-sm font-bold text-wheat-dark">💰 {points.toLocaleString()}G</div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    {/* Equipped Decoration (Aura) */}
                    {equippedItems.includes('item_7') && (
                        <div className="absolute w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" />
                    )}

                    {/* Character Container */}
                    <div className="relative">
                        {/* Hat/Crown */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl z-20 transition-all duration-500">
                            {equippedItems.includes('item_3') ? ITEM_EMOJIS['item_3'] :
                                equippedItems.includes('item_2') ? ITEM_EMOJIS['item_2'] : ''}
                        </div>

                        {/* Sunglasses */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xl z-20 transition-all duration-500 ml-1">
                            {equippedItems.includes('item_1') ? ITEM_EMOJIS['item_1'] : ''}
                        </div>

                        <div className="text-8xl mb-4 animate-bounce-soft relative z-10">🐧</div>

                        {/* Furniture/Deco around */}
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

                    <p className="text-lg font-black text-base-800 mt-6 font-sans">코딩 초보 펭군</p>
                    <div className="w-48 h-3 bg-base-200 rounded-full mt-2 overflow-hidden border border-white">
                        <div
                            className="h-full bg-misty transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs mt-1 text-base-500 font-black">Lv. {level} ({progress}%)</p>
                    <p className="text-sm font-black text-misty-dark mt-1 uppercase tracking-tighter">{tier}</p>
                </div>

                <div className="p-6 grid grid-cols-3 gap-2 z-10">
                    <button
                        onClick={() => setIsShopOpen(true)}
                        className="game-button bg-white text-base-700 text-xs shadow-sm font-black active:scale-95 transition-transform"
                    >
                        상점
                    </button>
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm font-black active:scale-95 transition-transform">가방</button>
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm font-black active:scale-95 transition-transform">랭킹</button>
                </div>

                <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
            </aside>
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-8 bg-white/30 backdrop-blur-sm">{children}</main>
        </div>
    );
};

export default MainLayout;
