import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Save, Trash2, Clock, HelpCircle,
    BookOpen, Lightbulb, Zap, MessageSquare,
    Calendar, History, TrendingUp, Edit3
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { StudyLog } from '../../types/study';
import { StudyLogDetailModalProps } from '../../types/modal';

const StudyLogDetailModal: React.FC<StudyLogDetailModalProps> = ({ log: initialLog, isOpen, onClose }) => {
    const { updateStudyLog, deleteStudyLog, studyLogs } = useUserStore();

    // CURRENT VIEW STATE
    const [currentLog, setCurrentLog] = useState<StudyLog>(initialLog);
    const [isEditing, setIsEditing] = useState(false);

    // EDIT FORM STATE
    const [reflection, setReflection] = useState(initialLog.reflection);
    const [approach, setApproach] = useState(initialLog.approach);
    const [perceivedDifficulty, setPerceivedDifficulty] = useState(initialLog.perceivedDifficulty);
    const [result, setResult] = useState(initialLog.result);
    const [solvingMethod, setSolvingMethod] = useState(initialLog.solvingMethod);
    const [concepts, setConcepts] = useState(initialLog.concepts.join(', '));
    const [elapsedMinutes, setElapsedMinutes] = useState(Math.round(initialLog.elapsedTime / 60000));

    // HISTORY LOGS (All logs for the same problem)
    const historyLogs = useMemo(() => {
        return studyLogs
            .filter(l => l.problemId === currentLog.problemId)
            .sort((a, b) => b.stage - a.stage); // Newest stage first
    }, [studyLogs, currentLog.problemId]);

    // Sync form state when current log changes
    useEffect(() => {
        setReflection(currentLog.reflection);
        setApproach(currentLog.approach);
        setPerceivedDifficulty(currentLog.perceivedDifficulty);
        setResult(currentLog.result);
        setSolvingMethod(currentLog.solvingMethod);
        setConcepts(currentLog.concepts.join(', '));
        setElapsedMinutes(Math.round(currentLog.elapsedTime / 60000));
        setIsEditing(false); // Reset to view mode when switching logs
    }, [currentLog]);

    const handleSave = async () => {
        await updateStudyLog(currentLog.id, {
            reflection,
            approach,
            perceivedDifficulty,
            result,
            solvingMethod,
            elapsedTime: elapsedMinutes * 60000,
            concepts: concepts.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        });
        // Update local current log view
        const updatedLog = {
            ...currentLog,
            reflection,
            approach,
            perceivedDifficulty,
            result,
            solvingMethod,
            elapsedTime: elapsedMinutes * 60000,
            concepts: concepts.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        };
        setCurrentLog(updatedLog);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (window.confirm('정말 이 기록을 삭제하시겠습니까? 관련 XP나 포인트는 회수되지 않습니다.')) {
            await deleteStudyLog(currentLog.id);
            if (historyLogs.length > 1) {
                // If there are other logs, switch to the next one
                const nextLog = historyLogs.find(l => l.id !== currentLog.id) || historyLogs[0];
                setCurrentLog(nextLog);
            } else {
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-base-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-base-100 flex flex-col md:flex-row h-[85vh] md:h-auto md:max-h-[85vh]"
                >
                    {/* LEFT PANEL: Detailed Content */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden">
                        {/* Header */}
                        <div className="p-8 pb-4 border-b border-base-50 flex justify-between items-start bg-gradient-to-r from-misty-light/10 to-white">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                                        currentLog.result === 'SUCCESS' ? "bg-sage-light text-sage-dark" : "bg-coral/10 text-coral"
                                    )}>
                                        {currentLog.result === 'SUCCESS' ? 'SUCCESS' : 'FAIL'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-base-100 text-base-500 rounded text-[10px] font-black uppercase tracking-widest">
                                        {currentLog.platform} • {currentLog.difficulty}
                                    </span>
                                    <span className="px-2 py-0.5 bg-lavender-light text-lavender-dark rounded text-[10px] font-black uppercase tracking-widest">
                                        STAGE {currentLog.stage === 0 ? 'Initial' : currentLog.stage}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-base-900 font-sans tracking-tight leading-tight">
                                    {currentLog.problemTitle}
                                </h3>
                                <p className="text-[11px] font-bold text-base-400 font-sans flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(currentLog.completedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 완료
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-base-100 rounded-xl transition-all md:hidden">
                                <X className="w-6 h-6 text-base-300" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                            {isEditing ? (
                                /* EDIT MODE */
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-base-400 uppercase tracking-widest flex items-center gap-2">
                                                <HelpCircle className="w-3 h-3" /> Success Status
                                            </label>
                                            <div className="flex bg-base-50 p-1 rounded-xl">
                                                <button onClick={() => setResult('SUCCESS')} className={clsx("flex-1 py-2 text-[11px] font-black rounded-lg transition-all", result === 'SUCCESS' ? "bg-white text-base-900 shadow-sm" : "text-base-300")}>해결</button>
                                                <button onClick={() => setResult('FAIL')} className={clsx("flex-1 py-2 text-[11px] font-black rounded-lg transition-all", result === 'FAIL' ? "bg-white text-coral shadow-sm" : "text-base-300")}>실패</button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-base-400 uppercase tracking-widest flex items-center gap-2">
                                                <BookOpen className="w-3 h-3" /> Method
                                            </label>
                                            <div className="flex bg-base-50 p-1 rounded-xl">
                                                <button onClick={() => setSolvingMethod('SELF')} className={clsx("flex-1 py-2 text-[11px] font-black rounded-lg transition-all", solvingMethod === 'SELF' ? "bg-white text-misty-dark shadow-sm" : "text-base-300")}>스스로</button>
                                                <button onClick={() => setSolvingMethod('REFERENCE')} className={clsx("flex-1 py-2 text-[11px] font-black rounded-lg transition-all", solvingMethod === 'REFERENCE' ? "bg-white text-amber-600 shadow-sm" : "text-base-300")}>참고</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-base-400 uppercase tracking-widest">Time (Min)</label>
                                            <input type="number" value={elapsedMinutes} onChange={e => setElapsedMinutes(Number(e.target.value))} className="w-full bg-base-50 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-misty" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-base-400 uppercase tracking-widest">Difficulty</label>
                                            <select value={perceivedDifficulty} onChange={e => setPerceivedDifficulty(e.target.value as any)} className="w-full bg-base-50 rounded-xl px-4 py-3 text-sm font-black outline-none border-2 border-transparent focus:border-misty appearance-none">
                                                <option value="EASY">쉬움</option>
                                                <option value="NORMAL">보통</option>
                                                <option value="HARD">어려움</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Approach
                                        </label>
                                        <input type="text" value={approach} onChange={e => setApproach(e.target.value)} placeholder="접근법을 간단히 적어주세요" className="w-full bg-base-50 rounded-xl px-4 py-3 text-sm font-bold outline-none border-2 border-transparent focus:border-misty" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-3 h-3" /> Reflection
                                        </label>
                                        <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={3} placeholder="무엇을 배웠나요?" className="w-full bg-base-50 rounded-2xl px-4 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-misty resize-none" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-base-400 uppercase tracking-widest">Concepts (Tags, comma separated)</label>
                                        <input type="text" value={concepts} onChange={e => setConcepts(e.target.value)} placeholder="DFS, BFS, Greedy..." className="w-full bg-base-50 rounded-xl px-4 py-3 text-sm font-bold outline-none border-2 border-transparent focus:border-misty" />
                                    </div>
                                </div>
                            ) : (
                                /* VIEW MODE */
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                            <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Time
                                            </p>
                                            <p className="text-lg font-black text-base-800">{Math.round(currentLog.elapsedTime / 60000)}m</p>
                                        </div>
                                        <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                            <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> Difficulty
                                            </p>
                                            <p className={clsx(
                                                "text-lg font-black",
                                                currentLog.perceivedDifficulty === 'HARD' ? "text-coral" :
                                                    currentLog.perceivedDifficulty === 'EASY' ? "text-sage-dark" : "text-misty-dark"
                                            )}>
                                                {currentLog.perceivedDifficulty}
                                            </p>
                                        </div>
                                        <div className="bg-base-50 p-4 rounded-2xl border border-base-100/50">
                                            <p className="text-[10px] font-black text-base-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> Method
                                            </p>
                                            <p className="text-lg font-black text-base-800">
                                                {currentLog.solvingMethod === 'SELF' ? 'Self' : 'Ref'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed Sections */}
                                    <div className="space-y-6">
                                        <section className="space-y-2">
                                            <h4 className="text-[10px] font-black text-base-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Zap className="w-3.5 h-3.5 text-wheat-dark" /> Solution Approach
                                            </h4>
                                            <div className="p-5 bg-wheat/5 border-l-4 border-wheat rounded-r-2xl">
                                                <p className="text-sm font-bold text-base-800 leading-relaxed whitespace-pre-wrap">
                                                    {currentLog.approach || '작성된 접근법이 없습니다.'}
                                                </p>
                                            </div>
                                        </section>

                                        <section className="space-y-2">
                                            <h4 className="text-[10px] font-black text-base-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <MessageSquare className="w-3.5 h-3.5 text-misty-dark" /> Reflection
                                            </h4>
                                            <div className="p-5 bg-misty-light/10 border-l-4 border-misty rounded-r-2xl">
                                                <p className="text-sm font-bold text-base-700 leading-relaxed whitespace-pre-wrap italic">
                                                    "{currentLog.reflection || '작성된 소감이 없습니다.'}"
                                                </p>
                                            </div>
                                        </section>

                                        {currentLog.concepts.length > 0 && (
                                            <section className="space-y-3">
                                                <h4 className="text-[10px] font-black text-base-400 uppercase tracking-[0.2em]">Concepts Learned</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {currentLog.concepts.map(c => (
                                                        <span key={c} className="px-3 py-1 bg-base-900 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
                                                            #{c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="p-6 bg-base-50/50 flex gap-3 border-t border-base-100">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="px-6 py-4 text-base-400 font-black text-sm hover:text-base-600 transition-colors">취소</button>
                                    <button onClick={handleSave} className="flex-1 bg-base-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95">
                                        <Save className="w-4 h-4" /> 기록 업데이트
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleDelete} className="p-4 text-coral hover:bg-coral/10 rounded-2xl transition-all group" title="Delete record">
                                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="flex-1 bg-misty-dark text-white py-4 rounded-2xl font-black text-sm hover:bg-misty-dark/90 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95">
                                        <Edit3 className="w-4 h-4" /> 이 기록 수정하기
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: History Timeline */}
                    <div className="w-full md:w-72 bg-base-50 border-l border-base-100 flex flex-col h-[40vh] md:h-auto overflow-hidden">
                        <div className="p-6 border-b border-base-100 flex justify-between items-center">
                            <h4 className="text-[11px] font-black text-base-400 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-4 h-4" /> Challenge History
                            </h4>
                            <button onClick={onClose} className="p-2 hover:bg-base-100 rounded-xl transition-all hidden md:block">
                                <X className="w-5 h-5 text-base-300" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {historyLogs.map((h, i) => (
                                <button
                                    key={h.id}
                                    onClick={() => setCurrentLog(h)}
                                    className={clsx(
                                        "w-full p-4 rounded-2xl text-left transition-all border-2 relative group",
                                        h.id === currentLog.id
                                            ? "bg-white border-misty-dark shadow-md"
                                            : "bg-transparent border-transparent hover:bg-white/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={clsx(
                                            "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                                            h.stage === 0 ? "bg-base-200 text-base-500" : "bg-lavender-light text-lavender-dark"
                                        )}>
                                            {h.stage === 0 ? 'Initial' : `${h.stage}차 복습`}
                                        </span>
                                        <span className="text-[9px] font-bold text-base-300">
                                            {new Date(h.completedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className={clsx(
                                        "text-xs font-black",
                                        h.id === currentLog.id ? "text-base-900" : "text-base-400"
                                    )}>
                                        {h.result === 'SUCCESS' ? '✅ 성공' : '❌ 실패'}
                                    </p>

                                    {/* Timeline line */}
                                    {i < historyLogs.length - 1 && (
                                        <div className="absolute left-[2.5rem] bottom-[-1rem] w-[2px] h-4 bg-base-200 z-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 bg-white/50 border-t border-base-100">
                            <p className="text-[10px] font-bold text-base-300 leading-tight">
                                전체 해결 {historyLogs.length}회 • 평균 시간 {Math.round(historyLogs.reduce((acc, curr) => acc + curr.elapsedTime, 0) / historyLogs.length / 60000)}분
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StudyLogDetailModal;
