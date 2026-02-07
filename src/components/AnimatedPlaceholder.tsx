
import React, { useState, useEffect } from 'react';
import { useContextualContent } from '@/hooks/useContextualContent';

interface AnimatedPlaceholderProps {
  placeholders?: string[];
  interval?: number;
}

export const AnimatedPlaceholder: React.FC<AnimatedPlaceholderProps> = ({
  placeholders,
  interval = 3000
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
      }`}
    >
      {finalPlaceholders[currentIndex]}
    </span>
  );
};
