import axios from 'axios';

const BASE_URL = import.meta.env.DEV ? '/api/v3' : 'https://solved.ac/api/v3';

import { SolvedAcUser } from '../types/user';
import { SolvedAcProblem } from '../types/problem';

/**
 * 사용자 정보 가져오기
 */
export const fetchSolvedAcUser = async (handle: string): Promise<SolvedAcUser> => {
  const { data } = await axios.get(`${BASE_URL}/user/show`, {
    params: { handle }
  });
  return data;
};

/**
 * 문제 검색 (쿼리 기반)
 */
export const searchSolvedAcProblems = async (query: string, page: number = 1): Promise<{ count: number; items: SolvedAcProblem[] }> => {
  const { data } = await axios.get(`${BASE_URL}/search/problem`, {
    params: {
      query,
      page,
      _t: Date.now() // Cache busting parameter
    }
  });
  return data;
};
