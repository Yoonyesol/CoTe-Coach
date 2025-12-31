import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, TrendingDown, Calendar, ChevronRight
} from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { StudyLog } from '../types/study';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface ProblemStats {
    problemId: string;
    problemTitle: string;
    platform: string;
    difficulty: string;
    logs: StudyLog[];
    totalSolves: number;
    initialTime: number;
    recentTime: number;
    bestTime: number;
    lastSolvedAt: string;
    improvement: number; // percentage
    currentStage: number;
}

interface ProblemLibraryProps {
    onProblemClick: (log: StudyLog) => void;
}

const ProblemLibrary: React.FC<ProblemLibraryProps> = ({ onProblemClick }) => {
    const {
        libraryProblems,
        reviewPlans,
        fetchLibraryPage,
        libraryPage,
        libraryTotalSize
    } = useUserStore();

    // Local state only for Search (Client-side filtering within fetched page? OR reset page?)
    // Note: Search complicates pagination. Ideal: Search updates backend query.
    // For now, let's keep Search local to the page (User requested page/size logic).
    // Or better: If user searches, we might need a separate search API.
    // Given the task "Use page, size", I will assume we paginate strictly. 
    // Search might just filter the *current page* or we can't implement search easily without backend modification.
    // I'll keep client search behaving on the current page for now as per "Archive" usually implies standard listing.

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'RECENT' | 'SOLVES' | 'IMPROVEMENT' | 'DIFFICULTY'>('RECENT');
    const [isLoading, setIsLoading] = useState(false);

    const PAGE_SIZE = 12;

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
            if (user) {
                // Determine sort param for backend if applicable
                const backendSort = sortBy === 'DIFFICULTY' ? 'DIFFICULTY' : 'RECENT';
                await fetchLibraryPage(user.id, libraryPage, PAGE_SIZE, backendSort);
            }
            setIsLoading(false);
        };
        load();
    }, [libraryPage, sortBy]); // Trigger on page or sort change

    // Handle Page Change
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > Math.ceil(libraryTotalSize / PAGE_SIZE)) return;
        useUserStore.setState({ libraryPage: newPage });
    };

    // 1. GROUP LOGS BY PROBLEM ID (Using libraryProblems instead of all studyLogs)
    const problemGroups = useMemo(() => {
        const groups: Record<string, ProblemStats> = {};

        libraryProblems.forEach(log => {
            if (!groups[log.problemId]) {
                const plan = reviewPlans.find(p => p.problemId === log.problemId);
                groups[log.problemId] = {
                    problemId: log.problemId,
                    problemTitle: log.problemTitle,
                    platform: log.platform,
                    difficulty: log.difficulty || 'Unknown',
                    logs: [],
                    totalSolves: 0,
                    initialTime: 0,
                    recentTime: 0,
                    bestTime: Infinity,
                    lastSolvedAt: '',
                    improvement: 0,
                    currentStage: plan ? plan.currentStage : 0
                };
            }

            const group = groups[log.problemId];
            group.logs.push(log);
            group.totalSolves++;

            if (log.elapsedTime < group.bestTime) group.bestTime = log.elapsedTime;

            // Sort logs by date to identify initial vs recent
            group.logs.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
            group.initialTime = group.logs[0].elapsedTime;
            group.recentTime = group.logs[group.logs.length - 1].elapsedTime;
            group.lastSolvedAt = group.logs[group.logs.length - 1].completedAt;

            if (group.initialTime > 0) {
                group.improvement = ((group.initialTime - group.recentTime) / group.initialTime) * 100;
            }
        });

        return Object.values(groups);
    }, [libraryProblems, reviewPlans]);

    // 2. FILTER & SORT (Client-side refinement on the fetched page)
    const filteredProblems = useMemo(() => {
        let result = problemGroups;

        if (searchTerm) {
            result = result.filter(p =>
                p.problemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.problemId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Backend handles primary sort (RECENT/DIFFICULTY), but client applies specific sorts just in case
        return result.sort((a, b) => {
            switch (sortBy) {
                // If backend sorted by Date, this is redundant but safe
                case 'RECENT': return new Date(b.lastSolvedAt).getTime() - new Date(a.lastSolvedAt).getTime();
                // These are only valid within the page unless we do backend sort
                case 'SOLVES': return b.totalSolves - a.totalSolves;
                case 'IMPROVEMENT': return b.improvement - a.improvement;
                case 'DIFFICULTY': return b.difficulty.localeCompare(a.difficulty);
                default: return 0;
            }
        });
    }, [problemGroups, searchTerm, sortBy]);

    const totalPages = Math.ceil(libraryTotalSize / PAGE_SIZE);

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-base-900 flex items-center gap-2 font-sans">
                        문제 보관함 <span className="text-sm font-bold bg-misty-dark px-2 py-0.5 rounded-lg text-white leading-none uppercase tracking-tighter">
                            {libraryTotalSize} Problems
                        </span>
                    </h2>
                    <p className="text-sm font-medium text-base-400 font-sans">
                        지금까지 해결한 모든 문제들의 통계와 기록입니다.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Search input - acts as filter on current page */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                        <input
                            type="text"
                            placeholder="Page Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-base-100 rounded-xl pl-10 pr-4 py-2 text-sm font-bold outline-none focus:border-misty-dark transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white border border-base-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-misty-dark transition-all shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="RECENT">최근 해결순</option>
                        {/* Note: SOLVES/IMPROVEMENT only sort the current page visually */}
                        <option value="SOLVES">많이 푼 순 (Page)</option>
                        <option value="IMPROVEMENT">시간 단축순 (Page)</option>
                        <option value="DIFFICULTY">난이도순</option>
                    </select>
                </div>
            </div>

            {/* Problem List */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <AnimatePresence mode="popLayout">
                    {filteredProblems.map((problem) => (
                        <motion.div
                            key={problem.problemId}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => onProblemClick(problem.logs[problem.logs.length - 1])}
                            className="glass-card p-6 bg-white hover:bg-gradient-to-br hover:from-white hover:to-lavender-light/5 border-none shadow-md group transition-all cursor-pointer active:scale-[0.98] flex flex-col justify-between h-full"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-base-100 text-base-400 rounded-[4px] text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                            {problem.platform}
                                        </span>
                                        <span className="px-2 py-0.5 bg-lavender-light text-lavender-dark rounded-[4px] text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                            Stage {problem.currentStage}
                                        </span>
                                    </div>
                                    <div className="p-1.5 bg-base-50 text-base-200 group-hover:text-misty-dark rounded-lg transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-base font-black text-base-900 group-hover:text-misty-dark transition-colors line-clamp-2 leading-tight">
                                        {problem.problemTitle}
                                    </h4>
                                    <p className="text-[10px] font-bold text-base-300 mt-1 uppercase tracking-tighter">ID: {problem.problemId}</p>
                                </div>

                                {/* Stats Mini-Dashboard */}
                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-base-50">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-base-300 uppercase tracking-widest mb-0.5">Solves</p>
                                        <p className="text-xs font-black text-base-800">{problem.totalSolves}회</p>
                                    </div>
                                    <div className="text-center border-x border-base-50">
                                        <p className="text-[8px] font-black text-base-300 uppercase tracking-widest mb-0.5">Best</p>
                                        <p className="text-xs font-black text-sage-dark">{Math.round(problem.bestTime / 60000)}분</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-base-300 uppercase tracking-widest mb-0.5">Improve</p>
                                        <p className={clsx(
                                            "text-xs font-black",
                                            problem.improvement > 0 ? "text-coral" : "text-base-400"
                                        )}>
                                            {problem.improvement > 0 ? `-${Math.round(problem.improvement)}%` : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-base-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>최근: {new Date(problem.lastSolvedAt).toLocaleDateString()}</span>
                                </div>
                                {problem.improvement > 15 && (
                                    <div className="flex items-center gap-1 text-coral text-[10px] font-black italic">
                                        <TrendingDown className="w-3 h-3" /> Growth!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredProblems.length === 0 && (
                    <div className="col-span-full py-20 bg-white/40 rounded-3xl border-2 border-dashed border-white flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-base-50 rounded-full flex items-center justify-center text-3xl opacity-50 grayscale">📚</div>
                        <div className="text-center">
                            <p className="text-sm font-black text-base-300">표시할 문제가 없습니다.</p>
                            <p className="text-[10px] font-bold text-base-200 uppercase tracking-widest mt-1">
                                {searchTerm ? '검색 결과가 없습니다.' : 'Start solving problems to build your library!'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                        onClick={() => handlePageChange(libraryPage - 1)}
                        disabled={libraryPage === 1}
                        className="px-4 py-2 bg-white border border-base-200 rounded-xl text-xs font-black disabled:opacity-30 hover:bg-base-50 transition-all"
                    >
                        Previous
                    </button>

                    <span className="text-xs font-black text-base-400 px-4">
                        Page {libraryPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(libraryPage + 1)}
                        disabled={libraryPage === totalPages}
                        className="px-4 py-2 bg-white border border-base-200 rounded-xl text-xs font-black disabled:opacity-30 hover:bg-base-50 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}
        </section>
    );
};

export default ProblemLibrary;
