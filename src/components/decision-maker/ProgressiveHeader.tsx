
import React from 'react';
import { EmojiPicker } from '../EmojiPicker';
import { IProgressiveState } from '@/types/progressive';

interface ProgressiveHeaderProps {
  dilemma: string;
  emoji: string;
  setEmoji: (emoji: string) => void;
  progressiveState: IProgressiveState;
}

export const ProgressiveHeader: React.FC<ProgressiveHeaderProps> = ({
  dilemma,
  emoji,
  setEmoji,
  progressiveState
}) => {
  const isThinking = progressiveState.phase === 'generating-emoji';

  return (
    <div className="flex items-center gap-4 mb-6 animate-fade-in">
      <div className="relative">
        <EmojiPicker emoji={emoji} setEmoji={setEmoji} />
        {isThinking && (
          <div className="absolute -bottom-1 -right-1 flex space-x-0.5">
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
      <h1 className="text-3xl font-bold text-left">{dilemma}</h1>
    </div>
  );
};
