import React, { useState, useMemo } from 'react';
import {
    History,
    Clock,
    Trophy,
    Tag,
    ChevronLeft,
    ChevronRight,
    Calendar
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { DailyHistoryProps } from '../../types/components';
import { motion, AnimatePresence } from 'framer-motion';

const DailyHistory: React.FC<DailyHistoryProps> = ({ onEditLog }) => {
    const { studyLogs } = useUserStore();
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Helper to get local date string (YYYY-MM-DD) without timezone offset
    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const filteredLogs = useMemo(() => {
        const dateStr = getLocalDateString(selectedDate);
        return studyLogs.filter(log => {
            // Convert completedAt (ISO string) to local date string for comparison
            const logDate = new Date(log.completedAt);
            const logDateStr = getLocalDateString(logDate);
            return logDateStr === dateStr;
        });
    }, [studyLogs, selectedDate]);

    const changeDate = (offset: number) => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(selectedDate.getDate() + offset);
        setSelectedDate(nextDate);
    };

    const isToday = getLocalDateString(selectedDate) === getLocalDateString(new Date());

    return (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-base-800 flex items-center gap-2 font-sans">
                        학습 기록 아카이브 <span className="text-sm font-bold bg-base-900 px-2 py-0.5 rounded-lg text-white leading-none uppercase tracking-tighter">
                            {isToday ? 'Today' : 'Past'}
                        </span>
                    </h2>
                    <p className="text-sm font-medium text-base-400 font-sans">
                        {isToday ? '오늘 해결한 문제들의 기록입니다.' : `${selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}의 학습 기록입니다.`}
                    </p>
                </div>

                {/* Date Selector */}
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm border border-white p-1.5 rounded-2xl shadow-sm">
                    <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white rounded-xl transition-all cursor-pointer text-base-400 hover:text-misty-dark active:scale-90">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center px-4 min-w-[140px]">
                        <span className="text-[10px] font-black text-base-300 uppercase leading-none mb-1 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> Select Date
                        </span>
                        <span className="text-sm font-black text-base-800 font-sans">
                            {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                        </span>
                    </div>
                    <button
                        onClick={() => changeDate(1)}
                        disabled={isToday}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${isToday ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white text-base-400 hover:text-misty-dark active:scale-90'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log) => (
                        <motion.div
                            layout
                            key={log.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => onEditLog(log)}
                            className="glass-card p-6 bg-white hover:bg-gradient-to-br hover:from-white hover:to-misty-light/10 border-none shadow-md group transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${log.result === 'SUCCESS' ? 'bg-sage/10 text-sage' : 'bg-coral/10 text-coral'
                                            }`}>
                                            {log.result === 'SUCCESS' ? '해결함' : '못 끝냄'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${log.solvingMethod === 'SELF' ? 'bg-misty/10 text-misty-dark' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {log.solvingMethod === 'SELF' ? '스스로' : '답지참고'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-base-100 text-base-500`}>
                                            {log.platform}
                                        </span>
                                        {log.stage > 0 && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-lavender/10 text-lavender-dark">
                                                {log.stage}차 복습
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-base font-black text-base-900 group-hover:text-misty-dark transition-colors">{log.problemId}</h4>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-black text-base-400 mb-4">
                                <div className="flex items-center gap-1.5 bg-base-50 px-2 py-1 rounded-lg">
                                    <Clock className="w-3.5 h-3.5" />
                                    {Math.round(log.elapsedTime / 60000)}분
                                </div>
                                <div className="flex items-center gap-1.5 bg-base-50 px-2 py-1 rounded-lg text-amber-600">
                                    <Trophy className="w-3.5 h-3.5" />
                                    {log.difficulty || 'Unknown'}
                                </div>
                                <div className="flex items-center gap-1.5 bg-base-50 px-2 py-1 rounded-lg text-misty-dark">
                                    <History className="w-3.5 h-3.5" />
                                    {log.perceivedDifficulty}
                                </div>
                            </div>

                            {log.reflection && (
                                <p className="text-xs font-bold text-base-500 line-clamp-2 bg-base-50/50 p-3 rounded-xl italic mb-4">
                                    "{log.reflection}"
                                </p>
                            )}

                            {log.concepts.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    <div className="w-full flex items-center gap-1 mb-1">
                                        <Tag className="w-3 h-3 text-base-300" />
                                        <span className="text-[9px] font-black text-base-300 uppercase">Tags</span>
                                    </div>
                                    {log.concepts.map(concept => (
                                        <span key={concept} className="px-2 py-0.5 bg-lavender/10 text-lavender-dark text-[9px] font-black rounded uppercase">
                                            #{concept}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredLogs.length === 0 && (
                    <div className="col-span-full py-16 bg-white/40 rounded-3xl border-2 border-dashed border-white flex flex-col items-center justify-center space-y-4">
                        <div className="text-4xl grayscale opacity-50">🐧</div>
                        <p className="text-sm font-black text-base-300">{isToday ? '오늘 해결한 문제가 아직 없어요.' : '이 날에는 기록된 학습이 없어요.'}</p>
                        <p className="text-[10px] font-bold text-base-200 uppercase tracking-widest">{isToday ? 'Start your first problem today!' : 'Try checking another date.'}</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default DailyHistory;
