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

  // Helper functions for date formatting
  const formatDateOnly = (timestamp: number | string | undefined) => {
    if (!timestamp) return 'Date inconnue';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (timestamp: number | string | undefined) => {
    if (!timestamp) return 'Date et heure inconnues';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get creation info
  const creationTimestamp = currentDecision?.timestamp;
  const author = currentDecision?.createdByName || 'Utilisateur';

  // Get update info
  const updateTimestamp = currentDecision?.updatedAt || result.realTimeData?.timestamp;
  const updatedBy = currentDecision?.updatedByName || 'Utilisateur';
  const hasUpdates = !!currentDecision?.updatedAt || !!result.realTimeData?.timestamp;

  // Combine all sources for comprehensive display
  const getAllSources = () => {
    const sources = [
      ...(result.realTimeData?.sources || []),
      ...(result.infoLinks?.map(link => ({ url: link.url, title: link.title })) || []),
      ...(result.workspaceData?.documentSources || [])
    ];
    
    // Deduplicate by URL
    const uniqueUrls = new Set<string>();
    return sources.filter(source => {
      const url = typeof source === 'string' ? source : source.url;
      if (uniqueUrls.has(url)) return false;
      uniqueUrls.add(url);
      return true;
    }).map(source => typeof source === 'string' ? { url: source, title: undefined } : source);
  };
  
  const allSources = getAllSources();

  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-2 ${className}`}>
        {/* Creation and Update Info */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Créé le</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted cursor-help">
                  {formatDateOnly(creationTimestamp)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Créé le {formatDateTime(creationTimestamp)} par {author}</p>
              </TooltipContent>
            </Tooltip>
            <span>par {author}</span>
            {hasUpdates && (
              <>
                <span>, mis à jour le</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">
                      {formatDateOnly(updateTimestamp)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mis à jour le {formatDateTime(updateTimestamp)} par {updatedBy}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Sources Badge - Always display for transparency */}
        <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
          <CollapsibleTrigger asChild>
            <Badge 
              variant="secondary" 
              className="w-fit cursor-pointer flex items-center gap-2 hover:bg-muted"
            >
              <Database className="h-3 w-3" />
              {allSources.length} source{allSources.length > 1 ? 's' : ''}
              {isSourcesExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Badge>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <div className="space-y-1 pl-2 border-l-2 border-muted">
              {allSources.length === 0 ? (
                <div className="text-xs text-muted-foreground">Aucune source externe utilisée</div>
              ) : (
                allSources.map((source, index) => (
                  <div key={index} className="text-xs">
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {source.title || (source.url.length > 50 ? `${source.url.substring(0, 50)}...` : source.url)}
                    </a>
                  </div>
                ))
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
};