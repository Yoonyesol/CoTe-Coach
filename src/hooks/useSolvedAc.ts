import { useQuery } from '@tanstack/react-query';
import { fetchSolvedAcUser, searchSolvedAcProblems } from '../api/solvedac';

export const useSolvedAcUser = (handle: string) => {
    return useQuery({
        queryKey: ['solvedAcUser', handle],
        queryFn: () => fetchSolvedAcUser(handle),
        enabled: !!handle,
    });
};

export const useSolvedAcSearch = (query: string, page: number = 1) => {
    return useQuery({
        queryKey: ['solvedAcSearch', query, page],
        queryFn: () => searchSolvedAcProblems(query, page),
        enabled: !!query,
    });
};
