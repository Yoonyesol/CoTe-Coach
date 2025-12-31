import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    Circle,
    Plus,
    Trash2,
    Target,
    Clock,
    Trophy,
    Zap,
    Bell,
    BookOpen
} from 'lucide-react';
import { clsx } from 'clsx';
import { useUserStore } from '../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyLog } from '../types/study';

const PLATFORM_ICONS: Record<string, string> = {
    BOJ: 'https://static.solved.ac/logo.json', // Placeholder for concept
};

interface LearningJournalProps {
    onLogClick?: (log: StudyLog) => void;
}

const LearningJournal: React.FC<LearningJournalProps> = ({ onLogClick }) => {
    const {
        dailyTasks,
        studyLogs,
        addDailyTask,
        toggleTaskStatus,
        deleteDailyTask,
        reviewPlans
    } = useUserStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Calendar Calculations
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const totalSlots = 42; // 6 rows * 7 days

        const result = [];
        // Prev month padding
        for (let i = firstDay - 1; i >= 0; i--) {
            result.push({
                day: prevMonthLastDay - i,
                month: month - 1,
                year,
                isCurrentMonth: false,
                dateStr: new Date(year, month - 1, prevMonthLastDay - i + 1).toISOString().split('T')[0]
            });
        }
        // Current month
        for (let i = 1; i <= days; i++) {
            result.push({
                day: i,
                month,
                year,
                isCurrentMonth: true,
                dateStr: new Date(year, month, i + 1).toISOString().split('T')[0]
            });
        }
        // Next month padding
        const remaining = totalSlots - result.length;
        for (let i = 1; i <= remaining; i++) {
            result.push({
                day: i,
                month: month + 1,
                year,
                isCurrentMonth: false,
                dateStr: new Date(year, month + 1, i + 1).toISOString().split('T')[0]
            });
        }
        return result;
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(nextDate);
    };

    // Filter Tasks & Logs for selected date
    const dayTasks = dailyTasks.filter(t => t.targetDate === selectedDate);
    const dayLogs = studyLogs.filter(l => l.completedAt.startsWith(selectedDate));
    const dayReviews = reviewPlans.filter(p => p.nextReviewAt && p.nextReviewAt.startsWith(selectedDate) && p.status === 'ACTIVE');

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        addDailyTask({
            problemId: `MANUAL-${Date.now()}`,
            problemTitle: newTaskTitle,
            site: 'BOJ', // Default
            difficulty: '?',
            targetDate: selectedDate
        });
        setNewTaskTitle('');
        setIsAddTaskOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-base-900 font-sans tracking-tight flex items-center gap-3">
                    <CalendarIcon className="w-8 h-8 text-misty-dark" />
                    학습 일지 (Learning Journal)
                </h2>
                <p className="text-sm font-medium text-base-400 font-sans">
                    당신의 <span className="text-misty-dark font-black">매일매일</span>이 기록되는 특별한 공간입니다.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Calendar Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 border-none bg-white shadow-xl">
                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-base-900 font-sans">
                                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-base-100 rounded-xl transition-colors cursor-pointer">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-base-100 rounded-xl transition-colors cursor-pointer">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(dw => (
                                <div key={dw} className="text-center py-2 text-[10px] font-black text-base-300 uppercase tracking-widest">
                                    {dw}
                                </div>
                            ))}
                            {calendarDays.map((dayObj, idx) => {
                                const isSelected = dayObj.dateStr === selectedDate;
                                const hasLogs = studyLogs.some(l => l.completedAt.startsWith(dayObj.dateStr));
                                const hasPendingTasks = dailyTasks.some(t => t.targetDate === dayObj.dateStr && t.status === 'pending');
                                const hasReviews = reviewPlans.some(p => p.nextReviewAt && p.nextReviewAt.startsWith(dayObj.dateStr) && p.status === 'ACTIVE');

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDate(dayObj.dateStr)}
                                        className={clsx(
                                            "relative h-24 p-2 border-2 rounded-2xl transition-all group cursor-pointer",
                                            dayObj.isCurrentMonth ? "bg-white" : "bg-base-50/50 opacity-40 grayscale",
                                            isSelected ? "border-misty-dark bg-misty-light/10 shadow-inner" : "border-base-50 hover:border-misty-light"
                                        )}
                                    >
                                        <span className={clsx(
                                            "text-sm font-black transition-colors",
                                            isSelected ? "text-misty-dark" : "text-base-400 group-hover:text-base-900"
                                        )}>
                                            {dayObj.day}
                                        </span>

                                        {/* Status Indicators */}
                                        <div className="absolute bottom-2 right-2 flex gap-1">
                                            {hasLogs && (
                                                <div className="w-2 h-2 rounded-full bg-sage shadow-sm shadow-sage/50" />
                                            )}
                                            {hasPendingTasks && (
                                                <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                                            )}
                                            {hasReviews && (
                                                <div className="w-2 h-2 rounded-full bg-lavender shadow-sm shadow-lavender/50" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend / Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 bg-white shadow-md flex items-center gap-3 border-none">
                            <div className="w-3 h-3 rounded-full bg-sage" />
                            <span className="text-xs font-black text-base-600">문제 해결 완료</span>
                        </div>
                        <div className="glass-card p-4 bg-white shadow-md flex items-center gap-3 border-none">
                            <div className="w-3 h-3 rounded-full bg-lavender" />
                            <span className="text-xs font-black text-base-600">복습 예정일</span>
                        </div>
                    </div>
                </div>

                {/* Right: Selected Date Detail Column */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-none bg-gradient-to-br from-white to-misty-light/20 shadow-xl sticky top-8">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black text-misty-dark uppercase tracking-widest">{new Date(selectedDate).toLocaleDateString('ko-KR', { weekday: 'long' })}</span>
                            </div>
                            <h3 className="text-2xl font-black text-base-900 font-sans">{new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</h3>
                        </div>

                        {/* Planned Tasks (TODO) */}
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-base-400 uppercase tracking-tighter flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Today's Plan
                                </h4>
                                <button
                                    onClick={() => setIsAddTaskOpen(true)}
                                    className="p-1 hover:bg-base-100 rounded-lg text-misty-dark transition-colors cursor-pointer"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {isAddTaskOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                            placeholder="풀 계획인 문제 제목..."
                                            className="flex-1 bg-white border-2 border-base-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-misty-dark transition-colors shadow-sm"
                                        />
                                        <button onClick={handleAddTask} className="bg-misty-dark text-white p-2 rounded-xl hover:bg-misty-dark/90 transition-all cursor-pointer">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                {dayTasks.map(task => (
                                    <motion.div
                                        layout
                                        key={task.id}
                                        className="flex justify-between items-center p-4 bg-white rounded-2xl border border-base-100 shadow-sm group hover:border-misty-light transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleTaskStatus(task.id)}
                                                className="cursor-pointer transition-transform active:scale-90"
                                            >
                                                {task.status === 'completed' ? (
                                                    <CheckCircle2 className="w-6 h-6 text-sage" />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-base-100 group-hover:text-base-200" />
                                                )}
                                            </button>
                                            <span className={clsx(
                                                "font-bold text-sm",
                                                task.status === 'completed' ? "text-base-300 line-through" : "text-base-700"
                                            )}>{task.problemTitle}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteDailyTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-base-200 hover:text-coral transition-all cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                                {dayTasks.length === 0 && !isAddTaskOpen && (
                                    <div className="py-8 text-center border-2 border-dashed border-base-100 rounded-3xl">
                                        <p className="text-xs font-bold text-base-300">오늘의 계획이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review Schedule */}
                        <div className="space-y-4 mb-8">
                            <h4 className="text-sm font-black text-base-400 uppercase tracking-tighter flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Review Schedule
                            </h4>
                            <div className="space-y-2">
                                {dayReviews.map(plan => (
                                    <div key={plan.id} className="p-4 bg-lavender-light/10 rounded-2xl border border-lavender/10 flex gap-4 items-center shadow-sm">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-lavender/10 text-lg">
                                            {plan.currentStage === 0 ? '🌱' : plan.currentStage >= 4 ? '🌳' : '🌿'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-lavender-light text-lavender-dark rounded uppercase">
                                                    {plan.currentStage + 1}회차 복습
                                                </span>
                                            </div>
                                            <p className="text-sm font-black text-base-700 leading-tight mt-1">{plan.problemTitle}</p>
                                        </div>
                                    </div>
                                ))}
                                {dayReviews.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed border-base-100 rounded-3xl">
                                        <p className="text-xs font-bold text-base-300">이 날의 복습 일정이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Completed Logs */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-base-400 uppercase tracking-tighter flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Logged Activity
                            </h4>
                            <div className="space-y-2">
                                {dayLogs.map(log => (
                                    <div
                                        key={log.id}
                                        onClick={() => onLogClick?.(log)}
                                        className="p-4 bg-white/50 rounded-2xl border border-white flex gap-4 items-start shadow-sm cursor-pointer hover:bg-white/80 transition-all active:scale-[0.98]"
                                    >
                                        <div className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center shrink-0">
                                            <Trophy className="w-5 h-5 text-sage" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-base-700 leading-tight">{log.problemId}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-[10px] font-black text-base-400 uppercase">
                                                    <Clock className="w-3 h-3" />
                                                    {Math.round(log.elapsedTime / 60000)}m
                                                </span>
                                                <span className="px-2 py-0.5 bg-base-100 rounded text-[9px] font-black text-base-500 uppercase">{log.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {dayLogs.length === 0 && (
                                    <div className="py-8 text-center">
                                        <p className="text-xs font-bold text-base-200 italic">아직 푼 문제가 없어요 🐧</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningJournal;
