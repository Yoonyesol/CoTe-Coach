import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from 'recharts';
import { Layers } from 'lucide-react';
import { StudyLog } from '../../types/study';

interface PlatformDonutProps {
    studyLogs: StudyLog[];
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const PlatformDonut: React.FC<PlatformDonutProps> = ({ studyLogs }) => {
    const data = useMemo(() => {
        const counts: Record<string, number> = {};
        studyLogs.forEach(log => {
            counts[log.platform] = (counts[log.platform] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [studyLogs]);

    return (
        <div className="glass-card p-6 border-none flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-lavender-light rounded-lg">
                    <Layers className="w-4 h-4 text-lavender-dark" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">플랫폼 분포</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Platform Distribution</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-xs font-bold text-base-500">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PlatformDonut;
