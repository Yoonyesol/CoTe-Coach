import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { ShopItem } from '../../types/shop';
import { clsx } from 'clsx';
import { ShopModalProps } from '../../types/modal';
import { AVATAR_ASSETS, resolveSkin, SvgMonitor, SvgTreasure, SvgSafe } from '../avatar/AvatarAssets';
import { SHOP_ITEMS } from '../../constants/shop';
import { backdropVariants, getModalVariants } from '../../lib/animations';

interface ExtendedShopModalProps extends ShopModalProps {
    initialCategory?: 'ACCESSORY' | 'CLOTHES' | 'FURNITURE' | 'DECO' | 'WALLPAPER' | 'INVENTORY';
}

const ItemIcon: React.FC<{ item: ShopItem; asset?: any }> = ({ item, asset }) => {
    const [hasError, setHasError] = useState(false);

    // 1. AvatarAssets에 정의된 iconPath 우선
    // 2. 없으면 규칙에 따른 경로 (/assets/avatar/icon_아이템명.png) 시도
    const iconUrl = asset?.iconPath || `/assets/avatar/icon_${item.id.replace('item_', '')}.png`;

    if (hasError) {
        return <span className="text-4xl animate-in zoom-in duration-300">{item.emoji}</span>;
    }

    return (
        <img
            src={iconUrl}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow-md animate-in fade-in zoom-in duration-300"
            onError={() => setHasError(true)}
        />
    );
};

const ShopModal: React.FC<ExtendedShopModalProps> = ({ isOpen, onClose, initialCategory }) => {
    const { points, inventory, equippedItems, buyItem, toggleEquip } = useUserStore();
    const { showAlert } = useModalStore();
    const [activeCategory, setActiveCategory] = useState<'ACCESSORY' | 'CLOTHES' | 'FURNITURE' | 'DECO' | 'WALLPAPER' | 'INVENTORY'>(initialCategory || 'ACCESSORY');
    const [previewItemId, setPreviewItemId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Sync active category when prop changes
    useEffect(() => {
        if (initialCategory) setActiveCategory(initialCategory);
    }, [initialCategory]);

    if (!isOpen) return null;

    const categories = [
        { id: 'ACCESSORY', label: '악세사리', emoji: '🎀' },
        { id: 'CLOTHES', label: '의상', emoji: '👕' },
        { id: 'FURNITURE', label: '가구', emoji: '🏠' },
        { id: 'WALLPAPER', label: '벽지', emoji: '🖼️' },
        { id: 'DECO', label: '장식', emoji: '🎨' },
        { id: 'INVENTORY', label: '내 가방', emoji: '🎒' },
    ] as const;

    const filteredItems = activeCategory === 'INVENTORY'
        ? SHOP_ITEMS.filter(item => inventory.includes(item.id))
        : SHOP_ITEMS.filter(item => item.category === activeCategory);

    // 미리보기용 아이템 목록 계산
    const getPreviewItems = (): string[] => {
        if (!previewItemId) return equippedItems;

        const previewAsset = AVATAR_ASSETS[previewItemId];
        if (!previewAsset) return [...equippedItems, previewItemId];

        // 같은 슬롯의 기존 아이템 제외하고 새 아이템 추가
        const filtered = equippedItems.filter(id => {
            const asset = AVATAR_ASSETS[id];
            return !asset || asset.slot !== previewAsset.slot;
        });
        return [...filtered, previewItemId];
    };

    const previewSkinPath = resolveSkin(getPreviewItems());
    const modalVariants = getModalVariants(isMobile);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                        className="glass-card bg-white w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[90vh] sm:h-[700px] sm:rounded-3xl rounded-t-3xl rounded-b-none sm:rounded-b-3xl border-none"
                    >

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
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
                            {/* Left: Fitting Room */}
                            <div className="w-full sm:w-[35%] bg-base-50/50 border-b sm:border-b-0 sm:border-r border-base-100 flex flex-col items-center justify-center pt-2 pb-0 px-4 sm:p-8 relative shrink-0">
                                <div className="relative w-full sm:w-auto sm:absolute sm:top-4 sm:left-4 flex items-center justify-start gap-2 mb-2 sm:mb-0 z-10">
                                    <span className="px-3 py-1 bg-misty-dark text-white rounded-full text-[10px] font-black uppercase tracking-tight">Fitting Room</span>
                                </div>

                                <div className="relative bg-white rounded-3xl p-2 sm:p-8 shadow-inner border-2 border-base-100 isolate">
                                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center isolate">
                                        {/* 펭귄 배경 (벽지) */}
                                        {getPreviewItems().map(id => {
                                            const asset = AVATAR_ASSETS[id];
                                            if (asset && asset.slot === 'wallpaper' && asset.svgIcon) {
                                                const SvgComponent = asset.svgIcon;
                                                return (
                                                    <div key={id} className="absolute inset-0 z-[-1]">
                                                        <SvgComponent />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                        {/* 소파 */}
                                        {getPreviewItems().includes('item_sofa') && (
                                            <div className="absolute -bottom-1.5 sm:-bottom-2 w-[375px] sm:w-[500px] h-[210px] sm:h-[280px] z-[5]">
                                                <img src="/assets/avatar/icon_sofa.png" alt="Sofa" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        {/* 모니터 */}
                                        {getPreviewItems().includes('item_monitor') && (
                                            <div className="absolute right-6 sm:right-8 top-1/2 w-[72px] sm:w-24 h-[60px] sm:h-20 z-10 translate-y-[-20%] scale-x-[-1]">
                                                <SvgMonitor />
                                            </div>
                                        )}
                                        {/* 보물상자 */}
                                        {getPreviewItems().includes('item_treasure') && (
                                            <div className="absolute left-6 sm:left-8 bottom-12 sm:bottom-16 w-[60px] sm:w-20 h-[48px] sm:h-16 z-10">
                                                <SvgTreasure />
                                            </div>
                                        )}
                                        {/* 금고 */}
                                        {getPreviewItems().includes('item_safe') && (
                                            <div className="absolute right-6 sm:right-8 bottom-12 sm:bottom-16 w-[48px] sm:w-16 h-[72px] sm:h-24 z-10">
                                                <SvgSafe />
                                            </div>
                                        )}
                                        {/* 장식 효과들 (오라, 후광, 하트, 눈 등) */}
                                        {getPreviewItems().map(id => {
                                            const asset = AVATAR_ASSETS[id];
                                            if (asset && asset.slot === 'effect' && asset.svgIcon) {
                                                const SvgComponent = asset.svgIcon;
                                                const isBehind = ['item_aura', 'item_halo'].includes(id);
                                                return (
                                                    <div key={id} className={clsx("absolute inset-0 pointer-events-none", isBehind ? "z-[2]" : "z-20")}>
                                                        <SvgComponent />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                        {/* 펭귄 */}
                                        <img
                                            src={previewSkinPath}
                                            alt="Penguin Preview"
                                            className="w-[156px] h-[156px] sm:w-52 sm:h-52 object-contain relative z-10"
                                        />
                                    </div>
                                </div>

                                <div className="hidden sm:block mt-8 text-center space-y-1">
                                    <p className="text-sm font-black text-base-800 font-sans">
                                        {previewItemId ? SHOP_ITEMS.find(i => i.id === previewItemId)?.name : '피팅룸'}
                                    </p>
                                    <p className="text-[11px] font-bold text-base-400 font-sans">
                                        {previewItemId ? '구매 전 미리 입혀보세요!' : '아이템을 클릭하여 미리보세요.'}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Item List */}
                            <div className="w-full sm:w-[65%] flex flex-col overflow-hidden">
                                {/* Categories */}
                                <div className="flex border-b border-base-100 p-2 gap-2 bg-base-50/50 overflow-x-auto scrollbar-hide shrink-0">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={clsx(
                                                "flex-1 py-3 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
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

                                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                    <div className="grid grid-cols-2 gap-4">
                                        {filteredItems.map((item) => {
                                            const isOwned = inventory.includes(item.id);
                                            const isEquipped = equippedItems.includes(item.id);
                                            const isSelected = previewItemId === item.id;
                                            const asset = AVATAR_ASSETS[item.id];

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setPreviewItemId(item.id)}
                                                    className={clsx(
                                                        "p-4 flex flex-col items-center justify-center gap-3 border-2 rounded-2xl transition-all group relative overflow-hidden cursor-pointer",
                                                        isSelected ? "border-misty ring-2 ring-misty-light ring-offset-2" : "border-base-100 hover:border-base-200 bg-white shadow-sm",
                                                        isEquipped && "bg-misty-light/5"
                                                    )}
                                                >
                                                    <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                        <ItemIcon item={item} asset={asset} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-black text-base-800 font-sans">{item.name}</p>
                                                        <div className="flex items-center justify-center gap-1 mt-1">
                                                            <Coins className="w-3 h-3 text-wheat-dark" />
                                                            <p className="text-[10px] font-black text-base-400 uppercase font-sans tracking-tight">{item.price}G</p>
                                                        </div>
                                                    </div>

                                                    {isOwned ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleEquip(item.id, asset?.slot, item.category);
                                                            }}
                                                            className={clsx(
                                                                "w-full py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer",
                                                                isEquipped ? "bg-misty-dark text-white shadow-inner" : "bg-base-100 text-base-600 hover:bg-base-200"
                                                            )}
                                                        >
                                                            {isEquipped ? (
                                                                <><Check className="w-3 h-3" /> 착용 해제</>
                                                            ) : (
                                                                '착용하기'
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const success = buyItem(item);
                                                                if (!success && points < item.price) {
                                                                    showAlert('골드 부족', `${item.name}을(를) 구매하기 위한 골드가 부족합니다.`);
                                                                }
                                                            }}
                                                            className="w-full py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer bg-wheat-dark text-white hover:bg-wheat shadow-lg active:scale-95"
                                                        >
                                                            구매하기
                                                        </button>
                                                    )}

                                                    {isOwned && (
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-sage-light rounded-md text-sage-dark text-[8px] font-black uppercase tracking-tighter">
                                                            OWNED
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t border-base-100 text-center">
                            <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">
                                아이템을 클릭하면 <span className="text-misty-dark">피팅룸</span>에서 미리 입혀볼 수 있어요!
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence >
    );
};

export default ShopModal;
