import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Plus, Target } from 'lucide-react';

interface StatsEmptyStateProps {
    onActionClick?: () => void;
}

const StatsEmptyState: React.FC<StatsEmptyStateProps> = ({ onActionClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 glass-card border-none bg-white/40 min-h-[500px] text-center"
        >
            <div className="relative mb-8">
                <div className="w-24 h-24 bg-misty-light/30 rounded-full flex items-center justify-center animate-pulse">
                    <BarChart3 className="w-12 h-12 text-misty-dark opacity-40" />
                </div>
                <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce delay-700">
                    <span className="text-xl">📈</span>
                </div>
            </div>

            <h3 className="text-2xl font-black text-base-800 mb-3 font-sans">성장 데이터가 아직 부족해요!</h3>
            <p className="text-base-500 font-medium max-w-md mb-10 leading-relaxed font-sans">
                문제를 해결하고 학습 로그를 남기면<br />
                스스로의 <span className="text-misty-dark font-black underline decoration-wheat decoration-4 underline-offset-2">학습 패턴과 성장 곡선</span>을 분석해 드릴게요.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-base-100 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-misty-light/20 text-misty-dark rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-base-600">목표 설정</span>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-base-100 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-lavender-light/20 text-lavender-dark rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-base-600">문제 풀이</span>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-base-100 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-sage-light/20 text-sage-dark rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-base-600">성과 분석</span>
                </div>
            </div>

            {onActionClick && (
                <button
                    onClick={onActionClick}
                    className="flex items-center gap-2 px-8 py-4 bg-base-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all active:scale-95 shadow-xl font-sans group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>첫 문제 도전하러 가기</span>
                </button>
            )}

            <div className="mt-12 flex items-center gap-4 text-[10px] font-bold text-base-300 uppercase tracking-widest">
                <div className="h-px w-8 bg-base-100" />
                Wait for your first trophy
                <div className="h-px w-8 bg-base-100" />
            </div>
        </motion.div>
    );
};

export default StatsEmptyState;
