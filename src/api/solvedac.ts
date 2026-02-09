import axios from 'axios';

const SOLVED_AC_API = 'https://solved.ac/api/v3';
// Create a dedicated axios instance for Solved.ac
const solvedAcApi = axios.create({
  baseURL: import.meta.env.DEV ? '/api/v3' : SOLVED_AC_API
});

// Add interceptor ONLY for production to use CORS proxy
if (import.meta.env.PROD) {
  solvedAcApi.interceptors.request.use((config) => {
    // 1. Get the full URL including parameters
    const fullUrl = axios.getUri(config);

    // 2. Clear original parameters and base so axios doesn't append them again
    config.params = {};
    config.baseURL = undefined;

    // 3. Set the final proxy URL
    // Use corsproxy.io as the prefix
    config.url = `https://corsproxy.io/?url=${encodeURIComponent(fullUrl)}`;

    return config;
  });
}

import { SolvedAcUser } from '../types/user';
import { SolvedAcProblem } from '../types/problem';

/**
 * 사용자 정보 가져오기
 */
export const fetchSolvedAcUser = async (handle: string): Promise<SolvedAcUser> => {
  const { data } = await solvedAcApi.get('/user/show', {
    params: { handle }
  });
  return data;
};

/**
 * 문제 검색 (쿼리 기반)
 */
export const searchSolvedAcProblems = async (query: string, page: number = 1): Promise<{ count: number; items: SolvedAcProblem[] }> => {
  const { data } = await solvedAcApi.get('/search/problem', {
    params: {
      query,
      page,
      _t: Date.now() // Cache busting parameter
    }
  });
  return data;
};
