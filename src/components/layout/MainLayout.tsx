import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-base-100 overflow-hidden font-sans">
            {/* Left Column: Character Home Space (Game feel) */}
            <aside className="w-full md:w-[400px] lg:w-[500px] h-[400px] md:h-screen bg-sage-light/50 border-r border-base-200 relative overflow-hidden flex flex-col">
                <div className="p-6 flex justify-between items-center z-10">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-black bg-gradient-to-br from-misty-dark to-lavender-dark bg-clip-text text-transparent">
                            CoTe Coach
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 glass-card px-3 py-1 text-sm font-bold">
                        <span className="text-wheat-dark">💰 1,200G</span>
                    </div>
                </div>

                {/* Placeholder for Character / Room */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="w-64 h-64 bg-white/40 rounded-full blur-3xl absolute opacity-50 ring-4 ring-white animate-pulse" />
                    <div className="z-10 text-center">
                        <div className="text-8xl mb-4 animate-bounce-soft">🐧</div>
                        <p className="text-lg font-bold text-base-800">코딩 초보 펭군</p>
                        <div className="w-48 h-3 bg-base-200 rounded-full mt-2 overflow-hidden border border-white">
                            <div className="w-3/4 h-full bg-misty animate-pulse" />
                        </div>
                        <p className="text-xs mt-1 text-base-500 font-bold">Lv. 12 (75%)</p>
                    </div>
                </div>

                {/* Bottom Menu for Character */}
                <div className="p-6 grid grid-cols-3 gap-2 z-10">
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm">상점</button>
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm">인벤토리</button>
                    <button className="game-button bg-white text-base-700 text-xs shadow-sm">랭킹</button>
                </div>
            </aside>

            {/* Right Column: Dashboard & Main Content */}
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-8 bg-white/30 backdrop-blur-sm">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
