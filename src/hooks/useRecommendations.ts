import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '../lib/recommendationEngine';
import { useUserStore } from '../store/useUserStore';

// Get today's date string (YYYY-MM-DD) based on local timezone
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone
};

export const useRecommendations = () => {
    const { level, bojHandle, studyPlan, recommendationSettings } = useUserStore();
    const todayDate = getTodayDateString();

    const { difficulty, seedOffset, focusAlgorithms } = recommendationSettings;

    return useQuery({
        // Include today's date, seedOffset, and algorithms in queryKey
        queryKey: [
            'recommendations',
            todayDate,
            level,
            bojHandle,
            studyPlan.problemCount,
            difficulty,
            seedOffset,
            focusAlgorithms
        ],
        queryFn: async () => {
            const recommendations = await getRecommendations(level, {
                handle: bojHandle,
                problemCount: studyPlan.problemCount,
                difficultyAdjustment: difficulty,
                seedOffset: seedOffset,
                focusAlgorithms: focusAlgorithms
            });

            return recommendations;
        },
        staleTime: Infinity, // Never automatically refetch - only manual refresh
        gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
        enabled: true
    });
};
