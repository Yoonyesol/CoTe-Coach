import React from 'react';
import { ExternalLink, Zap, Flame, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type RecommendationType = 'WARM_UP' | 'MAIN' | 'CHALLENGE';

interface ProblemCardProps {
  type: RecommendationType;
  title: string;
  platform: string;
  difficulty: string;
  tags: string[];
  problemUrl: string;
}

const typeStyles = {
  WARM_UP: {
    bg: 'bg-sage-light',
    border: 'border-sage',
    icon: <Zap className="w-5 h-5 text-sage-dark" />,
    label: '워밍업',
    textColor: 'text-sage-dark'
  },
  MAIN: {
    bg: 'bg-misty-light',
    border: 'border-misty',
    icon: <Flame className="w-5 h-5 text-misty-dark" />,
    label: '메인 공략',
    textColor: 'text-misty-dark'
  },
  CHALLENGE: {
    bg: 'bg-lavender-light',
    border: 'border-lavender',
    icon: <Trophy className="w-5 h-5 text-lavender-dark" />,
    label: '챌린지',
    textColor: 'text-lavender-dark'
  }
};

const ProblemCard: React.FC<ProblemCardProps> = ({ type, title, platform, difficulty, tags, problemUrl }) => {
  const style = typeStyles[type];

  return (
    <div className={cn(
      "glass-card p-6 border transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl flex flex-col justify-between h-full group",
      style.border
    )}>
      <div className="space-y-4">
        {/* Card Header: Type Label */}
        <div className="flex justify-between items-center">
          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black", style.bg, style.textColor)}>
            {style.icon}
            {style.label}
          </div>
          <span className="text-xs font-bold text-base-400">{platform}</span>
        </div>

        {/* Card Body: Problem Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-black text-base-800 line-clamp-2 leading-tight group-hover:text-misty-dark transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-sm font-bold text-base-500">{difficulty}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-white/50 rounded-lg text-xs font-medium text-base-600 border border-white/50">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Action */}
      <div className="mt-6 pt-4 border-t border-white/30 flex items-center justify-between">
        <span className="text-xs font-bold text-base-400 tracking-tight underline cursor-pointer hover:text-base-600 font-sans">
          복습 로그 작성
        </span>
        <a
          href={problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm font-sans",
            type === 'CHALLENGE' ? 'bg-base-900 text-white' : 'bg-white text-base-800 hover:bg-base-50'
          )}
        >
          해결하기
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default ProblemCard;
