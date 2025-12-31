import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSolvedAcUser } from '../../hooks/useSolvedAc';
import ShopModal from '../modals/ShopModal';
import { LayoutDashboard, BarChart3, ShoppingBag, Trophy, Settings, LogOut, Link as LinkIcon, Briefcase, Info, BookOpen, Library } from 'lucide-react';
import TierBadge from '../TierBadge';
import BojTierBadge from '../BojTierBadge';
import { clsx } from 'clsx';

const ITEM_EMOJIS: Record<string, string> = {
    'item_1': '🕶️', 'item_2': '🧢', 'item_3': '👑',
    'item_4': '🛋️', 'item_5': '🖥️', 'item_6': '💰', 'item_7': '✨'
};

import { MainLayoutProps } from '../../types/components';

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange, onAccountSettingsOpen, onTierClick }) => {
    const level = useUserStore((state) => state.level);
    const xp = useUserStore((state) => state.xp);
    const tier = useUserStore((state) => state.tier);
    const points = useUserStore((state) => state.points);
    const equippedItems = useUserStore((state) => state.equippedItems);
    const bojHandle = useUserStore((state) => state.bojHandle);

    const { signOut } = useAuthStore();
    const { showConfirm } = useModalStore();

    // We'll manage the internal state for the modal here or use the prop
    // To satisfy the user's request of "gear icon opens it", we should handle the modal visibility.
    // However, if App.tsx also has a settings button, it's better to lift the state or use onSettingsOpen.
    // Let's assume MainLayout receives the state if it's already in App.tsx.

    const [isShopOpen, setIsShopOpen] = useState(false);
    const progress = xp % 100;

    const { data: solvedAcData } = useSolvedAcUser(bojHandle);
    const syncSolvedAcTier = useUserStore((state) => state.syncSolvedAcTier);

    // Auto-sync BOJ rating whenever data refreshed
    React.useEffect(() => {
        if (solvedAcData?.rating) {
            syncSolvedAcTier(solvedAcData.rating);
        }
    }, [solvedAcData?.rating, syncSolvedAcTier]);

    const navItems = [
        { id: 'HOME', icon: <LayoutDashboard className="w-6 h-6" />, label: '대시보드' },
        { id: 'JOURNAL', icon: <BookOpen className="w-6 h-6" />, label: '학습 일지' },
        { id: 'LIBRARY', icon: <Library className="w-6 h-6" />, label: '문제 보관함' },
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
                            "group relative p-3 rounded-2xl transition-all duration-300 cursor-pointer",
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
                        className="p-3 rounded-2xl text-white/40 hover:text-wheat hover:bg-white/5 transition-all outline-none cursor-pointer"
                        title="상점"
                    >
                        <ShoppingBag className="w-6 h-6" />
                    </button>
                    <button className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all outline-none cursor-pointer">
                        <Trophy className="w-6 h-6" />
                    </button>
                    <button
                        className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all outline-none cursor-pointer"
                        title="설정"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => {
                            showConfirm(
                                '로그아웃',
                                '정말 로그아웃 하시겠습니까?',
                                () => signOut()
                            );
                        }}
                        className="p-3 rounded-2xl text-white/40 hover:text-coral hover:bg-white/5 transition-all outline-none cursor-pointer"
                        title="로그아웃"
                    >
                        <LogOut className="w-6 h-6" />
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
                            <p className="text-xl font-black text-base-900 font-sans">
                                {
                                    level >= 42 ? '전설의' :
                                        level >= 41 ? '초월적인' :
                                            level >= 39 ? '알고리즘 마스터' :
                                                level >= 36 ? '코딩 챔피언' :
                                                    level >= 29 ? '코딩 전문가' :
                                                        level >= 19 ? '코딩 해결사' :
                                                            level >= 9 ? '코딩 유망주' :
                                                                level >= 4 ? '코딩 새싹' : '코딩 입문자'
                                } 펭군
                            </p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-white shadow-sm">
                                <span className="text-[10px] font-black text-misty-dark uppercase tracking-tighter shrink-0">Lv. {level}</span>
                                <div className="w-24 h-2 bg-base-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-misty" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-base-400 shrink-0">{progress}%</span>
                            </div>
                            <div className="flex justify-center w-full">
                                <button
                                    onClick={onTierClick}
                                    className="group relative flex items-center justify-center gap-2 px-4 py-2 hover:bg-white/40 rounded-xl transition-all cursor-pointer"
                                >
                                    <TierBadge tier={tier} size="sm" />
                                    <span className="text-sm font-black text-base-700 group-hover:text-misty-dark transition-colors">{tier}</span>
                                    <Info className="w-3 h-3 text-base-300 group-hover:text-misty transition-colors opacity-0 group-hover:opacity-100" />
                                </button></div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {/* Solved.ac Integration Badge */}
                        <div
                            onClick={onAccountSettingsOpen}
                            className="p-4 bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-sm cursor-pointer hover:bg-white/60 transition-colors group"
                        >
                            {bojHandle ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <BojTierBadge
                                            level={solvedAcData?.tier || 0}
                                            size="md"
                                            className="transform scale-95 origin-left"
                                        />
                                        <div>
                                            <p className="text-[9px] font-black text-misty-dark uppercase tracking-tighter mb-0.5">Solved.ac</p>
                                            <p className="text-sm font-black text-base-800">{bojHandle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-base-400 uppercase">Tier</p>
                                        <p className="text-xs font-black text-misty-dark">
                                            {(() => {
                                                const lv = solvedAcData?.tier || 0;
                                                const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'];
                                                const tierIdx = Math.floor((lv - 1) / 5);
                                                const subTier = 5 - ((lv - 1) % 5);
                                                const tierName = tierIdx >= tiers.length ? 'Master' : tiers[tierIdx];
                                                return `${tierName} ${subTier}`;
                                            })()}
                                            <span className="text-[9px] text-base-400 ml-1">(Lv.{solvedAcData?.tier || '?'})</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm border border-base-100">
                                            <LinkIcon size={16} className="text-base-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-base-400 uppercase tracking-tighter">Solved.ac</p>
                                            <p className="text-xs font-black text-base-800">연동 필요</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onAccountSettingsOpen}
                                        className="px-3 py-1.5 bg-misty-dark text-white rounded-lg text-[10px] font-black hover:bg-misty transition-all active:scale-95 cursor-pointer"
                                    >
                                        연동하기
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <button className="game-button bg-white text-base-800 text-[10px] shadow-sm font-black border-none ring-1 ring-base-100 hover:bg-base-50 transition-colors cursor-pointer flex items-center gap-2 group px-6">
                                <Briefcase className="w-3 h-3 text-base-400 group-hover:text-misty transition-colors" />
                                가방 확인
                            </button>
                        </div>
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
