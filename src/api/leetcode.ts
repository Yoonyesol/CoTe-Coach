import axios from 'axios';
import { SolvedAcProblem } from '../types/problem';

const BASE_URL = 'https://alfa-leetcode-api.onrender.com';

export interface LeetCodeProblem {
    title: string;
    titleSlug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    questionFrontendId: string;
}

/**
 * 릿코드 문제 목록 가져오기 (난이도 필터링)
 */
export const fetchLeetCodeProblems = async (difficulty: 'EASY' | 'MEDIUM' | 'HARD'): Promise<LeetCodeProblem[]> => {
    try {
        const { data } = await axios.get(`${BASE_URL}/problems`, {
            params: {
                difficulty: difficulty,
                limit: 50 // Get a good pool for selection
            }
        });
        return data.problemsetQuestionList || [];
    } catch (error) {
        console.error('Failed to fetch LeetCode problems:', error);
        return [];
    }
};

/**
 * 릿코드 난이도 -> 서비스 레벨 매핑
 */
const getLcLevel = (difficulty: string): number => {
    if (difficulty === 'Easy') return 5;    // Roughly Silver
    if (difficulty === 'Medium') return 15; // Roughly Platinum
    if (difficulty === 'Hard') return 25;   // Roughly Diamond
    return 10;
};

/**
 * 릿코드 문제를 유니버설 형식으로 변환
 */
export const mapLcToUniversal = (p: LeetCodeProblem): SolvedAcProblem => {
    return {
        problemId: parseInt(p.questionFrontendId) || 0,
        titleKo: p.title, // LeetCode is English but using titleKo for compatibility
        level: getLcLevel(p.difficulty),
        tags: [{ key: 'LeetCode', displayNames: [{ name: 'LeetCode', language: 'ko' }] }],
        problemUrl: `https://leetcode.com/problems/${p.titleSlug}/`
    } as any;
};
