
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
  // PHASE 2: Modération renforcée du titre du lien
  const titleModeration = ContentModerationService.moderateText(link.title);
  if (!titleModeration.isAppropriate) {
    console.warn(`🚫 Lien bloqué - Titre inapproprié: ${link.title} - ${titleModeration.reason}`);
    return null; // Ne pas afficher le lien
  }

  // PHASE 2: Validation ultra-stricte de l'URL avec vérification en temps réel
  const urlValidation = ContentModerationService.validateUrl(link.url);
  
  // Si l'URL n'est pas valide, créer une recherche sécurisée
  const finalUrl = urlValidation.isValid ? 
    (link.url.startsWith('http') ? link.url : `https://${link.url}`) : 
    ContentModerationService.generateSafeSearchUrl(
      link.title, 
      fallbackSearchQuery?.toLowerCase().includes('acheter') || 
      fallbackSearchQuery?.toLowerCase().includes('achat')
    );

  const isSearchUrl = finalUrl.includes('google.fr/search');

  // Log de sécurité pour le monitoring
  if (!urlValidation.isValid) {
    console.log(`🔄 Redirection vers recherche sécurisée - URL bloquée: ${link.url} - Raison: ${urlValidation.reason}`);
  }

  return (
    <a 
      href={finalUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      title={isSearchUrl ? `Rechercher: ${link.title}` : link.title}
      // PHASE 2: Attribut de sécurité supplémentaire
      data-link-validated="true"
      data-original-valid={urlValidation.isValid}
    >
      <span className="flex items-center gap-2 truncate flex-1 text-gray-700 dark:text-gray-300">
        {isSearchUrl ? 
          <Search className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" /> : 
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        }
        {link.description || link.title}
        {/* PHASE 2: Indicateur visuel pour les liens redirigés vers la recherche */}
        {isSearchUrl && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1" title="Lien sécurisé - recherche Google">
            🔒
          </span>
        )}
      </span>
    </a>
  );
};

export default ValidatedLink;
