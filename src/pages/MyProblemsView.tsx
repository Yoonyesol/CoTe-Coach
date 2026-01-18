
import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import CustomProblemCard from '../components/problems/CustomProblemCard';
import { ListTodo, CheckCircle2, Clock, Plus } from 'lucide-react';
import { clsx } from 'clsx';

import { DailyTask } from '../types/study';

interface MyProblemsViewProps {
    onAddModalOpen: () => void;
    onReviewOpen: (problem: { id?: string, title: string, platform: string, difficulty: string }) => void;
    onEditTask: (task: DailyTask) => void;
}

const MyProblemsView: React.FC<MyProblemsViewProps> = ({ onAddModalOpen, onReviewOpen, onEditTask }) => {
    const { dailyTasks } = useUserStore();
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

    // Filter only manual tasks (not auto-generated ones from timer unless we want to include them? 
    // User said "Custom List", usually refers to manual additions.
    // The HomeView filters manual ones as "Custom". Auto ones are "Active Problems".
    // Let's include everything in this view but maybe distinct them? 
    // For now, let's show ALL tasks but filter by status.
    const tasks = dailyTasks.filter(t => t.status === filter);

    const handleCompleteTask = (task: any) => {
        onReviewOpen({
            id: task.problemId,
            title: task.problemTitle,
            platform: task.site,
            difficulty: task.difficulty,
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-base-900 flex items-center gap-3">
                        <ListTodo className="w-8 h-8 text-misty-dark" />
                        나만의 문제 리스트
                    </h1>
                    <p className="text-base-400 font-medium font-sans">
                        직접 추가했거나 풀이 중인 문제들을 모아볼 수 있어요.
                    </p>
                </div>
                <button
                    onClick={onAddModalOpen}
                    className="px-5 py-3 bg-base-900 text-white rounded-2xl font-black hover:bg-base-800 transition-all active:scale-95 shadow-xl font-sans cursor-pointer text-sm whitespace-nowrap flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>새 문제 추가</span>
                </button>
            </header>

            {/* Tabs */}
            <div className="flex bg-white/50 p-1.5 rounded-2xl w-fit border border-base-200 backdrop-blur-sm">
                <button
                    onClick={() => setFilter('pending')}
                    className={clsx(
                        "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
                        filter === 'pending'
                            ? "bg-white text-base-900 shadow-sm ring-1 ring-base-100"
                            : "text-base-400 hover:text-base-600 hover:bg-white/50"
                    )}
                >
                    <Clock className="w-4 h-4" />
                    진행 중
                    <span className={clsx(
                        "ml-1 px-1.5 py-0.5 rounded-md text-[10px]",
                        filter === 'pending' ? "bg-base-100 text-base-600" : "bg-base-200/50 text-base-400"
                    )}>
                        {dailyTasks.filter(t => t.status === 'pending').length}
                    </span>
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={clsx(
                        "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
                        filter === 'completed'
                            ? "bg-white text-base-900 shadow-sm ring-1 ring-base-100"
                            : "text-base-400 hover:text-base-600 hover:bg-white/50"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    완료함
                    <span className={clsx(
                        "ml-1 px-1.5 py-0.5 rounded-md text-[10px]",
                        filter === 'completed' ? "bg-base-100 text-base-600" : "bg-base-200/50 text-base-400"
                    )}>
                        {dailyTasks.filter(t => t.status === 'completed').length}
                    </span>
                </button>
            </div>

            {/* Grid */}
            {tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {tasks.map((task) => (
                        <CustomProblemCard
                            key={task.id}
                            task={task}
                            onComplete={handleCompleteTask}
                            onEdit={onEditTask}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-4 border-2 border-dashed border-base-200 rounded-3xl bg-white/30">
                    <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center text-3xl">
                        {filter === 'pending' ? '📝' : '🎉'}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-base-600">
                            {filter === 'pending'
                                ? '진행 중인 문제가 없어요!'
                                : '아직 완료한 문제가 없어요!'}
                        </h3>
                        <p className="text-base-400 mt-1 font-medium text-sm">
                            {filter === 'pending'
                                ? '새로운 문제를 추가해서 도전해보세요.'
                                : '문제를 풀고 복습 로그를 작성하면 이곳에 싸여요.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProblemsView;
