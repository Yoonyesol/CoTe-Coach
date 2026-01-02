import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, Brain, HelpCircle, BookOpen, Lightbulb, Zap, Archive, X } from 'lucide-react';
import { clsx } from 'clsx';

interface LogFormProps {
    initialValues?: {
        result: 'SUCCESS' | 'FAIL';
        solvingMethod: 'SELF' | 'REFERENCE';
        perceivedDifficulty: 'EASY' | 'NORMAL' | 'HARD';
        elapsedMinutes: number;
        elapsedSeconds: number;
        approach: string;
        reflection: string;
        concepts: string[];
        isFinished?: boolean;
        language?: string;
    };
    onSubmit: (data: {
        result: 'SUCCESS' | 'FAIL';
        solvingMethod: 'SELF' | 'REFERENCE';
        perceivedDifficulty: 'EASY' | 'NORMAL' | 'HARD';
        elapsedTime: number;
        approach: string;
        reflection: string;
        concepts: string[];
        isFinished: boolean;
        language: string;
    }) => void;
    onCancel?: () => void;
    submitLabel?: string;
}

const LogForm: React.FC<LogFormProps> = ({ initialValues, onSubmit, onCancel, submitLabel = '제출하기' }) => {
    const [result, setResult] = useState<'SUCCESS' | 'FAIL'>(initialValues?.result || 'SUCCESS');
    const [solvingMethod, setSolvingMethod] = useState<'SELF' | 'REFERENCE'>(initialValues?.solvingMethod || 'SELF');
    const [perceivedDifficulty, setPerceivedDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD'>(initialValues?.perceivedDifficulty || 'NORMAL');
    const [approach, setApproach] = useState(initialValues?.approach || '');
    const [reflection, setReflection] = useState(initialValues?.reflection || '');
    const [concept, setConcept] = useState('');
    const [concepts, setConcepts] = useState<string[]>(initialValues?.concepts || []);
    const [isFinished, setIsFinished] = useState(initialValues?.isFinished || false);
    const [language, setLanguage] = useState(initialValues?.language || 'C++');

    const [manualMinutes, setManualMinutes] = useState<number>(initialValues?.elapsedMinutes || 0);
    const [manualSeconds, setManualSeconds] = useState<number>(initialValues?.elapsedSeconds || 0);

    const languages = ['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'Swift', 'Kotlin'];

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
        const finalElapsedTime = (manualMinutes * 60 * 1000) + (manualSeconds * 1000);
        onSubmit({
            result,
            solvingMethod,
            perceivedDifficulty,
            elapsedTime: finalElapsedTime,
            approach,
            reflection,
            concepts,
            isFinished,
            language
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                                "cursor-pointer flex-1 py-2 text-[11px] font-black rounded-lg transition-all",
                                result === 'SUCCESS' ? "bg-white text-base-900 shadow-sm" : "text-base-400"
                            )}
                        >
                            해결함
                        </button>
                        <button
                            type="button"
                            onClick={() => setResult('FAIL')}
                            className={clsx(
                                "cursor-pointer flex-1 py-2 text-[11px] font-black rounded-lg transition-all",
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
                                "cursor-pointer flex-1 py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1",
                                solvingMethod === 'SELF' ? "bg-white text-misty-dark shadow-sm" : "text-base-400"
                            )}
                        >
                            <Lightbulb className="w-3 h-3" /> 스스로
                        </button>
                        <button
                            type="button"
                            onClick={() => setSolvingMethod('REFERENCE')}
                            className={clsx(
                                "cursor-pointer flex-1 py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1",
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
                                "cursor-pointer py-2.5 rounded-xl text-[11px] font-black transition-all border-2",
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

            {/* Language Selection */}
            <div className="space-y-3">
                <label className="text-xs font-black text-base-700 uppercase tracking-widest flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 사용 언어
                </label>
                <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => setLanguage(lang)}
                            className={clsx(
                                "cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2",
                                language === lang
                                    ? "bg-base-900 border-base-900 text-white shadow-md font-extrabold"
                                    : "bg-white border-base-100 text-base-400 hover:border-base-200 font-bold"
                            )}
                        >
                            {lang}
                        </button>
                    ))}
                    <input
                        type="text"
                        placeholder="기타..."
                        value={languages.includes(language) ? '' : language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 outline-none w-24",
                            !languages.includes(language) && language !== ''
                                ? "bg-base-900 border-base-900 text-white"
                                : "bg-white border-base-100 text-base-400 hover:border-base-200"
                        )}
                    />
                </div>
            </div>

            {/* Time Input */}
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
                        <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-300" />
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

            {/* Is Finished Checkbox */}
            <div className="pt-2">
                <label className="flex items-center gap-3 p-4 bg-misty-light/30 rounded-2xl cursor-pointer hover:bg-misty-light/50 transition-colors border-2 border-transparent hover:border-misty-light group">
                    <div className={clsx(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        isFinished ? "bg-misty border-misty" : "border-base-300 bg-white group-hover:border-misty"
                    )}>
                        <input
                            type="checkbox"
                            checked={isFinished}
                            onChange={(e) => setIsFinished(e.target.checked)}
                            className="hidden"
                        />
                        {isFinished && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                        <p className="font-black text-misty-dark text-sm">이 문제 졸업하기 🎓</p>
                        <p className="text-[11px] text-base-400 font-bold">체크하면 더 이상 복습 알림이 오지 않습니다.</p>
                    </div>
                </label>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer px-6 py-4 text-base-400 font-black text-sm hover:text-base-600 transition-colors rounded-2xl hover:bg-base-100"
                    >
                        취소
                    </button>
                )}
                <button
                    type="submit"
                    className="cursor-pointer flex-1 py-4 bg-base-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                    <Archive className="w-4 h-4" />
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default LogForm;
