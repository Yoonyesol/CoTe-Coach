import React from 'react';
import { useUserStore } from '../store/useUserStore';
import XPChart from './stats/XPChart';
import SkillRadar from './stats/SkillRadar';
import ActivityBar from './stats/ActivityBar';
import LearningHeatmap from './stats/LearningHeatmap';

const StatsDashboard: React.FC = () => {
    const { studyLogs, bojRating } = useUserStore();

    return (
        <div className="flex flex-col gap-6">
            <LearningHeatmap studyLogs={studyLogs} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <XPChart studyLogs={studyLogs} bojRating={bojRating} />
                <SkillRadar studyLogs={studyLogs} />
                <ActivityBar studyLogs={studyLogs} />

                {/* Coming soon: More charts will be added here */}
            </div>
        </div>
    );
};

export default StatsDashboard;
