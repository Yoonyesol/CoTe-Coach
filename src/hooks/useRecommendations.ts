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

// Load recommendations from localStorage if they exist and are from today
const loadCachedRecommendations = (): RecommendedProblem[] | undefined => {
    const storedDate = localStorage.getItem(RECOMMENDATIONS_DATE_KEY);
    const todayDate = getTodayDateString();

    // Only use cache if it's from today
    if (storedDate === todayDate) {
        const storedData = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
        if (storedData) {
            try {
                return JSON.parse(storedData);
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
const saveRecommendations = (data: RecommendedProblem[]) => {
    const todayDate = getTodayDateString();
    localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(RECOMMENDATIONS_DATE_KEY, todayDate);
};

export const useRecommendations = () => {
    const { level, bojHandle, studyPlan } = useUserStore();
    const todayDate = getTodayDateString();

    // Load initial data from localStorage
    const cachedData = loadCachedRecommendations();

    return useQuery({
        // Include today's date in queryKey to ensure recommendations are unique per day
        queryKey: ['recommendations', todayDate, level, bojHandle, studyPlan.problemCount],
        queryFn: async () => {
            const recommendations = await getRecommendations(level, {
                handle: bojHandle,
                problemCount: studyPlan.problemCount
            });

            // Save to localStorage after successful fetch
            saveRecommendations(recommendations);

            return recommendations;
        },
        initialData: cachedData, // Use cached data as initial data
        staleTime: Infinity, // Never automatically refetch - only manual refresh
        gcTime: 1000 * 60 * 60 * 24, // Keep in memory for 24 hours
    });
};
