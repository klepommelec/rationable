
import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface EmojiPickerProps {
  emoji: string;
  setEmoji: (emoji: string) => void;
}

const EMOJIS = ['🤔', '💻', '✈️', '🏠', '🎉', '💡', '💸', '❤️', '🍔', '📚', '🏆', '🤷'];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ emoji, setEmoji }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-4xl w-14 h-14 rounded-full hover:bg-white/10 shrink-0">
          {emoji}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-slate-800 border-slate-700">
        <div className="grid grid-cols-6 gap-1">
          {EMOJIS.map((e) => (
            <Button
              key={e}
              variant="ghost"
              size="icon"
              className="text-2xl rounded-md hover:bg-slate-700"
              onClick={() => {
                setEmoji(e);
                setIsOpen(false);
              }}
            >
              {e}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
