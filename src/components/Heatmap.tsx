import React, { useMemo } from 'react';
import { useUserStore } from '../store/useUserStore';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const Heatmap: React.FC = () => {
    const { studyLogs } = useUserStore();

    // Generate last 12 weeks of data
    const weeks = useMemo(() => {
        const result = [];
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 12 * 7); // 12 weeks back

        for (let w = 0; w < 12; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const current = new Date(startDate);
                current.setDate(startDate.getDate() + w * 7 + d);
                const dateStr = current.toISOString().split('T')[0];

                const count = studyLogs.filter(log => log.completedAt.startsWith(dateStr)).length;
                week.push({ date: dateStr, count });
            }
            result.push(week);
        }
        return result;
    }, [studyLogs]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-base-50';
        if (count === 1) return 'bg-misty-light';
        if (count === 2) return 'bg-misty';
        if (count >= 3) return 'bg-misty-dark';
        return 'bg-base-50';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-none overflow-hidden"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">학습 스트라이크 가든</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Activity Heatmap</p>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-base-400 uppercase">
                    <span>Less</span>
                    <div className="w-2 h-2 bg-base-50 rounded-[2px]" />
                    <div className="w-2 h-2 bg-misty-light rounded-[2px]" />
                    <div className="w-2 h-2 bg-misty rounded-[2px]" />
                    <div className="w-2 h-2 bg-misty-dark rounded-[2px]" />
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1.5 shrink-0">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                title={`${day.date}: ${day.count} items`}
                                className={clsx(
                                    "w-3.5 h-3.5 rounded-[3px] transition-all duration-500 hover:ring-2 hover:ring-misty/30",
                                    getColor(day.count)
                                )}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default Heatmap;
