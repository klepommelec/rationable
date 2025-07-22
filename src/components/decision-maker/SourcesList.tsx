
import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ValidatedLink from '@/components/ValidatedLink';

interface SourcesListProps {
  sources: string[];
  className?: string;
}

export const SourcesList: React.FC<SourcesListProps> = ({
  sources,
  className = ""
}) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Limiter à 5 sources max pour éviter l'encombrement
  const displayedSources = sources.slice(0, 5);

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Sources consultées
        </span>
        <Badge variant="secondary" className="text-xs">
          {sources.length}
        </Badge>
      </div>
      
      <div className="grid gap-2">
        {displayedSources.map((source, index) => (
          <a
            key={index}
            href={source}
            className="flex items-center gap-2 p-2 rounded-md border border-border/50 hover:border-border transition-colors group bg-card/50 hover:bg-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
              {extractDomain(source)}
            </span>
          </a>
        ))}
        
        {sources.length > 5 && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{sources.length - 5} autre{sources.length - 5 > 1 ? 's' : ''} source{sources.length - 5 > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
