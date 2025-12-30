import React, { useState } from 'react';
import { X, ShoppingBag, Check, Coins } from 'lucide-react';
import { useUserStore, ShopItem } from '../../store/useUserStore';
import { clsx } from 'clsx';

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 'item_1', name: '멋쟁이 선글라스', price: 100, category: 'CLOTHES', emoji: '🕶️' },
    { id: 'item_2', name: '알록달록 모자', price: 250, category: 'CLOTHES', emoji: '🧢' },
    { id: 'item_3', name: '럭셔리 왕관', price: 1500, category: 'CLOTHES', emoji: '👑' },
    { id: 'item_4', name: '편안한 소파', price: 500, category: 'FURNITURE', emoji: '🛋️' },
    { id: 'item_5', name: '코딩용 모니터', price: 800, category: 'FURNITURE', emoji: '🖥️' },
    { id: 'item_6', name: '황금 보물상자', price: 2000, category: 'DECO', emoji: '💰' },
    { id: 'item_7', name: '반짝이는 오라', price: 3000, category: 'DECO', emoji: '✨' },
];

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
    const { points, inventory, equippedItems, buyItem, toggleEquip } = useUserStore();
    const [activeCategory, setActiveCategory] = useState<'CLOTHES' | 'FURNITURE' | 'DECO'>('CLOTHES');

    if (!isOpen) return null;

    const categories = [
        { id: 'CLOTHES', label: '의상', emoji: '👕' },
        { id: 'FURNITURE', label: '가구', emoji: '🏠' },
        { id: 'DECO', label: '장식', emoji: '🎨' },
    ] as const;

    const filteredItems = SHOP_ITEMS.filter(item => item.category === activeCategory);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-card bg-white w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col h-[600px]">

                {/* Header */}
                <div className="bg-base-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <ShoppingBag className="w-5 h-5 text-wheat" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-sans leading-tight">코테 부띠끄</h2>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-sans">Premium Shop</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2 border border-white/10">
                            <Coins className="w-4 h-4 text-wheat" />
                            <span className="text-sm font-black text-wheat">{points.toLocaleString()}G</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex border-b border-base-100 p-2 gap-2 bg-base-50/50">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={clsx(
                                "flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                                activeCategory === cat.id
                                    ? "bg-white text-base-900 shadow-md border border-base-100"
                                    : "text-base-400 hover:bg-white/50"
                            )}
                        >
                            <span>{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Item List */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {filteredItems.map((item) => {
                            const isOwned = inventory.includes(item.id);
                            const isEquipped = equippedItems.includes(item.id);
                            const canAfford = points >= item.price;

                            return (
                                <div
                                    key={item.id}
                                    className={clsx(
                                        "glass-card p-4 flex flex-col items-center justify-center gap-3 border-2 transition-all group relative overflow-hidden",
                                        isEquipped ? "border-misty bg-misty-light/10" : "border-base-100 hover:border-base-200"
                                    )}
                                >
                                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                                        {item.emoji}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-base-800 font-sans">{item.name}</p>
                                        <p className="text-[10px] font-bold text-base-400 uppercase font-sans">{item.price}G</p>
                                    </div>

                                    {isOwned ? (
                                        <button
                                            onClick={() => toggleEquip(item.id)}
                                            className={clsx(
                                                "w-full py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1",
                                                isEquipped ? "bg-misty-dark text-white" : "bg-base-100 text-base-600 hover:bg-base-200"
                                            )}
                                        >
                                            {isEquipped ? (
                                                <><Check className="w-3 h-3" /> 착용 중</>
                                            ) : (
                                                '착용하기'
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => buyItem(item)}
                                            disabled={!canAfford}
                                            className={clsx(
                                                "w-full py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1",
                                                canAfford
                                                    ? "bg-base-900 text-white hover:bg-base-800 shadow-sm"
                                                    : "bg-base-50 text-base-300 cursor-not-allowed"
                                            )}
                                        >
                                            구매하기
                                        </button>
                                    )}

                                    {/* Sold Out Badge */}
                                    {isOwned && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-sage-light rounded-md text-sage-dark text-[8px] font-black uppercase">
                                            OWNED
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-base-50/50 border-t border-base-100 text-center">
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">문제를 풀고 획득한 골드로 캐릭터를 꾸며보세요!</p>
                </div>
            </div>
        </div>
    );
};

export default ShopModal;
