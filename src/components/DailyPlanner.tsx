import React from 'react';
import { Target, CheckCircle2, Circle, Calendar, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

import { DailyPlannerProps } from '../types/components';

const DailyPlanner: React.FC<DailyPlannerProps> = ({ solvedCount, goalCount, daysRemaining, streak }) => {
    const percentage = Math.round((solvedCount / goalCount) * 100);

    return (
        <div className="glass-card p-8 border-none bg-gradient-to-br from-white/80 to-misty-light/30 shadow-xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-misty/10 rounded-full blur-3xl group-hover:bg-misty/20 transition-colors duration-500" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">

                {/* Circular Progress Section */}
                <div className="relative w-32 h-32 shrink-0">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-base-100"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 - (364.4 * Math.min(percentage, 100)) / 100}
                            strokeLinecap="round"
                            className="text-misty-dark transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-base-900 leading-none">{percentage}%</span>
                        <span className="text-[10px] font-bold text-base-400 uppercase mt-1">완료</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-base-900 flex items-center justify-center lg:justify-start gap-2 font-sans">
                            <Target className="w-5 h-5 text-misty-dark" />
                            오늘의 정복 계획
                        </h2>
                        <p className="text-sm font-bold text-base-500 font-sans">
                            목표 {goalCount}문제 중 {solvedCount}문제를 해결했습니다.
                            {percentage >= 100 ? ' 오늘 목표 달성! 대단해요! 🏆' : ' 조금만 더 힘내면 캐릭터가 선물을 줄지도 몰라요! 🎁'}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-xl border border-white shadow-sm font-sans">
                            <Calendar className="w-4 h-4 text-base-400" />
                            <span className="text-xs font-black text-base-600 uppercase">
                                {daysRemaining > 0 ? '목표 기한까지' : '새로운 목표가 필요해요'}
                            </span>
                            <span className="text-sm font-black text-misty-dark">
                                {daysRemaining > 0 ? `D-${daysRemaining}` : 'D-DAY'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-xl border border-white shadow-sm font-sans">
                            <Trophy className="w-4 h-4 text-base-400" />
                            <span className="text-xs font-black text-base-600 uppercase">연속 달성</span>
                            <span className="text-sm font-black text-sage-dark">{streak}일째</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Progress Dots */}
            <div className="mt-8 pt-6 border-t border-base-100 flex justify-center lg:justify-start gap-2">
                {Array.from({ length: goalCount }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        {i < solvedCount ? (
                            <CheckCircle2 className="w-6 h-6 text-sage animate-in zoom-in duration-300" />
                        ) : (
                            <Circle className="w-6 h-6 text-base-100" />
                        )}
                        <span className={clsx(
                            "text-[9px] font-black uppercase tracking-tighter",
                            i < solvedCount ? "text-sage-dark" : "text-base-300"
                        )}>STEP 0{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyPlanner;
