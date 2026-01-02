import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import { StudyLog } from '../../types/study';

interface SuccessRateBarProps {
    studyLogs: StudyLog[];
}

const SuccessRateBar: React.FC<SuccessRateBarProps> = ({ studyLogs }) => {
    const data = useMemo(() => {
        const difficultyMap: Record<string, { success: number; fail: number }> = {};

        const categories = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'];

        studyLogs.forEach(log => {
            let cat = 'Other';
            for (const c of categories) {
                if (log.difficulty.includes(c)) {
                    cat = c;
                    break;
                }
            }
            if (log.platform === 'PROG') {
                cat = log.difficulty;
            }

            if (!difficultyMap[cat]) {
                difficultyMap[cat] = { success: 0, fail: 0 };
            }
            if (log.result === 'SUCCESS') {
                difficultyMap[cat].success++;
            } else {
                difficultyMap[cat].fail++;
            }
        });

        return Object.entries(difficultyMap)
            .map(([name, counts]) => ({
                name,
                success: counts.success,
                fail: counts.fail,
                total: counts.success + counts.fail
            }))
            .sort((a, b) => {
                const order = [...categories, 'Other'];
                const aIdx = order.findIndex(o => a.name.includes(o));
                const bIdx = order.findIndex(o => b.name.includes(o));
                return aIdx - bIdx;
            });
    }, [studyLogs]);

    return (
        <div className="glass-card p-6 border-none flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-sage-light rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">난이도별 성공률</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Difficulty Success Rate</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                        layout="vertical"
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                            width={80}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            formatter={(value) => <span className="text-xs font-bold text-base-500 uppercase">{value}</span>}
                        />
                        <Bar dataKey="success" name="Success" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="fail" name="Fail" stackId="a" fill="#f87171" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SuccessRateBar;
