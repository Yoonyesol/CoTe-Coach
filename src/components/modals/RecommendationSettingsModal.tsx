import React, { useState, useEffect } from 'react';
import { X, Check, Save, Info, Zap, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/useUserStore';
import { Platform } from '../../types/user';
import { RecommendationSettings } from '../../types/study';
import { clsx } from 'clsx';
import DifficultyGuideModal from './DifficultyGuideModal';
import { backdropVariants, getModalVariants } from '../../lib/animations';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

const ALGORITHMS = [
    { id: 'Greedy', name: '그리디' },
    { id: 'Implementation', name: '구현' },
    { id: 'DFS/BFS', name: 'DFS/BFS' },
    { id: 'Search', name: '탐색' },
    { id: 'DP', name: 'DP' },
    { id: 'Dijkstra', name: '다익스트라' },
    { id: 'Floyd-Warshall', name: '플로이드' },
    { id: 'Union-Find', name: '유니온 파인드' },
    { id: 'MST', name: '최소 스패닝 트리' },
    { id: 'Tree', name: '트리' },
    { id: 'Math', name: '수학' },
    { id: 'String', name: '문자열' },
    { id: 'Two Pointers', name: '투 포인터' }
];

const PLATFORMS: { id: Platform, label: string }[] = [
    { id: 'BOJ', label: '백준' },
    { id: 'PROG', label: '프로그래머스' },
    { id: 'LC', label: '릿코드' },
    { id: 'SWEA', label: 'SWEA' }
];

interface RecommendationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RecommendationSettingsModal: React.FC<RecommendationSettingsModalProps> = ({ isOpen, onClose }) => {
    const { recommendationSettings, setRecommendationSettings } = useUserStore();
    const [settings, setSettings] = useState<RecommendationSettings>(recommendationSettings);
    const [showGuide, setShowGuide] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLockBodyScroll(isOpen);

    useEffect(() => {
        if (isOpen) {
            setSettings(recommendationSettings);
        }
    }, [isOpen, recommendationSettings]);

    const handleSave = async () => {
        await setRecommendationSettings(settings);
        onClose();
    };

    const toggleAlgorithm = (algo: string) => {
        setSettings((prev: RecommendationSettings) => ({
            ...prev,
            focusAlgorithms: prev.focusAlgorithms.includes(algo)
                ? prev.focusAlgorithms.filter((a: string) => a !== algo)
                : [...prev.focusAlgorithms, algo]
        }));
    };

    const togglePlatform = (platform: Platform) => {
        setSettings((prev: RecommendationSettings) => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? (prev.platforms.length > 1 ? prev.platforms.filter((p: Platform) => p !== platform) : prev.platforms)
                : [...prev.platforms, platform]
        }));
    };

    const modalVariants = getModalVariants(isMobile);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 bg-base-900/60 backdrop-blur-sm cursor-pointer"
                        onClick={onClose}
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-lg bg-white sm:rounded-3xl rounded-t-3xl rounded-b-none sm:rounded-b-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-base-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black text-base-800 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-misty-dark" />
                                    추천 필터 설정
                                </h2>
                                <p className="text-xs font-bold text-base-400 mt-1">나에게 딱 맞는 문제를 골라줄게요!</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-base-50 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-base-300" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                            {/* Recommendation Count (Slider) */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-black text-base-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-misty" />
                                        추천 문제 개수
                                    </label>
                                    <span className="text-sm font-black text-misty-dark bg-misty-light/20 px-3 py-1 rounded-full">
                                        {settings.recommendationCount}개
                                    </span>
                                </div>
                                <div className="px-2">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={settings.recommendationCount}
                                        onChange={(e) => setSettings(prev => ({ ...prev, recommendationCount: parseInt(e.target.value) }))}
                                        className="w-full accent-misty-dark h-2 bg-base-100 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-base-300">
                                        <span>1개</span>
                                        <span>5개</span>
                                        <span>10개</span>
                                    </div>
                                </div>
                            </div>

                            {/* Difficulty Adjustment */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-black text-base-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                                        난이도 선호도
                                    </label>
                                    <button
                                        onClick={() => setShowGuide(true)}
                                        className="text-[10px] font-bold text-misty-dark hover:underline flex items-center gap-1"
                                    >
                                        <HelpCircle className="w-3 h-3" />
                                        난이도 가이드
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['EASY', 'NORMAL', 'HARD'] as const).map(diff => (
                                        <button
                                            key={diff}
                                            onClick={() => setSettings((prev: RecommendationSettings) => ({ ...prev, difficulty: diff }))}
                                            className={clsx(
                                                "py-3 rounded-2xl text-[11px] font-black border-2 transition-all flex flex-col items-center gap-1",
                                                settings.difficulty === diff
                                                    ? "bg-misty-light/30 border-misty-dark text-misty-dark shadow-sm"
                                                    : "bg-white border-base-100 text-base-400 hover:border-base-200"
                                            )}
                                        >
                                            <span className="text-lg">
                                                {diff === 'EASY' ? '🌱' : diff === 'NORMAL' ? '🌿' : '🌳'}
                                            </span>
                                            {diff === 'EASY' ? '쉽게' : diff === 'NORMAL' ? '적절히' : '도전적'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Platforms */}
                            <div className="space-y-4">
                                <label className="text-sm font-black text-base-700 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-lavender" />
                                    선호 플랫폼
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PLATFORMS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => togglePlatform(p.id)}
                                            className={clsx(
                                                "px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 flex items-center gap-2",
                                                settings.platforms.includes(p.id)
                                                    ? "bg-lavender-light border-lavender-dark text-lavender-dark"
                                                    : "bg-white border-base-100 text-base-400"
                                            )}
                                        >
                                            {p.label}
                                            {settings.platforms.includes(p.id) && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Focus Algorithms */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-black text-base-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                                        집중 학습 테마 (알고리즘)
                                    </label>
                                    <span className="text-[10px] font-bold text-base-300 italic">복수 선택 가능</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ALGORITHMS.map(algo => {
                                        const isActive = settings.focusAlgorithms.includes(algo.id);
                                        return (
                                            <button
                                                key={algo.id}
                                                onClick={() => toggleAlgorithm(algo.id)}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border-2",
                                                    isActive
                                                        ? "bg-sage-light border-sage text-sage-dark shadow-sm"
                                                        : "bg-white border-base-50 text-base-300 hover:border-base-100"
                                                )}
                                            >
                                                #{algo.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Info Note */}
                            <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3">
                                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                                <p className="text-[10px] md:text-xs font-bold text-blue-600 leading-relaxed">
                                    필터 적용 후 메인 화면의 <strong className="underline">대시보드 섞기</strong> 버튼을 누르면 새로운 추천 목록이 생성됩니다.
                                </p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-base-100 bg-white sticky bottom-0 z-10 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-base-50 text-base-500 rounded-2xl font-black text-sm hover:bg-base-100 transition-all active:scale-95"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-[2] py-4 bg-base-900 text-white rounded-2xl font-black text-sm hover:bg-base-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-base-900/20"
                            >
                                <Save className="w-4 h-4" />
                                설정 저장하기
                            </button>
                        </div>
                    </motion.div>

                    <DifficultyGuideModal
                        isOpen={showGuide}
                        onClose={() => setShowGuide(false)}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default RecommendationSettingsModal;
