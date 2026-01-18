import React from 'react';
import { ExternalLink, Zap, Flame, Trophy, Play, Pause, Timer as TimerIcon, Brain, CheckCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useUserStore } from '../../store/useUserStore';
import { useModalStore } from '../../store/useModalStore';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { ProblemCardProps } from '../../types/components';
import { getLocalDateString } from '../../lib/dateUtils';

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

const ProblemCard: React.FC<ProblemCardProps> = ({ type, title, platform, difficulty, level, tags, problemUrl, onReview }) => {
  const style = typeStyles[type];
  const { timer, startTimer, stopTimer, getTotalElapsed, studyLogs } = useUserStore();
  const { showAlert } = useModalStore();

  const isCurrent = timer.currentProblemId === title;
  const isOtherRunning = timer.isRunning && !isCurrent;
  const elapsed = getTotalElapsed(title);
  const isCompleted = studyLogs.some(log => log.problemId === title);

  const formatTime = (ms: number) => {
    if (ms === 0) return "0:00";
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

    // Auto-add to Daily Tasks (Solving List) when starting timer
    if (!isCurrent || !timer.isRunning) {
      const { dailyTasks, addDailyTask } = useUserStore.getState();
      const isAlreadyTracking = dailyTasks.some(t => t.problemId === title || t.problemTitle === title);

      if (!isAlreadyTracking) {
        const dateString = getLocalDateString(new Date());
        addDailyTask({
          problemId: title,
          problemTitle: title,
          site: platform as any,
          difficulty: difficulty,
          targetDate: dateString,
          tags: [...tags, '__auto']
        });
      }
    }

    if (isCurrent && timer.isRunning) {
      stopTimer();
    } else {
      startTimer(title);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "glass-card p-6 bg-white border border-base-100 transition-all duration-300 hover:shadow-xl flex flex-col h-full group font-sans",
        isCurrent && "ring-2 ring-misty shadow-xl",
        isOtherRunning && "opacity-75 saturate-50",
        isCompleted && "opacity-80 grayscale-[0.3]"
      )}
    >
      <div className="space-y-4">
        {/* Card Header: Type Label */}
        <div className="flex justify-between items-center">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
            isCompleted ? "bg-sage-light text-sage-dark" : style.bg,
            isCompleted ? "text-sage-dark" : style.textColor
          )}>
            {isCompleted ? <CheckCircle className="w-4 h-4" /> : (isCurrent && timer.isRunning ? <Flame className="w-4 h-4 animate-pulse" /> : style.icon)}
            <span className="truncate">{isCompleted ? '풀이 완료' : (isCurrent && timer.isRunning ? '풀이 중...' : style.label)}</span>
          </div>
          <span className="text-[10px] font-black text-base-400 uppercase tracking-widest">{platform}</span>
        </div>

        {/* Problem Title */}
        <div>
          <a
            href={isCompleted ? '#' : problemUrl}
            target={isCompleted ? undefined : "_blank"}
            rel="noopener noreferrer"
            onClick={(e) => isCompleted && e.preventDefault()}
            className={cn(
              "inline-flex items-center gap-1.5 text-lg font-black text-base-900 leading-tight transition-colors hover:text-misty-dark",
              isCompleted && "cursor-default hover:text-base-900"
            )}
          >
            <span className="line-clamp-2">{title}</span>
            {!isCompleted && <ExternalLink className="w-4 h-4 text-base-300 shrink-0" />}
          </a>
          <p className="text-xs font-bold text-base-400 mt-1">{difficulty} (Lv.{level})</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span key={i} className="text-[10px] font-bold text-base-400 bg-base-50 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Action */}
      <div className="mt-auto pt-4 border-t border-base-50 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-base-400">
            <TimerIcon className="w-3.5 h-3.5" />
            <span>{elapsed > 0 ? `${formatTime(elapsed)} 소요됨` : '기록 없음'}</span>
          </div>
          {isCompleted && (
            <span className="text-[10px] font-black text-sage-dark bg-sage-light px-1.5 py-0.5 rounded">PASSED</span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Start/Pause Timer */}
          <button
            onClick={handleStart}
            disabled={isOtherRunning || isCompleted}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm",
              isCurrent && timer.isRunning ? "bg-base-900 text-white" : "bg-base-100 text-base-600 hover:bg-base-200",
              (isOtherRunning || isCompleted) && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {isCurrent && timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isCurrent && timer.isRunning ? '일시정지' : (elapsed > 0 ? '계속하기' : '시작')}
          </button>

          {/* Complete & Review */}
          {!isCompleted && (
            <button
              onClick={() => onReview({ id: title, title, platform, difficulty })}
              className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black bg-misty text-white hover:bg-misty-dark transition-all active:scale-95 shadow-md shadow-misty/20"
            >
              <Brain className="w-4 h-4" />
              학습 완료 & 기록
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProblemCard;
