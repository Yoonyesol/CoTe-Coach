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
import { TrendingUp } from 'lucide-react';
import { StudyLog } from '../../types/study';

interface XPChartProps {
    studyLogs: StudyLog[];
    bojRating: number;
}

const XPChart: React.FC<XPChartProps> = ({ studyLogs, bojRating }) => {
    const growthData = useMemo(() => {
        const logsSorted = [...studyLogs].sort((a, b) =>
            new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
        );

        let cumulativeXp = bojRating || 0;
        const history = logsSorted.map(log => {
            cumulativeXp += (log.ratingContribution || 0);
            return {
                date: new Date(log.completedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                xp: cumulativeXp
            };
        });

        return history.length > 20 ? history.slice(-20) : history;
    }, [studyLogs, bojRating]);

    return (
        <div className="glass-card p-6 border-none flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-lavender-light rounded-lg">
                    <TrendingUp className="w-4 h-4 text-lavender-dark" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">성장 곡선</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">XP Growth Trend</p>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="xp"
                            name="누적 경험치"
                            stroke="#818cf8"
                            strokeWidth={3}
                            dot={{ fill: '#818cf8', strokeWidth: 2, r: 4, stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default XPChart;
