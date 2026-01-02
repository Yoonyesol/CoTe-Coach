import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar
} from 'recharts';
import { Brain } from 'lucide-react';
import { StudyLog } from '../../types/study';

interface SkillRadarProps {
    studyLogs: StudyLog[];
}

const SkillRadar: React.FC<SkillRadarProps> = ({ studyLogs }) => {
    const radarData = useMemo(() => {
        const counts: Record<string, number> = {};
        studyLogs.forEach(log => {
            log.concepts.forEach(concept => {
                counts[concept] = (counts[concept] || 0) + 1;
            });
        });

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, value]) => ({ name, value }));

        while (sorted.length < 5) {
            sorted.push({ name: '준비 중', value: 0 });
        }
        return sorted;
    }, [studyLogs]);

    return (
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
    );
};

export default SkillRadar;
