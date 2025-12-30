import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Clock, HelpCircle, BookOpen, Lightbulb } from 'lucide-react';
import { useUserStore, StudyLog } from '../../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface EditStudyLogModalProps {
    log: StudyLog;
    isOpen: boolean;
    onClose: () => void;
}

const EditStudyLogModal: React.FC<EditStudyLogModalProps> = ({ log, isOpen, onClose }) => {
    const { updateStudyLog, deleteStudyLog } = useUserStore();
    const [feeling, setFeeling] = useState(log.feeling);
    const [perceivedDifficulty, setPerceivedDifficulty] = useState(log.perceivedDifficulty);
    const [result, setResult] = useState(log.result);
    const [solvingMethod, setSolvingMethod] = useState(log.solvingMethod);
    const [concepts, setConcepts] = useState(log.concepts.join(', '));
    const [elapsedMinutes, setElapsedMinutes] = useState(Math.round(log.elapsedTime / 60000));

    // Sync state when log changes
    useEffect(() => {
        setFeeling(log.feeling);
        setPerceivedDifficulty(log.perceivedDifficulty);
        setResult(log.result);
        setSolvingMethod(log.solvingMethod);
        setConcepts(log.concepts.join(', '));
        setElapsedMinutes(Math.round(log.elapsedTime / 60000));
    }, [log]);

    const handleSave = async () => {
        await updateStudyLog(log.id, {
            feeling,
            perceivedDifficulty,
            result,
            solvingMethod,
            elapsedTime: elapsedMinutes * 60000,
            concepts: concepts.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        });
        onClose();
    };

    const handleDelete = async () => {
        if (window.confirm('정말 이 기록을 삭제하시겠습니까? 관련 XP나 포인트는 회수되지 않습니다.')) {
            await deleteStudyLog(log.id);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-base-100"
                    >
                        <div className="p-6 border-b border-base-50 flex justify-between items-center bg-gradient-to-r from-misty-light/30 to-white">
                            <div>
                                <h3 className="text-xl font-black text-base-900 font-sans">학습 기록 수정</h3>
                                <p className="text-[10px] font-bold text-base-400 uppercase tracking-widest mt-1">{log.problemId}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-base-100 rounded-xl transition-colors cursor-pointer">
                                <X className="w-5 h-5 text-base-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Status Group */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-base-400 uppercase tracking-tighter flex items-center gap-1">
                                        <HelpCircle className="w-3 h-3" /> 해결 여부
                                    </label>
                                    <div className="flex bg-base-50 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setResult('SUCCESS')}
                                            className={clsx(
                                                "flex-1 py-2 text-[11px] font-black rounded-lg transition-all",
                                                result === 'SUCCESS' ? "bg-white text-base-900 shadow-sm" : "text-base-400"
                                            )}
                                        >
                                            해결함
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setResult('FAIL')}
                                            className={clsx(
                                                "flex-1 py-2 text-[11px] font-black rounded-lg transition-all",
                                                result === 'FAIL' ? "bg-white text-coral shadow-sm" : "text-base-400"
                                            )}
                                        >
                                            못 끝냄
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-base-400 uppercase tracking-tighter flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> 해결 방식
                                    </label>
                                    <div className="flex bg-base-50 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setSolvingMethod('SELF')}
                                            className={clsx(
                                                "flex-1 py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1",
                                                solvingMethod === 'SELF' ? "bg-white text-misty-dark shadow-sm" : "text-base-400"
                                            )}
                                        >
                                            <Lightbulb className="w-3 h-3" /> 스스로
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSolvingMethod('REFERENCE')}
                                            className={clsx(
                                                "flex-1 py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1",
                                                solvingMethod === 'REFERENCE' ? "bg-white text-amber-600 shadow-sm" : "text-base-400"
                                            )}
                                        >
                                            <BookOpen className="w-3 h-3" /> 답지참고
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Time & Difficulty Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-base-400 uppercase tracking-tighter flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 학습 시간 (분)
                                    </label>
                                    <input
                                        type="number"
                                        value={elapsedMinutes}
                                        onChange={(e) => setElapsedMinutes(Number(e.target.value))}
                                        className="w-full bg-base-50 border-2 border-transparent focus:border-misty-light focus:bg-white rounded-xl px-4 py-3 text-sm font-black outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-base-400 uppercase tracking-tighter">체감 난이도</label>
                                    <select
                                        value={perceivedDifficulty}
                                        onChange={(e) => setPerceivedDifficulty(e.target.value as any)}
                                        className="w-full bg-base-50 border-2 border-transparent focus:border-misty-light focus:bg-white rounded-xl px-3 py-3 text-sm font-black outline-none transition-all appearance-none"
                                    >
                                        <option value="EASY">쉬움</option>
                                        <option value="NORMAL">보통</option>
                                        <option value="HARD">어려움</option>
                                    </select>
                                </div>
                            </div>

                            {/* Feeling */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-base-400 uppercase tracking-tighter">학습 소감</label>
                                <textarea
                                    value={feeling}
                                    onChange={(e) => setFeeling(e.target.value)}
                                    placeholder="무엇을 배웠나요?"
                                    className="w-full bg-base-50 border-2 border-transparent focus:border-misty-light focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all h-24 resize-none"
                                />
                            </div>

                            {/* Concepts */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-base-400 uppercase tracking-tighter">학습 개념 (쉼표 구분)</label>
                                <input
                                    type="text"
                                    value={concepts}
                                    onChange={(e) => setConcepts(e.target.value)}
                                    placeholder="DFS, BFS, 그리디..."
                                    className="w-full bg-base-50 border-2 border-transparent focus:border-misty-light focus:bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-base-50/50 flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="p-3 text-coral hover:bg-coral/10 rounded-2xl transition-all cursor-pointer group"
                                title="삭제"
                            >
                                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-misty-dark text-white py-4 rounded-2xl font-black text-sm hover:bg-misty-dark/90 transition-all shadow-lg shadow-misty/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <Save className="w-4 h-4" />
                                변경 사항 저장
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditStudyLogModal;
