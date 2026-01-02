import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell
} from 'recharts';
import { BrainCircuit } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

const STAGE_LABELS = ['단기', '1단계', '2단계', '3단계', '4단계', '마스터'];
const COLORS = ['#cbd5e1', '#94a3b8', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];

const MaturityChart: React.FC = () => {
    const { reviewPlans } = useUserStore();

    const data = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0]; // Stage 0 to 5+

        reviewPlans.forEach(plan => {
            const stage = Math.min(plan.currentStage, 5);
            counts[stage]++;
        });

        return counts.map((count, i) => ({
            name: STAGE_LABELS[i],
            count
        }));
    }, [reviewPlans]);

    return (
        <div className="glass-card p-6 border-none flex flex-col h-[460px]">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-coral-light rounded-lg">
                    <BrainCircuit className="w-4 h-4 text-coral-dark" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-base-800 font-sans">복습 숙성도 분포</h3>
                    <p className="text-[10px] font-bold text-base-400 font-sans uppercase tracking-tight">Review Maturity Stages</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
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
                            cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-base-400 uppercase">
                {STAGE_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MaturityChart;
