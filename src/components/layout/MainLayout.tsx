import React from 'react';
import { useUserStore } from '../../store/useUserStore';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tier, level, xp, points } = useUserStore();
    const progress = xp % 100;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-base-100 overflow-hidden font-sans">
            <aside className="w-full md:w-[400px] lg:w-[500px] h-[400px] md:h-screen bg-sage-light/50 border-r border-base-200 relative overflow-hidden flex flex-col">
                <div className="p-6 flex justify-between items-center z-10">
                    <span className="text-2xl font-black bg-gradient-to-br from-misty-dark to-lavender-dark bg-clip-text text-transparent">CoTe Coach</span>
                    <div className="glass-card px-3 py-1 text-sm font-bold text-wheat-dark">💰 {points.toLocaleString()}G</div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="text-8xl mb-4 animate-bounce-soft">🐧</div>
                    <p className="text-lg font-bold text-base-800">코딩 초보 펭군</p>
                    <div className="w-48 h-3 bg-base-200 rounded-full mt-2 overflow-hidden border border-white">
                        <div
                            className="h-full bg-misty transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs mt-1 text-base-500 font-bold">Lv. {level} ({progress}%)</p>
                    <p className="text-sm font-black text-misty-dark mt-1">{tier}</p>
                </div>
                <div className="p-6 grid grid-cols-3 gap-2 z-10">
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm">상점</button>
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm">가져오기</button>
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm">랭킹</button>
                </div>
            </aside>
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-8 bg-white/30 backdrop-blur-sm">{children}</main>
        </div>
    );
};

export default MainLayout;
