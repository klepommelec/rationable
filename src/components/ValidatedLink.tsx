
import React from 'react';
import { ExternalLink, Search } from 'lucide-react';
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
      return ['http:', 'https:'].includes(urlObj.protocol) && !url.includes('example.com');
    } catch {
      return false;
    }
  };

  const generateFallbackUrl = (title: string, query?: string): string => {
    const searchQuery = encodeURIComponent(query || title);
    
    // Check if it's a shopping-related link
    if (title.toLowerCase().includes('achat') || 
        title.toLowerCase().includes('acheter') || 
        title.toLowerCase().includes('prix') ||
        title.toLowerCase().includes('comparer')) {
      return `https://www.google.fr/search?q=${searchQuery}&tbm=shop`;
    }
    
    // Default to regular Google search
    return `https://www.google.fr/search?q=${searchQuery}`;
  };

  const finalUrl = isValidUrl(link.url) ? 
    (link.url.startsWith('http') ? link.url : `https://${link.url}`) : 
    generateFallbackUrl(link.title, fallbackSearchQuery);

  const isSearchUrl = finalUrl.includes('google.fr/search');

  return (
    <a 
      href={finalUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      title={isSearchUrl ? `Rechercher: ${link.title}` : link.title}
    >
      {link.title}
      {isSearchUrl ? <Search className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
    </a>
  );
};

export default ValidatedLink;
