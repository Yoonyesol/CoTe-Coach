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
    const { level, bojHandle, recommendationSettings, getDailyProgress } = useUserStore();
    const todayDate = getTodayDateString();
    const { goal } = getDailyProgress();

    const { difficulty, seedOffset, focusAlgorithms, platforms } = recommendationSettings;

    return useQuery({
        // Include today's date, seedOffset, and algorithms in queryKey
        queryKey: [
            'recommendations',
            todayDate,
            level,
            bojHandle,
            difficulty,
            seedOffset,
            focusAlgorithms,
            platforms,
            goal
        ],
        queryFn: async () => {
            const recommendations = await getRecommendations(level, {
                handle: bojHandle,
                problemCount: recommendationSettings.recommendationCount,
                difficultyAdjustment: difficulty,
                seedOffset: seedOffset,
                focusAlgorithms: focusAlgorithms,
                platforms: platforms
            });

            return recommendations;
        },
        staleTime: Infinity, // Never automatically refetch - only manual refresh
        gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
        enabled: true
    });
};
