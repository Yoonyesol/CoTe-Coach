import React from 'react';
import { X, Award, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import TierBadge from '../TierBadge';

import { TierGuideModalProps } from '../../types/modal';

const TierGuideModal: React.FC<TierGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const tiers = [
        { name: 'Iron', range: 'Lv 1-3', boj: 'Bronze 5~4', color: 'text-zinc-600', desc: '코딩테스트 입문자' },
        { name: 'Bronze', range: 'Lv 4-8', boj: 'Bronze 3 ~ Silver 3', color: 'text-amber-700', desc: '기초를 다지는 단계' },
        { name: 'Silver', range: 'Lv 9-18', boj: 'Silver 2 ~ Gold 5', color: 'text-gray-400', desc: '중급자로 성장하는 단계' },
        { name: 'Gold', range: 'Lv 19-28', boj: 'Gold 4 ~ Platinum 5', color: 'text-yellow-500', desc: '본격적인 알고리즘 해결사' },
        { name: 'Platinum', range: 'Lv 29-35', boj: 'Platinum 4 ~ Diamond 4', color: 'text-cyan-500', desc: '효율적인 해법을 찾는 전문가' },
        { name: 'Diamond', range: 'Lv 36-38', boj: 'Diamond 3~1', color: 'text-blue-600', desc: '복잡한 난제 해결사' },
        { name: 'Master', range: 'Lv 39-40', boj: 'Ruby 5~4', color: 'text-purple-500', desc: '알고리즘 마스터' },
        { name: 'Grandmaster', range: 'Lv 41', boj: 'Ruby 3~2', color: 'text-red-600', desc: '초월적인 경지 ⭐' },
        { name: 'Challenger', range: 'Lv 42+', boj: 'Ruby 1, Master+', color: 'text-gradient', desc: '전설적인 경지 🔥' },
    ];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-base-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card w-full max-w-2xl bg-white border-none shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-base-900 to-base-800 p-6 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">등급 시스템 안내</h2>
                            <p className="text-white/60 text-xs font-bold">CoTe Coach Rank System</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8">

                    {/* Intro */}
                    <div className="bg-base-50 p-4 rounded-2xl border border-base-200 flex gap-4 items-start">
                        <Info className="w-5 h-5 text-base-500 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-base-600 leading-relaxed">
                                코테코치 레벨은 <span className="font-bold text-base-900">Solved.ac 티어</span>를 기반으로 하며, <span className="font-bold text-base-900">앱 내 활동량</span>이 합산되어 결정됩니다.
                            </p>
                            <div className="text-xs font-bold text-base-400 bg-white p-2 rounded-lg inline-block border border-base-100">
                                최종 레벨 = 백준 티어(Base) + 추가 활동 레벨(Delta)
                            </div>
                        </div>
                    </div>

                    {/* Tier Table */}
                    <div className="space-y-4">
                        {tiers.map((tier) => (
                            <div key={tier.name} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-base-50 transition-colors border border-transparent hover:border-base-100 group">
                                <div className="shrink-0 w-16 flex justify-center">
                                    <TierBadge tier={`${tier.name} ${tier.name === 'Novice' ? 1 : 1}`} size="md" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-lg font-black ${tier.color}`}>{tier.name}</h3>
                                        <span className="text-xs font-bold text-base-400 bg-base-100 px-2 py-0.5 rounded-full">{tier.range}</span>
                                    </div>
                                    <p className="text-sm font-bold text-base-500">{tier.desc}</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-base-400 uppercase tracking-wider">Solved.ac 기준</p>
                                        <p className="text-sm font-bold text-base-700">{tier.boj || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-base-100 bg-base-50 text-center">
                    <p className="text-xs font-medium text-base-400">
                        열심히 문제를 풀고 더 높은 티어에 도전해보세요!
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default TierGuideModal;
