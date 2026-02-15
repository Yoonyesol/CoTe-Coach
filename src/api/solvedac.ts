import axios from 'axios';
import { SolvedAcUser } from '../types/user';
import { SolvedAcProblem } from '../types/problem';

const SOLVED_AC_API = 'https://solved.ac/api/v3';

// Create a dedicated axios instance for Solved.ac (DEV only)
const solvedAcApi = axios.create({
  baseURL: '/api/v3'
});

/**
 * Production에서 CORS 우회를 위한 fetch 래퍼
 * allorigins.win/get은 응답을 { contents: "..." } JSON으로 감싸서
 * Access-Control-Allow-Origin 헤더를 정상적으로 반환
 */
async function prodFetch<T>(path: string, params: Record<string, any> = {}): Promise<T> {
  const queryString = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const targetUrl = `${SOLVED_AC_API}${path}${queryString ? '?' + queryString : ''}`;

  console.log('[Solved.ac] prodFetch 호출:', targetUrl);

  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  // allorigins /get endpoint wraps result in { contents: "raw response string" }
  const data = JSON.parse(json.contents) as T;
  console.log('[Solved.ac] prodFetch 성공:', data);
  return data;
}

/**
 * 사용자 정보 가져오기
 */
export const fetchSolvedAcUser = async (handle: string): Promise<SolvedAcUser> => {
  console.log('[Solved.ac] fetchSolvedAcUser 호출:', { handle, env: import.meta.env.MODE });
  try {
    if (import.meta.env.PROD) {
      return await prodFetch<SolvedAcUser>('/user/show', { handle });
    }
    const { data } = await solvedAcApi.get('/user/show', { params: { handle } });
    console.log('[Solved.ac] fetchSolvedAcUser 성공:', data);
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
  console.log('[Solved.ac] searchSolvedAcProblems 호출:', { query, page, env: import.meta.env.MODE });
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
    console.log('[Solved.ac] searchSolvedAcProblems 성공:', { count: data.count });
    return data;
  } catch (error: any) {
    console.error('[Solved.ac] searchSolvedAcProblems 실패:', {
      status: error.response?.status,
      message: error.message,
    });
    throw error;
  }
};
