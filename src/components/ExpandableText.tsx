
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useExpandableText } from '@/hooks/useExpandableText';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if text is actually long enough when rendered (more precise check)
  const shouldTruncate = text.length > 200; // More conservative estimate
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className={className}>
      <p className={`text-muted-foreground leading-relaxed break-words ${
        !isExpanded && shouldTruncate 
          ? 'line-clamp-3' 
          : ''
      }`}>
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
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Voir plus
            </>
          )}
        </Button>
      )}
    </div>
  );
};
