import React, { useState } from 'react';
import { X, Save, CheckCircle2, MessageSquare, Brain } from 'lucide-react';
import { useUserStore, Platform } from '../store/useUserStore';
import { clsx } from 'clsx';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    problem: {
        title: string;
        platform: string;
        difficulty: string;
    };
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, problem }) => {
    const { addStudyLog, getTotalElapsed } = useUserStore();

    const [perceivedDifficulty, setPerceivedDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
    const [feeling, setFeeling] = useState('');
    const [concept, setConcept] = useState('');
    const [concepts, setConcepts] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Manual time input states (initialized from elapsed time if available)
    const elapsedTime = getTotalElapsed(problem.title);
    const initialMinutes = Math.floor(elapsedTime / 1000 / 60);
    const initialSeconds = Math.floor((elapsedTime / 1000) % 60);

    const [manualMinutes, setManualMinutes] = useState<number>(initialMinutes);
    const [manualSeconds, setManualSeconds] = useState<number>(initialSeconds);

    const handleAddConcept = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && concept.trim()) {
            e.preventDefault();
            if (!concepts.includes(concept.trim())) {
                setConcepts([...concepts, concept.trim()]);
            }
            setConcept('');
        }
    };

    const removeConcept = (target: string) => {
        setConcepts(concepts.filter(c => c !== target));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate final elapsed time from manual inputs
        const finalElapsedTime = (manualMinutes * 60 * 1000) + (manualSeconds * 1000);

        addStudyLog({
            problemId: problem.title,
            platform: problem.platform as Platform,
            difficulty: problem.difficulty,
            perceivedDifficulty,
            elapsedTime: finalElapsedTime,
            feeling,
            concepts,
        });

        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}분 ${s}초`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-card bg-white w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-base-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Brain className="w-5 h-5 text-misty" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black font-sans leading-tight">복습 로그 작성</h2>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{problem.platform} • {problem.difficulty}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="p-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-sage-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-sage-dark" />
                        </div>
                        <h3 className="text-2xl font-black text-base-900 font-sans">로그 제출 완료!</h3>
                        <p className="text-base-500 font-bold">보너스 XP +10를 획득했습니다. ✨</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* Time Input - Always Editable */}
                        <div className="p-4 bg-misty-light/30 rounded-2xl border border-misty/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-misty-dark uppercase tracking-tighter">풀이 소요 시간</p>
                                {elapsedTime > 0 && (
                                    <span className="px-2 py-0.5 bg-sage-light text-sage-dark rounded-full text-[9px] font-black">
                                        자동 기록됨
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="999"
                                        value={manualMinutes}
                                        onChange={(e) => setManualMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full px-4 py-3 bg-white border-2 border-misty/30 rounded-xl text-center text-lg font-black focus:border-misty transition-all outline-none"
                                        placeholder="0"
                                    />
                                    <p className="text-center text-[10px] font-black text-base-400 mt-1">분</p>
                                </div>
                                <span className="text-2xl font-black text-base-300">:</span>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={manualSeconds}
                                        onChange={(e) => setManualSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                        className="w-full px-4 py-3 bg-white border-2 border-misty/30 rounded-xl text-center text-lg font-black focus:border-misty transition-all outline-none"
                                        placeholder="0"
                                    />
                                    <p className="text-center text-[10px] font-black text-base-400 mt-1">초</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-base-500 font-medium text-center">
                                {elapsedTime > 0 ? '자동 기록된 시간을 수정할 수 있어요' : '시간은 대략적으로 입력해주세요'}
                            </p>
                        </div>

                        {/* Perceived Difficulty */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-base-700 uppercase tracking-widest">체감 난이도</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['EASY', 'NORMAL', 'HARD'] as const).map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setPerceivedDifficulty(level)}
                                        className={clsx(
                                            "py-3 rounded-xl text-xs font-black transition-all border-2",
                                            perceivedDifficulty === level
                                                ? (level === 'EASY' ? "bg-sage-light border-sage text-sage-dark" :
                                                    level === 'NORMAL' ? "bg-misty-light border-misty text-misty-dark" :
                                                        "bg-coral/10 border-coral text-coral")
                                                : "bg-white border-base-100 text-base-400 hover:border-base-200"
                                        )}
                                    >
                                        {level === 'EASY' ? '쉬움' : level === 'NORMAL' ? '보통' : '어려움'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Concepts Learned */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-base-700 uppercase tracking-widest">사용된 알고리즘/개념</label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                    <input
                                        type="text"
                                        value={concept}
                                        onChange={(e) => setConcept(e.target.value)}
                                        onKeyDown={handleAddConcept}
                                        placeholder="엔터를 눌러 태그 추가 (예: BFS, DP)"
                                        className="w-full pl-11 pr-4 py-3 bg-base-50 border-2 border-transparent focus:border-misty focus:bg-white rounded-xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {concepts.map((c) => (
                                        <span key={c} className="flex items-center gap-1 px-3 py-1 bg-misty-light text-misty-dark rounded-full text-xs font-black">
                                            {c}
                                            <button type="button" onClick={() => removeConcept(c)} className="hover:text-coral transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Feeling/Note */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-base-700 uppercase tracking-widest">풀이 소감 및 회고</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-base-300" />
                                <textarea
                                    value={feeling}
                                    onChange={(e) => setFeeling(e.target.value)}
                                    placeholder="풀이 과정에서의 깨달음이나 아쉬웠던 점을 적어주세요."
                                    rows={3}
                                    className="w-full pl-11 pr-4 py-4 bg-base-50 border-2 border-transparent focus:border-misty focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={!feeling.trim()}
                                className={clsx(
                                    "w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95",
                                    feeling.trim() ? "bg-base-900 text-white hover:shadow-xl" : "bg-base-100 text-base-400 cursor-not-allowed"
                                )}
                            >
                                <Save className="w-5 h-5" />
                                복습 로그 제출하기
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;
