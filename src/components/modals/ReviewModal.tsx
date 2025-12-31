import React, { useState } from 'react';
import { X, Save, CheckCircle2, MessageSquare, Brain, HelpCircle, BookOpen, Lightbulb, Zap } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { Platform } from '../../types/user';
import { clsx } from 'clsx';

import { ReviewModalProps } from '../../types/modal';

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, problem }) => {
    const { addReviewSession, getTotalElapsed, reviewPlans } = useUserStore();
    const { showAlert } = useModalStore();

    const existingPlan = reviewPlans.find(p => p.problemId === problem.title);
    const currentStage = existingPlan ? existingPlan.currentStage + 1 : 0;

    const [perceivedDifficulty, setPerceivedDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>('NORMAL');
    const [result, setResult] = useState<'SUCCESS' | 'FAIL'>('SUCCESS');
    const [solvingMethod, setSolvingMethod] = useState<'SELF' | 'REFERENCE'>('SELF');
    const [approach, setApproach] = useState('');
    const [reflection, setReflection] = useState('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate final elapsed time from manual inputs
        const finalElapsedTime = (manualMinutes * 60 * 1000) + (manualSeconds * 1000);

        try {
            await addReviewSession(problem.title, {
                problemId: problem.title,
                problemTitle: problem.title,
                platform: problem.platform as Platform,
                difficulty: problem.difficulty,
                perceivedDifficulty,
                result,
                solvingMethod,
                elapsedTime: finalElapsedTime,
                reflection,
                approach,
                concepts,
            });

            setIsSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error('Review submission failed:', error);
            showAlert('저장 실패', `저장에 실패했습니다.\n${error.message}`);
        }
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
                            <h2 className="text-lg font-black font-sans leading-tight">
                                {currentStage === 0 ? '학습 로그 작성' : `${currentStage}차 복습 로그 작성`}
                            </h2>
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
                        <p className="text-base-500 font-bold">학습 데이터가 연동되었습니다. ✨</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                        {/* Status Group */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Solve Status */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-base-700 uppercase tracking-widest flex items-center gap-1">
                                    <HelpCircle className="w-3 h-3" /> 해결 여부
                                </label>
                                <div className="flex bg-base-100 p-1 rounded-xl">
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

                            {/* Method Status */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-base-700 uppercase tracking-widest flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" /> 해결 방식
                                </label>
                                <div className="flex bg-base-100 p-1 rounded-xl">
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
                                            "py-2.5 rounded-xl text-[11px] font-black transition-all border-2",
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

                        {/* Time Input - Always Editable */}
                        <div className="p-4 bg-base-50 rounded-2xl border-2 border-dashed border-base-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-base-400 uppercase tracking-tighter">소요 시간</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={manualMinutes}
                                        onChange={(e) => setManualMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-12 text-center bg-transparent font-black text-sm outline-none border-b-2 border-base-200 focus:border-misty"
                                    />
                                    <span className="text-[10px] font-black text-base-400">분</span>
                                    <input
                                        type="number"
                                        value={manualSeconds}
                                        onChange={(e) => setManualSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                        className="w-12 text-center bg-transparent font-black text-sm outline-none border-b-2 border-base-200 focus:border-misty"
                                    />
                                    <span className="text-[10px] font-black text-base-400">초</span>
                                </div>
                            </div>
                        </div>

                        {/* Concepts Learned */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-base-700 uppercase tracking-widest">학습 개념</label>
                            <div className="space-y-3">
                                <div className="relative">
                                    < Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                    <input
                                        type="text"
                                        value={concept}
                                        onChange={(e) => setConcept(e.target.value)}
                                        onKeyDown={handleAddConcept}
                                        placeholder="엔터로 태그 추가"
                                        className="w-full pl-11 pr-4 py-3 bg-base-50 border-2 border-transparent focus:border-misty focus:bg-white rounded-xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {concepts.map((c) => (
                                        <span key={c} className="flex items-center gap-1 px-3 py-1 bg-misty-light text-misty-dark rounded-full text-[10px] font-black uppercase tracking-tight">
                                            #{c}
                                            <button type="button" onClick={() => removeConcept(c)} className="hover:text-coral transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Solution Approach */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-base-700 uppercase tracking-widest">해결 방식</label>
                            <div className="relative">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
                                <input
                                    type="text"
                                    value={approach}
                                    onChange={(e) => setApproach(e.target.value)}
                                    placeholder="예: 재귀, DFS, 투 포인터 등"
                                    className="w-full pl-11 pr-4 py-3 bg-base-50 border-2 border-transparent focus:border-misty focus:bg-white rounded-xl text-sm font-bold transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Reflection/Note */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-base-700 uppercase tracking-widest">학습 소감</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-base-300" />
                                <textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="과정에서의 깨달음이나 아쉬운 점..."
                                    rows={2}
                                    className="w-full pl-11 pr-4 py-4 bg-base-50 border-2 border-transparent focus:border-misty focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-4 bg-base-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                <Save className="w-5 h-5 inline-block mr-2" />
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
