import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import { useUserStore } from '../store/useUserStore';
import { Brain, Activity } from 'lucide-react';
import { getLocalDateString } from '../lib/dateUtils';

const StatsDashboard: React.FC = () => {
    const { studyLogs } = useUserStore();

    // Radar Chart Data: Concepts Aggregation
    const radarData = useMemo(() => {
        const counts: Record<string, number> = {};
        studyLogs.forEach(log => {
            log.concepts.forEach(concept => {
                counts[concept] = (counts[concept] || 0) + 1;
            });
        });

        // Top 6 concepts or default placeholders
        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, value]) => ({ name, value }));

        // Fill with empty if less than 3 for design
        while (sorted.length < 5) {
            sorted.push({ name: '준비 중', value: 0 });
        }
        return sorted;
    }, [studyLogs]);

    // Bar Chart Data: Last 7 Days Activity
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
                time: Math.round(dayLogs.reduce((acc, log) => acc + log.elapsedTime, 0) / 1000 / 60), // in minutes
            });
        }
        return result;
    }, [studyLogs]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Type Analysis: Radar Chart */}
            <div className="glass-card p-6 border-none flex flex-col h-[400px]">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-misty-light rounded-lg">
                        <Brain className="w-4 h-4 text-misty-dark" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-base-800 font-sans">유형별 능력치</h3>
                        <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Skill Analysis</p>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis
                                dataKey="name"
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                            />
                            <Radar
                                name="Solved"
                                dataKey="value"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Trend: Bar Chart */}
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
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-misty-dark rounded-sm" />
                            <span className="text-[10px] font-black text-base-500 font-sans">문제 수</span>
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
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                    padding: '12px'
                                }}
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

        </div>
    );
};

export default StatsDashboard;
