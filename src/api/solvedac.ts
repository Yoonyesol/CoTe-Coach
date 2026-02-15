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

    // Switch to allorigins.win/raw which is often more reliable for 403/Forbidden issues
    // Format: https://api.allorigins.win/raw?url=<encoded_url>
    config.url = `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`;

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
  console.log('[Solved.ac] fetchSolvedAcUser 호출:', { handle, env: import.meta.env.MODE });
  try {
    const { data } = await solvedAcApi.get('/user/show', {
      params: { handle }
    });
    console.log('[Solved.ac] fetchSolvedAcUser 성공:', data);
    return data;
  } catch (error: any) {
    console.error('[Solved.ac] fetchSolvedAcUser 실패:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    throw error;
  }
};

/**
 * 문제 검색 (쿼리 기반)
 */
export const searchSolvedAcProblems = async (query: string, page: number = 1): Promise<{ count: number; items: SolvedAcProblem[] }> => {
  console.log('[Solved.ac] searchSolvedAcProblems 호출:', { query, page, env: import.meta.env.MODE });
  try {
    const { data } = await solvedAcApi.get('/search/problem', {
      params: {
        query,
        page,
        _t: Date.now()
      }
    });
    console.log('[Solved.ac] searchSolvedAcProblems 성공:', { count: data.count });
    return data;
  } catch (error: any) {
    console.error('[Solved.ac] searchSolvedAcProblems 실패:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    throw error;
  }
};
