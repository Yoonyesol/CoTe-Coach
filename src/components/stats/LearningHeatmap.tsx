import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { StudyLog } from '../../types/study';
import { getLocalDateString } from '../../lib/dateUtils';

interface LearningHeatmapProps {
    studyLogs: StudyLog[];
}

const LearningHeatmap: React.FC<LearningHeatmapProps> = ({ studyLogs }) => {
    // Generate last 13 weeks of data to fit without overflow
    const { weeks, stats, monthLabels } = useMemo(() => {
        const result = [];
        const today = new Date();
        let totalSolved = 0;
        let maxStreak = 0;
        const allDays: { date: string, count: number }[] = [];

        // Align to the end of the current week (Saturday = 6)
        const endOfGrid = new Date(today);
        endOfGrid.setDate(today.getDate() + (6 - today.getDay()));

        // Start 13 weeks ago from the beginning of this week
        const startDate = new Date(endOfGrid);
        startDate.setDate(endOfGrid.getDate() - (13 * 7 - 1));

        const labels: { index: number, label: string }[] = [];
        let lastMonth = -1;

        for (let w = 0; w < 13; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const current = new Date(startDate);
                current.setDate(startDate.getDate() + w * 7 + d);
                const dateStr = getLocalDateString(current);

                // Month Labeling
                if (d === 0) {
                    const month = current.getMonth();
                    if (month !== lastMonth) {
                        labels.push({ index: w, label: (month + 1) + '월' });
                        lastMonth = month;
                    }
                }

                // Only count logs if the date is not in the future
                let count = 0;
                if (current <= today) {
                    count = studyLogs.filter(log => {
                        const logDate = new Date(log.completedAt);
                        return getLocalDateString(logDate) === dateStr;
                    }).length;
                    totalSolved += count;
                    allDays.push({ date: dateStr, count });
                }
                week.push({ date: dateStr, count, isFuture: current > today });
            }
            result.push(week);
        }

        // Calculate Max Streak within this period
        let tempStreak = 0;
        allDays.forEach(day => {
            if (day.count > 0) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        });

        return { weeks: result, stats: { totalSolved, maxStreak }, monthLabels: labels };
    }, [studyLogs]);

    const getColor = (count: number, isFuture: boolean) => {
        if (isFuture) return 'bg-slate-200/40'; // More visible than before but still "empty" and "future"
        if (count === 0) return 'bg-slate-200'; // Much darker for visibility
        if (count === 1) return 'bg-misty-light';
        if (count === 2) return 'bg-misty';
        if (count >= 3) return 'bg-misty-dark';
        return 'bg-slate-200';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-none overflow-hidden h-full flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">학습 스트라이크 가든</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Activity Heatmap</p>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-bold text-base-400">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-200 rounded-[2px]" />
                        <span>0</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-misty-light rounded-[2px]" />
                        <span>1</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-misty rounded-[2px]" />
                        <span>2</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-misty-dark rounded-[2px]" />
                        <span>3+</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-1.5 justify-between mb-2 h-4 px-0.5">
                {weeks.map((_, wi) => {
                    const monthLabel = monthLabels.find(l => l.index === wi);
                    return (
                        <div key={wi} className="w-3.5 shrink-0 flex justify-center">
                            {monthLabel && (
                                <span className="text-[9px] font-black text-base-300 whitespace-nowrap">
                                    {monthLabel.label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-1.5 justify-between pb-2">
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1.5 shrink-0">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                title={`${day.date}: ${day.count} items`}
                                className={clsx(
                                    "w-3.5 h-3.5 rounded-[3px] transition-all duration-500 hover:ring-2 hover:ring-misty/30",
                                    getColor(day.count, !!day.isFuture)
                                )}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Summary Statistics Footer */}
            <div className="mt-auto pt-6 flex justify-between items-center border-t border-base-100/50">
                <div className="flex gap-8">
                    <div>
                        <p className="text-[10px] font-bold text-base-300 uppercase tracking-tight mb-1">Total Solved</p>
                        <p className="text-lg font-black text-base-800 leading-none">{stats.totalSolved}<span className="text-[10px] ml-1 text-base-400">문항</span></p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-base-300 uppercase tracking-tight mb-1">Max Strike</p>
                        <p className="text-lg font-black text-misty-dark leading-none">{stats.maxStreak}<span className="text-[10px] ml-1 text-base-400">일</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-base-300 uppercase tracking-tight mb-1">Current Period</p>
                    <p className="text-xs font-black text-base-500">최근 13주 기록</p>
                </div>
            </div>
        </motion.div>
    );
};

export default LearningHeatmap;
