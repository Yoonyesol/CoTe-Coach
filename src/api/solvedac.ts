import axios from 'axios';
import { SolvedAcUser } from '../types/user';
import { SolvedAcProblem } from '../types/problem';

// Supabase Edge Function URL for production CORS proxy
const SUPABASE_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solved-ac-proxy`;

// Axios instance for local development (Vite proxy)
const solvedAcApi = axios.create({
  baseURL: '/api/v3'
});

/**
 * Production 전용: Supabase Edge Function을 통한 CORS 우회
 * - 서버→서버 통신이므로 CORS 제한 없음
 * - Edge Function이 응답에 CORS 헤더를 추가하여 브라우저에 전달
 */
async function prodFetch<T>(path: string, params: Record<string, any> = {}): Promise<T> {
  const queryString = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const fullPath = `${path}${queryString ? '?' + queryString : ''}`;

  const response = await fetch(
    `${SUPABASE_PROXY_URL}?path=${encodeURIComponent(fullPath)}`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Solved.ac] prodFetch 실패:', { status: response.status, body: errorText });
    throw new Error(`Proxy request failed: ${response.status}`);
  }

  const data = await response.json() as T;
  return data;
}

/**
 * 사용자 정보 가져오기
 */
export const fetchSolvedAcUser = async (handle: string): Promise<SolvedAcUser> => {
  try {
    if (import.meta.env.PROD) {
      return await prodFetch<SolvedAcUser>('/user/show', { handle });
    }
    const { data } = await solvedAcApi.get('/user/show', { params: { handle } });
    return data;
  } catch (error: any) {
    console.error('[Solved.ac] fetchSolvedAcUser 실패:', {
      status: error.response?.status,
      message: error.message,
    });
    throw error;
  }
};

/**
 * 문제 검색 (쿼리 기반)
 */
export const searchSolvedAcProblems = async (query: string, page: number = 1): Promise<{ count: number; items: SolvedAcProblem[] }> => {
  try {
    if (import.meta.env.PROD) {
      return await prodFetch<{ count: number; items: SolvedAcProblem[] }>('/search/problem', {
        query,
        page,
        _t: Date.now()
      });
    }
    const { data } = await solvedAcApi.get('/search/problem', {
      params: { query, page, _t: Date.now() }
    });
    return data;
  } catch (error: any) {
    console.error('[Solved.ac] searchSolvedAcProblems 실패:', {
      status: error.response?.status,
      message: error.message,
    });
    throw error;
  }
};
