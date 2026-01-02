import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import { Timer } from 'lucide-react';
import { StudyLog } from '../../types/study';
import { getLocalDateString } from '../../lib/dateUtils';

interface SolvingTimeChartProps {
    studyLogs: StudyLog[];
}

const SolvingTimeChart: React.FC<SolvingTimeChartProps> = ({ studyLogs }) => {
    const data = useMemo(() => {
        const dailyTimes: Record<string, { total: number; count: number; label: string }> = {};

        // Sort logs by date
        const sortedLogs = [...studyLogs]
            .filter(l => l.elapsedTime > 0)
            .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

        sortedLogs.forEach(log => {
            const date = getLocalDateString(new Date(log.completedAt));
            const label = new Date(log.completedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

            if (!dailyTimes[date]) {
                dailyTimes[date] = { total: 0, count: 0, label };
            }
            dailyTimes[date].total += log.elapsedTime;
            dailyTimes[date].count += 1;
        });

        const result = Object.entries(dailyTimes)
            .map(([date, stats]) => ({
                date,
                label: stats.label,
                avgTime: Math.round(stats.total / stats.count / 1000 / 60) // in minutes
            }))
            .slice(-15); // Show last 15 days of activity

        return result;
    }, [studyLogs]);

    return (
        <div className="glass-card p-6 border-none flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-misty-light rounded-lg">
                    <Timer className="w-4 h-4 text-misty-dark" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">평균 풀이 시간 추이</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Avg Solving Time Trend</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            unit="m"
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                            formatter={(value) => [`${value}분`, '평균 시간']}
                        />
                        <Line
                            type="monotone"
                            dataKey="avgTime"
                            name="평균 시간"
                            stroke="#fb7185"
                            strokeWidth={3}
                            dot={{ fill: '#fb7185', strokeWidth: 2, r: 4, stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SolvingTimeChart;
