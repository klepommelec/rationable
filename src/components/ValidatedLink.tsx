
import React from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { ILink } from '@/types/decision';

interface ValidatedLinkProps {
  link: ILink;
  fallbackSearchQuery?: string;
  className?: string;
}

const ValidatedLink: React.FC<ValidatedLinkProps> = ({ 
  link, 
  fallbackSearchQuery, 
  className = "text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5" 
}) => {
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const generateFallbackUrl = (title: string, query?: string): string => {
    const searchQuery = encodeURIComponent(query || title);
    
    // Determine the best fallback based on the link title
    if (title.toLowerCase().includes('amazon')) {
      return `https://www.amazon.fr/s?k=${searchQuery}`;
    }
    if (title.toLowerCase().includes('fnac')) {
      return `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${searchQuery}`;
    }
    if (title.toLowerCase().includes('shopping') || title.toLowerCase().includes('achat')) {
      return `https://shopping.google.com/search?q=${searchQuery}`;
    }
    if (title.toLowerCase().includes('guide') || title.toLowerCase().includes('info')) {
      return `https://www.google.com/search?q=${searchQuery}`;
    }
    
    // Default to Google search
    return `https://www.google.com/search?q=${searchQuery}`;
  };

  const finalUrl = isValidUrl(link.url) ? 
    (link.url.startsWith('http') ? link.url : `https://${link.url}`) : 
    generateFallbackUrl(link.title, fallbackSearchQuery);

  const isOriginalUrl = finalUrl === link.url || finalUrl === `https://${link.url}`;

  return (
    <a 
      href={finalUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      title={isOriginalUrl ? link.title : `Recherche: ${link.title}`}
    >
      {link.title}
      {!isOriginalUrl && <AlertTriangle className="h-3 w-3 text-orange-500" />}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
};

export default ValidatedLink;
