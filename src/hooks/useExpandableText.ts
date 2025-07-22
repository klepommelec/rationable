
import { useState } from 'react';

export const useExpandableText = (text: string, maxLength: number = 300) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? text.slice(0, maxLength) 
    : text;
  
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  return {
    displayText,
    isExpanded,
    shouldTruncate,
    toggleExpanded
  };
};
