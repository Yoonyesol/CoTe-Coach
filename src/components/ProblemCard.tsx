import React from 'react';
import { ExternalLink, Zap, Flame, Trophy, Play, Pause, Timer as TimerIcon, Brain, CheckCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUserStore } from '../store/useUserStore';
import { useModalStore } from '../store/useModalStore';
import { motion } from 'framer-motion';

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
  onReview: (problem: { title: string; platform: string; difficulty: string }) => void;
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

const ProblemCard: React.FC<ProblemCardProps> = ({ type, title, platform, difficulty, tags, problemUrl, onReview }) => {
  const style = typeStyles[type];
  const { timer, startTimer, stopTimer, getTotalElapsed, studyLogs } = useUserStore();
  const { showAlert } = useModalStore();

  const isCurrent = timer.currentProblemId === title;
  const isOtherRunning = timer.isRunning && !isCurrent;
  const elapsed = getTotalElapsed(title);
  const isCompleted = studyLogs.some(log => log.problemId === title);

  const formatTime = (ms: number) => {
    if (ms === 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (isOtherRunning) {
      showAlert(
        "타이머 중복",
        "이미 다른 문제를 풀이 중입니다. 현재 진행 중인 타이머를 먼저 중단해주세요!"
      );
      return;
    }

    if (isCurrent && timer.isRunning) {
      stopTimer();
    } else {
      const success = startTimer(title);
      if (!success && typeof success === 'boolean') {
        showAlert("오류", "타이머를 시작할 수 없습니다.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cn(
        "glass-card p-6 border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between h-full group font-sans",
        style.border,
        isCurrent && "ring-4 ring-misty shadow-2xl scale-[1.02]",
        isOtherRunning && "opacity-60 saturate-50",
        isCompleted && "opacity-80 grayscale-[0.3]"
      )}
    >
      <div className="space-y-4">
        {/* Card Header: Type Label */}
        <div className="flex justify-between items-center">
          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black",
            isCompleted ? "bg-sage-light text-sage-dark" : style.bg,
            isCompleted ? "text-sage-dark" : style.textColor
          )}>
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : (isCurrent && timer.isRunning ? <Flame className="w-4 h-4 animate-pulse" /> : style.icon)}
            {isCompleted ? '풀이 완료' : (isCurrent && timer.isRunning ? '문제 풀이 중...' : style.label)}
          </div>
          <div className="flex items-center gap-2">
            {elapsed > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-base-100 rounded-lg text-[10px] font-black text-base-500">
                <TimerIcon className="w-3 h-3" />
                {formatTime(elapsed)}
              </div>
            )}
            <span className="text-xs font-bold text-base-400">{platform}</span>
          </div>
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
      <div className="mt-6 pt-4 border-t border-white/30 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleStart}
            disabled={isOtherRunning || isCompleted}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer",
              isCurrent && timer.isRunning ? "bg-coral text-white" : "bg-base-100 text-base-600 hover:bg-base-200",
              (isOtherRunning || isCompleted) && "cursor-not-allowed opacity-50"
            )}
          >
            {isCurrent && timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isCurrent && timer.isRunning ? '중단' : (elapsed > 0 ? '이어서 풀기' : '풀이 시작')}
          </button>

          <a
            href={isCompleted ? '#' : problemUrl}
            target={isCompleted ? undefined : "_blank"}
            rel="noopener noreferrer"
            onClick={(e) => isCompleted && e.preventDefault()}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer",
              type === 'CHALLENGE' ? 'bg-base-900 text-white' : 'bg-white border border-base-200 text-base-800 hover:bg-base-50',
              isCompleted && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCompleted ? '제출 완료' : '문제 열기'}
            {!isCompleted && <ExternalLink className="w-4 h-4" />}
          </a>

          {/* Quick Complete Button */}
          {!isCompleted && (
            <button
              onClick={() => onReview({ title, platform, difficulty })}
              className="p-2.5 bg-sage-light text-sage-dark border-2 border-sage/30 rounded-xl hover:bg-sage hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer group"
              title="바로 완료 처리"
            >
              <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Review Submission Button: Only shown when time is recorded and not currently running */}
        {elapsed > 0 && !timer.isRunning && !isCompleted && (
          <button
            onClick={() => onReview({ title, platform, difficulty })}
            className="w-full py-2.5 bg-misty-light text-misty-dark border-2 border-misty/30 rounded-xl text-xs font-black hover:bg-misty hover:text-white transition-all flex items-center justify-center gap-2 animate-in slide-in-from-top-2 cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            복습 로그 작성하고 기록 완료하기
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProblemCard;
