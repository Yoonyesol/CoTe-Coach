import axios from 'axios';

const SOLVED_AC_API = 'https://solved.ac/api/v3';
// Create a dedicated axios instance for Solved.ac
const solvedAcApi = axios.create({
  baseURL: import.meta.env.DEV ? '/api/v3' : SOLVED_AC_API
});

// Add interceptor ONLY for production to use CORS proxy
if (import.meta.env.PROD) {
  solvedAcApi.interceptors.request.use((config) => {
    const fullUrl = axios.getUri(config);

    // Clear original config so it doesn't conflict with proxy
    config.params = {};
    config.baseURL = undefined;

    // Format for corsproxy.io: https://corsproxy.io/?<encoded_url>
    // Note: Some environments prefer the "?" prefix directly followed by the url
    config.url = `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;

    return config;
  }, (error) => {
    console.error('[Solved.ac API] Request Interceptor Error:', error);
    return Promise.reject(error);
  });

  solvedAcApi.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('[Solved.ac API] Fetch Failed:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
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
