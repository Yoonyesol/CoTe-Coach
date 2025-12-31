import programmersData from '../data/problems/programmers.json';
import sweaData from '../data/problems/swea.json';
import { SolvedAcProblem, StaticProblem } from '../types/problem';

/**
 * 프로그래머스 문제 목록 가져오기 (필터링 지원)
 */
export const getProgrammersProblems = (level?: number): StaticProblem[] => {
    if (level === undefined) return programmersData;
    return programmersData.filter(p => p.level === level);
};

/**
 * SWEA 문제 목록 가져오기 (필터링 지원)
 */
export const getSweaProblems = (level?: string): StaticProblem[] => {
    if (!level) return sweaData;
    return sweaData.filter(p => p.level === level);
};

/**
 * 정적 문제를 유니버설 형식으로 변환 (추천 엔진용)
 */
export const mapToUniversalFormat = (p: StaticProblem, platform: string): SolvedAcProblem => {
    return {
        problemId: Number(p.id) || 0,
        titleKo: p.title,
        level: typeof p.level === 'number' ? p.level : parseInt(String(p.level).replace('D', '')) || 0,
        tags: (p.tags || [platform]).map(tag => ({
            key: tag,
            displayNames: [{ name: tag, language: 'ko' }]
        })),
        problemUrl: p.url
    } as any;
};
