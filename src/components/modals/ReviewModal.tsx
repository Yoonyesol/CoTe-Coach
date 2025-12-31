import React, { useState } from 'react';
import { X, CheckCircle2, Brain } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { Platform } from '../../types/user';
import LogForm from '../common/LogForm';

import { ReviewModalProps } from '../../types/modal';

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, problem }) => {
    const { addReviewSession, getTotalElapsed, reviewPlans } = useUserStore();
    const { showAlert } = useModalStore();

    const existingPlan = reviewPlans.find(p => p.problemId === problem.title);
    const currentStage = existingPlan ? existingPlan.currentStage + 1 : 0;
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Initial values for the form
    const elapsedTime = getTotalElapsed(problem.title);
    const initialMinutes = Math.floor(elapsedTime / 1000 / 60);
    const initialSeconds = Math.floor((elapsedTime / 1000) % 60);

    const handleSubmit = async (data: any) => {
        try {
            await addReviewSession(problem.title, {
                problemId: problem.title,
                problemTitle: problem.title,
                platform: problem.platform as Platform,
                difficulty: problem.difficulty,
                perceivedDifficulty: data.perceivedDifficulty,
                result: data.result,
                solvingMethod: data.solvingMethod,
                elapsedTime: data.elapsedTime,
                reflection: data.reflection,
                approach: data.approach,
                concepts: data.concepts,
                isFinished: data.isFinished
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
                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <LogForm
                            initialValues={{
                                result: 'SUCCESS',
                                solvingMethod: 'SELF',
                                perceivedDifficulty: 'NORMAL',
                                elapsedMinutes: initialMinutes,
                                elapsedSeconds: initialSeconds,
                                approach: '',
                                reflection: '',
                                concepts: [],
                                isFinished: false
                            }}
                            onSubmit={handleSubmit}
                            submitLabel="복습 로그 제출하기"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;
