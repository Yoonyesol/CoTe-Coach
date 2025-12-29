import axios from 'axios';

const BASE_URL = '/api/v3';

export interface SolvedAcUser {
  handle: string;
  tier: number;
  rank: number;
  solvedCount: number;
  exp: number;
  rating: number;
}

export interface SolvedAcProblem {
  problemId: number;
  titleKo: string;
  level: number;
  tags: {
    key: string;
    bojTagId: number;
    displayNames: { language: string; name: string; short: string }[];
  }[];
}

/**
 * 사용자 정보 가져오기
 */
export const fetchSolvedAcUser = async (handle: string): Promise<SolvedAcUser> => {
  const { data } = await axios.get(`${BASE_URL}/user/show`, {
    params: { handle }
  });
  console.log('Solved.ac User Data:', data);
  return data;
};

/**
 * 문제 검색 (쿼리 기반)
 */
export const searchSolvedAcProblems = async (query: string, page: number = 1): Promise<{ count: number; items: SolvedAcProblem[] }> => {
  const { data } = await axios.get(`${BASE_URL}/search/problem`, {
    params: { query, page }
  });
  return data;
};
