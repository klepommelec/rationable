
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const { t } = useI18nUI();
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

  return (
    <div className={className}>
      <p 
        ref={textRef}
        className={`text-muted-foreground leading-relaxed break-words ${
          !isExpanded && shouldTruncate 
            ? 'line-clamp-3' 
            : ''
        }`}
      >
        {text}
      </p>
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="mt-2 p-0 h-auto font-normal text-primary hover:text-primary/80"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              {t('decision.seeLess')}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              {t('decision.seeMore')}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
