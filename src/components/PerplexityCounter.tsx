import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, Zap } from 'lucide-react';

interface PerplexityCall {
  query: string;
  context?: string;
  timestamp: number;
}

export const PerplexityCounter: React.FC = () => {
  const [callCount, setCallCount] = useState(0);
  const [recentCalls, setRecentCalls] = useState<PerplexityCall[]>([]);

  useEffect(() => {
    const handlePerplexityCall = (event: CustomEvent<PerplexityCall>) => {
      setCallCount(prev => prev + 1);
      setRecentCalls(prev => [
        { ...event.detail },
        ...prev.slice(0, 4) // Keep last 5 calls
      ]);
    };

    window.addEventListener('perplexity-call', handlePerplexityCall as EventListener);

    return () => {
      window.removeEventListener('perplexity-call', handlePerplexityCall as EventListener);
    };
  }, []);

  const resetCounter = () => {
    setCallCount(0);
    setRecentCalls([]);
  };

  if (callCount === 0) return null;

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Perplexity API Calls
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {callCount}
            </Badge>
          </div>
          <button
            onClick={resetCounter}
            className="text-xs text-orange-600 hover:text-orange-800"
          >
            Reset
          </button>
        </div>
        
        {recentCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-orange-700 font-medium">Recent queries:</p>
            {recentCalls.map((call, index) => (
              <div key={index} className="text-xs text-orange-600 truncate">
                <Zap className="inline h-3 w-3 mr-1" />
                {call.query.substring(0, 50)}...
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};