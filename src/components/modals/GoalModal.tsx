import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Zap, Trash2, Save } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { StudyGoal } from '../../types/study';
import { getTodayString } from '../../lib/dateUtils';
import { clsx } from 'clsx';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    editGoal?: StudyGoal | null;
}

const ALGORITHM_TAGS = [
    '구현', '시뮬레이션', 'BFS', 'DFS', '그래프', 'DP',
    '그리디', '이분탐색', '투포인터', '백트래킹', '정렬',
    '문자열', '수학', '자료구조', '트리', '유니온파인드'
];

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, editGoal }) => {
    const { createGoal, updateGoal, deleteGoal } = useUserStore();

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(getTodayString());
    const [endDate, setEndDate] = useState('');
    const [dailyTarget, setDailyTarget] = useState(3);
    const [focusTags, setFocusTags] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (editGoal) {
            setName(editGoal.name);
            setStartDate(editGoal.startDate);
            setEndDate(editGoal.endDate);
            setDailyTarget(editGoal.dailyTarget);
            setFocusTags(editGoal.focusTags);
        } else {
            setName('');
            setStartDate(getTodayString());
            setEndDate('');
            setDailyTarget(3);
            setFocusTags([]);
        }
        setIsDeleting(false);
    }, [editGoal, isOpen]);

    const handleSubmit = async () => {
        if (!name.trim() || !endDate) return;

        if (editGoal) {
            await updateGoal(editGoal.id, {
                name,
                startDate,
                endDate,
                dailyTarget,
                focusTags
            });
        } else {
            await createGoal({
                name,
                startDate,
                endDate,
                dailyTarget,
                focusTags
            });
        }
        onClose();
    };

    const handleDelete = async () => {
        if (editGoal && isDeleting) {
            await deleteGoal(editGoal.id);
            onClose();
        } else {
            setIsDeleting(true);
        }
    };

    const toggleTag = (tag: string) => {
        setFocusTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    if (!isOpen) return null;

    const isValid = name.trim() && endDate && endDate >= startDate;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 border-b border-base-100 flex justify-between items-center rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-lavender-light rounded-xl">
                            <Target className="w-5 h-5 text-lavender-dark" />
                        </div>
                        <h2 className="text-xl font-black text-base-900 font-sans">
                            {editGoal ? '목표 수정' : '새 목표 설정'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-base-100 rounded-xl transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-base-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Goal Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-base-400 uppercase tracking-widest">
                            목표 이름 *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 삼성 SW 역량테스트 대비"
                            className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-lavender transition-all text-sm font-bold"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-base-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> 시작일
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-lavender transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-base-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> 목표일 (D-Day) *
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                className="w-full px-4 py-3 bg-base-50 border-none rounded-xl focus:ring-2 focus:ring-lavender transition-all text-sm font-bold"
                            />
                        </div>
                    </div>

                    {/* Daily Target */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-base-400 uppercase tracking-widest">
                            하루 목표 문제 수
                        </label>
                        <div className="flex items-center gap-3">
                            {[1, 2, 3, 5, 7, 10].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setDailyTarget(n)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer",
                                        dailyTarget === n
                                            ? "bg-lavender text-white"
                                            : "bg-base-50 text-base-500 hover:bg-base-100"
                                    )}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Focus Tags */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-base-400 uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> 집중할 알고리즘 (선택)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ALGORITHM_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer",
                                        focusTags.includes(tag)
                                            ? "bg-misty text-white"
                                            : "bg-base-50 text-base-500 hover:bg-base-100"
                                    )}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white p-6 border-t border-base-100 flex justify-between items-center rounded-b-3xl">
                    {editGoal ? (
                        <button
                            onClick={handleDelete}
                            className={clsx(
                                "px-4 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center gap-2",
                                isDeleting
                                    ? "bg-red-500 text-white"
                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                            )}
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? '정말 삭제?' : '삭제'}
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={clsx(
                            "px-6 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center gap-2",
                            isValid
                                ? "bg-lavender text-white hover:bg-lavender-dark"
                                : "bg-base-100 text-base-300 cursor-not-allowed"
                        )}
                    >
                        <Save className="w-4 h-4" />
                        {editGoal ? '저장' : '목표 설정'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalModal;
