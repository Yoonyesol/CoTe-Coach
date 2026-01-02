import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import { Activity } from 'lucide-react';
import { StudyLog } from '../../types/study';
import { getLocalDateString } from '../../lib/dateUtils';

interface ActivityBarProps {
    studyLogs: StudyLog[];
}

const ActivityBar: React.FC<ActivityBarProps> = ({ studyLogs }) => {
    const barData = useMemo(() => {
        const result = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(d);
            const label = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

            const dayLogs = studyLogs.filter(log => {
                const logDate = new Date(log.completedAt);
                return getLocalDateString(logDate) === dateStr && (log.stage === 0 || !log.stage);
            });
            result.push({
                date: label,
                solved: dayLogs.length,
                time: Math.round(dayLogs.reduce((acc, log) => acc + log.elapsedTime, 0) / 1000 / 60),
            });
        }
        return result;
    }, [studyLogs]);

    return (
        <div className="glass-card p-6 border-none flex flex-col h-[400px]">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-sage-light rounded-lg">
                        <Activity className="w-4 h-4 text-sage-dark" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-base-800 font-sans">주간 활동 추이</h3>
                        <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Recent Activity</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        <Bar
                            dataKey="solved"
                            fill="#818cf8"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityBar;
