import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, Database, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { IResult } from '@/types/decision';

interface DataAccuracyIndicatorProps {
  result: IResult;
  currentDecision?: any;
  className?: string;
}

export const DataAccuracyIndicator: React.FC<DataAccuracyIndicatorProps> = ({ 
  result, 
  currentDecision,
  className = '' 
}) => {
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);

  // Get timestamp - prioritize realTimeData.timestamp, fallback to currentDecision.timestamp
  const getTimestamp = () => {
    if (result.realTimeData?.timestamp) {
      return result.realTimeData.timestamp;
    }
    if (currentDecision?.timestamp) {
      return new Date(currentDecision.timestamp).toISOString();
    }
    return null;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get sources count and sources list
  const sourcesCount = result.realTimeData?.sourcesCount || 0;
  const sources = result.realTimeData?.sources || [];
  const timestamp = getTimestamp();

  return (
    <div className={`space-y-3 p-4 rounded-lg bg-muted/30 border ${className}`}>
      {/* Header with timestamp and sources count */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {timestamp && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Mis à jour le {formatTimestamp(timestamp)}</span>
          </div>
        )}
        
        {sourcesCount > 0 && (
          <Badge variant="outline" className="w-fit">
            <Database className="h-3 w-3 mr-1" />
            {sourcesCount} source{sourcesCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Sources toggle */}
      {sources.length > 0 && (
        <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span>Voir les sources</span>
              {isSourcesExpanded ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="pl-2 border-l-2 border-muted">
              {sources.map((source, index) => {
                // Try to extract URL from source string
                const urlMatch = source.match(/(https?:\/\/[^\s]+)/);
                const url = urlMatch ? urlMatch[1] : null;
                const displayText = source.replace(/(https?:\/\/[^\s]+)/, '').trim() || source;

                return (
                  <div key={index} className="text-xs text-muted-foreground">
                    {url ? (
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{displayText}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{source}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};