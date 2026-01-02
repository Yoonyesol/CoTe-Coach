import React, { useMemo } from 'react';
import { Target, Zap, Clock } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

const LevelUpCard: React.FC = () => {
    const { level, xp, studyLogs } = useUserStore();

    const prediction = useMemo(() => {
        // Calculate next level XP (simple linear growth for now, or based on useUserStore logic)
        // In useUserStore, each level is 5 levels per major tier.
        // Let's assume 1000 XP per level for prediction if not strictly defined.
        const XP_PER_LEVEL = 1000;
        const nextLevelXp = level * XP_PER_LEVEL;
        const remainingXp = Math.max(0, nextLevelXp - xp);

        // Calculate average XP per day over last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentXp = studyLogs
            .filter(log => new Date(log.completedAt) >= sevenDaysAgo)
            .reduce((acc, log) => acc + (log.ratingContribution || 0), 0);

        const avgXpPerDay = recentXp / 7;
        const daysToLevelUp = avgXpPerDay > 0 ? Math.ceil(remainingXp / avgXpPerDay) : Infinity;

        return {
            remainingXp,
            avgXpPerDay: Math.round(avgXpPerDay),
            daysToLevelUp,
            progress: Math.min(100, Math.round((xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100))
        };
    }, [level, xp, studyLogs]);

    return (
        <div className="glass-card p-6 border-none flex flex-col justify-between h-[400px]">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-coral-light rounded-lg">
                    <Target className="w-4 h-4 text-coral-dark" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">레벨 업 예측</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Level Up Prediction</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-8">
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-base-400">현재 레벨 진행도</span>
                        <span className="text-sm font-black text-misty-dark">{prediction.progress}%</span>
                    </div>
                    <div className="h-3 bg-base-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-misty to-misty-dark transition-all duration-1000 shadow-[0_0_12px_rgba(100,116,139,0.3)]"
                            style={{ width: `${prediction.progress}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-50/50 p-4 rounded-2xl border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3 h-3 text-wheat-dark" />
                            <span className="text-[10px] font-bold text-base-400 uppercase">일평균 XP</span>
                        </div>
                        <p className="text-lg font-black text-base-800">{prediction.avgXpPerDay} <span className="text-xs text-base-400 font-bold ml-1">XP</span></p>
                    </div>
                    <div className="bg-base-50/50 p-4 rounded-2xl border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-lavender-dark" />
                            <span className="text-[10px] font-bold text-base-400 uppercase">예상 남은 기간</span>
                        </div>
                        <p className="text-lg font-black text-base-800">
                            {prediction.daysToLevelUp === Infinity ? '측정 불가' : `${prediction.daysToLevelUp}일`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-misty-light/20 rounded-2xl border border-misty-light/30">
                <p className="text-xs font-bold text-misty-dark leading-relaxed">
                    {prediction.daysToLevelUp === Infinity
                        ? "최근 학습 기록이 없어요. 다시 시작해볼까요? 🔥"
                        : `현재 페이스를 유지하면 ${prediction.daysToLevelUp}일 후에 Level ${level + 1}이 됩니다!`}
                </p>
            </div>
        </div>
    );
};

export default LevelUpCard;
