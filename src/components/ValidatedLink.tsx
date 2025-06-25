
import React from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { ILink } from '@/types/decision';
import { ContentModerationService } from '@/services/contentModerationService';

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
  // Modération du titre du lien
  const titleModeration = ContentModerationService.moderateText(link.title);
  if (!titleModeration.isAppropriate) {
    console.warn(`Lien bloqué - Titre inapproprié: ${link.title}`);
    return null; // Ne pas afficher le lien
  }

  // Validation stricte de l'URL
  const urlValidation = ContentModerationService.validateUrl(link.url);
  
  const finalUrl = urlValidation.isValid ? 
    (link.url.startsWith('http') ? link.url : `https://${link.url}`) : 
    ContentModerationService.generateSafeSearchUrl(link.title, fallbackSearchQuery?.includes('acheter'));

  const isSearchUrl = finalUrl.includes('google.fr/search');

  return (
    <a 
      href={finalUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      title={isSearchUrl ? `Rechercher: ${link.title}` : link.title}
    >
      <span className="flex items-center gap-2 truncate flex-1 text-gray-700 dark:text-gray-300">
        {isSearchUrl ? 
          <Search className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" /> : 
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        }
        {link.description || link.title}
      </span>
    </a>
  );
};

export default ValidatedLink;
