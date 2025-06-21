
import React, { useState, useEffect } from 'react';

interface AnimatedPlaceholderProps {
  placeholders: string[];
  interval?: number;
}

export const AnimatedPlaceholder: React.FC<AnimatedPlaceholderProps> = ({
  placeholders,
  interval = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (placeholders.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % placeholders.length
        );
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(intervalId);
  }, [placeholders.length, interval]);

  return (
    <span 
      className={`transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-50'
      }`}
    >
      {placeholders[currentIndex]}
    </span>
  );
};
