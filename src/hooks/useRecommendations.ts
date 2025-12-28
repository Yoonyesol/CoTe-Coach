import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '../lib/recommendationEngine';
import { useUserStore } from '../store/useUserStore';

export const useRecommendations = () => {
    const { level, bojHandle, studyPlan } = useUserStore();

    return useQuery({
        queryKey: ['recommendations', level, bojHandle, studyPlan.problemCount],
        queryFn: () => getRecommendations(level, {
            handle: bojHandle,
            problemCount: studyPlan.problemCount
        }),
        staleTime: 1000 * 60 * 60, // 1시간 동안 유지
    });
};
