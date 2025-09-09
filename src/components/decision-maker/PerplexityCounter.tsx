import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

export const PerplexityCounter: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Load count from localStorage
    const stored = localStorage.getItem('perplexity_call_count');
    if (stored) {
      setCount(parseInt(stored, 10));
    }

    // Listen for Perplexity calls (increment counter)
    const handlePerplexityCall = () => {
      setCount(prev => {
        const newCount = prev + 1;
        localStorage.setItem('perplexity_call_count', newCount.toString());
        return newCount;
      });
    };

    // Custom event listener for Perplexity calls
    window.addEventListener('perplexity-call', handlePerplexityCall);

    return () => {
      window.removeEventListener('perplexity-call', handlePerplexityCall);
    };
  }, []);

  if (count === 0) return null;

  return (
    <Badge variant="outline" className="gap-1">
      <Globe className="h-3 w-3" />
      {count} appels Perplexity
    </Badge>
  );
};