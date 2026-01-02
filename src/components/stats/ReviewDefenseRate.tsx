import React, { useMemo } from 'react';
import { ShieldCheck, CalendarCheck, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

const ReviewDefenseRate: React.FC = () => {
    const { studyLogs, reviewPlans } = useUserStore();

    const stats = useMemo(() => {
        const reviews = studyLogs.filter(l => l.stage > 0);
        const successReviews = reviews.filter(l => l.result === 'SUCCESS');

        const rate = reviews.length > 0 ? Math.round((successReviews.length / reviews.length) * 100) : 100;

        const now = new Date();
        const overdueCount = reviewPlans.filter(p =>
            p.status === 'ACTIVE' && p.nextReviewAt && new Date(p.nextReviewAt) < now
        ).length;

        const totalPlanned = reviewPlans.length;
        const healthyCount = totalPlanned - overdueCount;
        const healthRate = totalPlanned > 0 ? Math.round((healthyCount / totalPlanned) * 100) : 100;

        return {
            rate,
            overdueCount,
            healthRate,
            totalReviews: reviews.length
        };
    }, [studyLogs, reviewPlans]);

    return (
        <div className="glass-card p-6 border-none flex flex-col justify-between h-[460px]">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-sage-light rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-sage-dark" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">복습 방어율</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Review Defense Rate</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-10">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-base-100"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 * (1 - stats.rate / 100)}
                                strokeLinecap="round"
                                className="text-sage-dark transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-base-800">{stats.rate}%</span>
                            <span className="text-[8px] font-bold text-base-400 uppercase">Defense Rate</span>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-base-500 text-center">정규 복습 {stats.totalReviews}회 중 <span className="text-sage-dark font-black">성공률</span></p>
                </div>

                <div className="p-4 bg-base-50/50 rounded-2xl border border-white/50 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <CalendarCheck className="w-3.5 h-3.5 text-misty-dark" />
                            <span className="text-[10px] font-black text-base-500 uppercase">안전한 문제</span>
                        </div>
                        <span className="text-xs font-black text-base-800">{stats.healthRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-coral-dark" />
                            <span className="text-[10px] font-black text-base-500 uppercase">기한 경과 (Overdue)</span>
                        </div>
                        <span className="text-xs font-black text-coral-dark">{stats.overdueCount}개</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-[10px] font-bold text-base-400 leading-relaxed italic">
                    "복습 방어율이 80% 이상이면 장기 기억으로 전이될 확률이 매우 높습니다."
                </p>
            </div>
        </div>
    );
};

export default ReviewDefenseRate;
