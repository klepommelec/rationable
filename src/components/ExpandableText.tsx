import React, { useState, useRef, useEffect } from 'react';
import { useExpandableText } from '@/hooks/useExpandableText';
import { useI18nUI } from '@/contexts/I18nUIContext';
interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}
export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLength = 300,
  className = ""
}) => {
  const {
    t
  } = useI18nUI();
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Check if text actually exceeds 3 lines after render
  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * 3; // 3 lines
      setShouldTruncate(textRef.current.scrollHeight > maxHeight);
    }
  }, [text]);
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  return <div className={className}>
      <p ref={textRef} className={`text-muted-foreground leading-relaxed break-words ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {shouldTruncate && <button
          onClick={toggleExpanded}
          className="mt-2 text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
        >
          {isExpanded ? t('decision.seeLess') : t('decision.seeMore')}
        </button>}
    </div>;
};