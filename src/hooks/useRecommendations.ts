import { useQuery } from '@tanstack/react-query';
import { getRecommendations, RecommendedProblem } from '../lib/recommendationEngine';
import { useUserStore } from '../store/useUserStore';

// Get today's date string (YYYY-MM-DD) based on local timezone
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone
};

// localStorage keys
const RECOMMENDATIONS_STORAGE_KEY = 'daily_recommendations';
const RECOMMENDATIONS_DATE_KEY = 'daily_recommendations_date';

// Load recommendations from localStorage if they exist, are from today, and match level
const loadCachedRecommendations = (currentLevel: number): RecommendedProblem[] | undefined => {
    const storedDate = localStorage.getItem(RECOMMENDATIONS_DATE_KEY);
    const todayDate = getTodayDateString();

    // Only use cache if it's from today
    if (storedDate === todayDate) {
        const storedData = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                // NEW: Also check if the cached data level matches current level
                // We'll store level in the cache object for validation
                if (parsed.level === currentLevel) {
                    return parsed.items;
                }
            } catch (e) {
                console.error('Failed to parse cached recommendations:', e);
                return undefined;
            }
        }
    }

    // Clear old cache if it's from a different day
    if (storedDate && storedDate !== todayDate) {
        localStorage.removeItem(RECOMMENDATIONS_STORAGE_KEY);
        localStorage.removeItem(RECOMMENDATIONS_DATE_KEY);
    }

    return undefined;
};

// Save recommendations to localStorage
const saveRecommendations = (data: RecommendedProblem[], level: number) => {
    const todayDate = getTodayDateString();
    localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify({
        items: data,
        level: level
    }));
    localStorage.setItem(RECOMMENDATIONS_DATE_KEY, todayDate);
};

export const useRecommendations = () => {
    const { level, bojHandle, studyPlan } = useUserStore();
    const todayDate = getTodayDateString();

    // Load initial data from localStorage
    const cachedData = loadCachedRecommendations(level);

    return useQuery({
        // Include today's date in queryKey to ensure recommendations are unique per day
        queryKey: ['recommendations', todayDate, level, bojHandle, studyPlan.problemCount],
        queryFn: async () => {
            const recommendations = await getRecommendations(level, {
                handle: bojHandle,
                problemCount: studyPlan.problemCount
            });

            // Save to localStorage after successful fetch
            saveRecommendations(recommendations, level);

            return recommendations;
        },
        initialData: cachedData, // Use cached data as initial data
        staleTime: Infinity, // Never automatically refetch - only manual refresh
        gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
    });
};
