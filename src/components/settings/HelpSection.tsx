import React from 'react';
import { ExternalLink } from 'lucide-react';

interface HelpSectionProps {
    onOpenContact: () => void;
}

const HelpSection: React.FC<HelpSectionProps> = ({ onOpenContact }) => {
    return (
        <div className="bg-gradient-to-br from-base-900 to-base-800 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-lg font-black mb-2">도움이 필요하신가요?</h3>
                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                    계정 설정이나 서비스 이용에 어려움이 있다면 언제든 문의해주세요.
                </p>
                <button
                    onClick={onOpenContact}
                    className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                    <ExternalLink size={14} />
                    문의하기
                </button>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>
    );
};

export default HelpSection;
