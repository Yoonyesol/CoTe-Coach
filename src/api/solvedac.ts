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
  tags: { key: string; name: string }[];
}

export const fetchSolvedAcUser = async (handle: string): Promise<SolvedAcUser> => {
  const res = await fetch(`${BASE_URL}/user/show?handle=${handle}`);
  if (!res.ok) throw new Error('사용자를 찾을 수 없습니다.');
  const data = await res.json();
  console.log('Solved.ac User Data:', data); // 로그를 남기려면 이렇게 변수에 담은 뒤 사용해야 합니다.
  return data;
};

export const searchSolvedAcProblems = async (query: string, page: number = 1): Promise<{ count: number; items: SolvedAcProblem[] }> => {
  const res = await fetch(`${BASE_URL}/search/problem?query=${encodeURIComponent(query)}&page=${page}`);
  if (!res.ok) throw new Error('문제 검색에 실패했습니다.');
  return res.json();
};
