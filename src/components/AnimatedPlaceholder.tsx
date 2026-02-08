
import React, { useState, useEffect } from 'react';
import { useContextualContent } from '@/hooks/useContextualContent';

interface AnimatedPlaceholderProps {
  placeholders?: string[];
  interval?: number;
  className?: string;
  /** Interligne serré (line-height: 1) pour aligner le placeholder sur le texte saisi */
  tightLineHeight?: boolean;
}

export const AnimatedPlaceholder: React.FC<AnimatedPlaceholderProps> = ({
  placeholders,
  interval = 3000,
  className,
  tightLineHeight = false
}) => {
  const { getExamples } = useContextualContent();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Utiliser les exemples contextuels du hook useContextualContent
  const contextualExamples = getExamples().map(example => 
    example.replace(/^Ex: /, '')
  );

  const finalPlaceholders = placeholders || contextualExamples;

  useEffect(() => {
    if (finalPlaceholders.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % finalPlaceholders.length
        );
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(intervalId);
  }, [finalPlaceholders.length, interval]);

  return (
    <span 
      className={`font-semibold transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-50'
      } ${className ?? ''}`}
      style={tightLineHeight ? { lineHeight: 1.25 } : undefined}
    >
      {finalPlaceholders[currentIndex]}
    </span>
  );
};
