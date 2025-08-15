import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Database, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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

  // Get creation timestamp from currentDecision
  const getCreationTimestamp = () => {
    if (currentDecision?.createdAt) {
      return currentDecision.createdAt;
    }
    if (currentDecision?.timestamp) {
      return currentDecision.timestamp;
    }
    return null;
  };

  // Get update timestamp - prioritize realTimeData.timestamp
  const getUpdateTimestamp = () => {
    if (result.realTimeData?.timestamp) {
      return result.realTimeData.timestamp;
    }
    return null;
  };

  const formatDateOnly = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (timestamp: string) => {
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
  const creationTimestamp = getCreationTimestamp();
  const updateTimestamp = getUpdateTimestamp();
  const author = currentDecision?.author || currentDecision?.user_id || 'Système';
  const updatedBy = currentDecision?.updatedBy || 'Système';

  return (
    <TooltipProvider>
      <div className={`p-3 rounded-lg bg-muted/30 border ${className}`}>
        <div className="flex items-center justify-between gap-3">
          {/* Creation and update info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {creationTimestamp && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">
                    Créé le {formatDateOnly(creationTimestamp)} par {author}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div>Créé le {formatDateTime(creationTimestamp)}</div>
                </TooltipContent>
              </Tooltip>
            )}
            
            {updateTimestamp && (
              <>
                <span>, </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-default hover:text-foreground transition-colors">
                      mis à jour le {formatDateOnly(updateTimestamp)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <div>Mis à jour le {formatDateTime(updateTimestamp)} par {updatedBy}</div>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
          
          {/* Sources badge - clickable */}
          {sourcesCount > 0 && (
            <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
              <CollapsibleTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Database className="h-3 w-3 mr-1" />
                  {sourcesCount} source{sourcesCount > 1 ? 's' : ''}
                  {isSourcesExpanded ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>

        {/* Sources list */}
        {sources.length > 0 && (
          <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
            <CollapsibleContent className="mt-3">
              <div className="pl-3 border-l-2 border-muted space-y-2">
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
    </TooltipProvider>
  );
};