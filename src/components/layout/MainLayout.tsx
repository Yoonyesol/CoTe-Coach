import React, { useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSolvedAcUser } from '../../hooks/useSolvedAc';

import { LayoutDashboard, BarChart3, ShoppingBag, Trophy, Settings, LogOut, Link as LinkIcon, Briefcase, BookOpen, Library } from 'lucide-react';
import TierBadge from '../common/TierBadge';
import BojTierBadge from '../common/BojTierBadge';
import { clsx } from 'clsx';
import { SidebarSkeleton } from '../common/Skeleton';
import { resolveSkin, getBackgroundItems, getEffectItems } from '../avatar/AvatarAssets';
import { AvatarAsset } from '../../types/avatar';


export interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: 'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY' | 'SETTINGS';
    onTabChange: (tab: 'HOME' | 'STATS' | 'JOURNAL' | 'LIBRARY' | 'SETTINGS') => void;
    onAccountSettingsOpen: () => void;
    onTierClick?: () => void;
    isLoading?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange, onAccountSettingsOpen, onTierClick, isLoading }) => {
    const level = useUserStore((state) => state.level);
    const xp = useUserStore((state) => state.xp);
    const tier = useUserStore((state) => state.tier);
    const points = useUserStore((state) => state.points);
    const equippedItems = useUserStore((state) => state.equippedItems);
    const bojHandle = useUserStore((state) => state.bojHandle);

    const { signOut } = useAuthStore();
    const { showConfirm, showAlert, openShop } = useModalStore();

    const progress = xp % 100;

    const { data: solvedAcData } = useSolvedAcUser(bojHandle);
    const syncSolvedAcTier = useUserStore((state) => state.syncSolvedAcTier);

    // Auto-sync BOJ rating whenever data refreshed
    useEffect(() => {
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
        <div className="min-h-screen flex flex-col md:flex-row bg-base-100 overflow-x-hidden font-sans">
            {/* 1. Mobile Top Navigation Bar (Visible only on mobile) */}
            <nav className="md:hidden sticky top-0 bg-base-900 z-[100] px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1">
                        <img src={`${import.meta.env.BASE_URL}assets/nav_logo.png`} alt="CoTe Coach" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-white font-black text-lg tracking-tighter">CoTe Coach</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => openShop()}
                        className="p-2 text-white/60 hover:text-wheat"
                    >
                        <ShoppingBag className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => onTabChange('SETTINGS')}
                        className={clsx("p-2 rounded-xl transition-all", activeTab === 'SETTINGS' ? "text-white" : "text-white/60")}
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
                        className="p-2 text-white/60"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* 1.5 Mobile Bottom Tab Bar (Optional - User requested TOP, but icons need placement) */}
            {/* Let's put the main nav icons in the top bar or a separate sub-bar if needed. 
                For now, we'll keep the core navigation items in a simplified header or below the character. */}

            {/* 1. Navigation Rail (Desktop Only) */}
            <nav className="hidden md:flex w-20 bg-base-900 flex-col items-center py-8 gap-6 z-30 shrink-0 h-screen sticky top-0">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm overflow-hidden p-1">
                    <img src={`${import.meta.env.BASE_URL}assets/nav_logo.png`} alt="CoTe Coach" className="w-full h-full object-contain" />
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
                        onClick={() => openShop()}
                        className="p-3 rounded-2xl text-white/40 hover:text-wheat hover:bg-white/5 transition-all outline-none cursor-pointer"
                        title="상점"
                    >
                        <ShoppingBag className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => showAlert('오픈 준비 중', '랭킹 시스템은 현재 준비 중입니다. 조금만 기다려주세요! 🏆')}
                        className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all outline-none cursor-pointer"
                        title="랭킹"
                    >
                        <Trophy className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => onTabChange('SETTINGS')}
                        className={clsx(
                            "p-3 rounded-2xl transition-all outline-none cursor-pointer",
                            activeTab === 'SETTINGS'
                                ? "bg-white text-base-900 shadow-lg shadow-white/10"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
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

            {/* Mobile Sub-Navigation (Icons that were in the rail) */}
            <div className="md:hidden bg-white border-b border-base-100 px-4 py-2 flex justify-around items-center z-20 sticky top-[64px]">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                            activeTab === item.id ? "text-base-900 bg-base-50" : "text-base-300"
                        )}
                    >
                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Character Sidebar (Responsive height/width) */}
            <aside className="w-full md:w-[320px] lg:w-[360px] h-auto md:h-screen bg-sage-light/50 border-r border-base-200 relative overflow-hidden flex flex-col z-20 shrink-0">
                {isLoading ? (
                    <SidebarSkeleton />
                ) : (
                    <div className="p-6 md:p-8 flex flex-col h-full">
                        <div className="hidden md:flex justify-center">
                            <img src={`${import.meta.env.BASE_URL}assets/logo-row.png`} alt="CoTe Coach" className="h-16 object-contain drop-shadow-sm" />
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center relative py-4 md:py-0">
                            {/* Character Container with Layers */}
                            <div className="relative mb-6 md:mb-8 flex items-center justify-center w-48 h-48 md:w-64 md:h-64 isolate">
                                {getBackgroundItems(equippedItems).map((asset: AvatarAsset) => {
                                    let positionClass = "absolute z-0";
                                    if (asset.id === 'item_sofa') positionClass = "absolute -bottom-8 md:-bottom-11 w-[360px] md:w-[720px] h-[200px] md:h-[400px] z-[5]";
                                    if (asset.id === 'item_monitor') positionClass = "absolute right-6 md:right-12 top-1/2 w-20 md:w-28 h-16 md:h-24 z-10 translate-y-[-20%] scale-x-[-1]";
                                    if (asset.id === 'item_treasure') positionClass = "absolute left-4 md:left-6 bottom-16 md:bottom-20 w-16 md:w-24 h-12 md:h-20 z-10";
                                    if (asset.id === 'item_safe') positionClass = "absolute right-4 md:right-6 bottom-16 md:bottom-20 w-14 md:w-20 h-20 md:h-28 z-10";
                                    if (asset.slot === 'wallpaper') positionClass = "absolute inset-0 z-[-1]";

                                    if (asset.svgIcon) {
                                        const SvgComponent = asset.svgIcon;
                                        return (
                                            <div key={asset.id} className={positionClass}>
                                                <SvgComponent />
                                            </div>
                                        );
                                    }

                                    if (asset.iconPath) {
                                        return (
                                            <div key={asset.id} className={positionClass}>
                                                <img src={asset.iconPath} alt={asset.name} className="w-full h-full object-contain" />
                                            </div>
                                        );
                                    }

                                    return null;
                                })}

                                {getEffectItems(equippedItems).map((asset: AvatarAsset) => {
                                    const SvgComponent = asset.svgIcon;
                                    if (!SvgComponent) return null;

                                    const isBehind = ['item_aura', 'item_halo'].includes(asset.id);
                                    return (
                                        <div key={asset.id} className={clsx("absolute inset-0 pointer-events-none", isBehind ? "z-[2]" : "z-20")}>
                                            <SvgComponent />
                                        </div>
                                    );
                                })}

                                <img
                                    src={resolveSkin(equippedItems)}
                                    alt="Penguin Avatar"
                                    className="w-56 h-56 object-contain animate-bounce-soft relative z-10 drop-shadow-2xl"
                                />
                            </div>

                            <div className="w-full space-y-6">
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-black text-misty-dark uppercase tracking-[0.2em] opacity-60">Your Identity</p>
                                    <p className="text-2xl font-black text-base-900 font-sans tracking-tight">
                                        {
                                            level >= 42 ? '전설의' :
                                                level >= 41 ? '초월적인' :
                                                    level >= 39 ? '알고리즘 마스터' :
                                                        level >= 36 ? '코딩 챔피언' :
                                                            level >= 29 ? '코딩 전문가' :
                                                                level >= 19 ? '코딩 해결사' :
                                                                    level >= 9 ? '코딩 유망주' :
                                                                        level >= 4 ? '코딩 새싹' : '코딩 입문자'
                                        } <span className="text-misty-dark">펭군</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div onClick={onTierClick} className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm hover:bg-white/60 transition-all cursor-pointer group">
                                        <p className="text-[9px] font-black text-base-400 uppercase tracking-widest mb-2">Current Tier</p>
                                        <div className="flex items-center gap-2">
                                            <TierBadge tier={tier} size="sm" />
                                            <span className="text-sm font-black text-base-800 group-hover:text-misty-dark transition-colors">{tier}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm hover:bg-white/60 transition-all cursor-pointer group">
                                        <p className="text-[9px] font-black text-base-400 uppercase tracking-widest mb-2">Total Gold</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base">💰</span>
                                            <span className="text-sm font-black text-base-800 group-hover:text-wheat-dark transition-colors">{points.toLocaleString()}G</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 px-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-base-400 uppercase tracking-tighter">Level {level}</span>
                                        <span className="text-[10px] font-black text-misty-dark">{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden border border-white/20">
                                        <div
                                            className="h-full bg-gradient-to-r from-misty to-lavender-dark transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
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
                                <button
                                    onClick={() => openShop('INVENTORY')}
                                    className="game-button bg-white text-base-800 text-[10px] shadow-sm font-black border-none ring-1 ring-base-100 hover:bg-base-50 transition-colors cursor-pointer flex items-center gap-2 group px-6"
                                >
                                    <Briefcase className="w-3 h-3 text-base-400 group-hover:text-misty transition-colors" />
                                    가방 확인
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </aside>

            {/* 3. Main Content */}
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-white/30 backdrop-blur-sm z-10 scrollbar-hide pb-20 md:pb-8">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
