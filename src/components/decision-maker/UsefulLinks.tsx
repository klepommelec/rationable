
import React from 'react';
import { Link, ExternalLink } from 'lucide-react';
import { ILink, ISocialContent } from '@/types/decision';
import ValidatedLink from '../ValidatedLink';
import YouTubeVideoCard from '../YouTubeVideoCard';
import { I18nService } from '@/services/i18nService';

interface UsefulLinksProps {
  infoLinks?: ILink[];
  shoppingLinks?: ILink[];
  socialContent?: ISocialContent;
  dilemma?: string;
  recommendation?: string;
}

export const UsefulLinks: React.FC<UsefulLinksProps> = ({
  infoLinks,
  shoppingLinks,
  socialContent,
  dilemma,
  recommendation
}) => {
  const currentLanguage = I18nService.getCurrentLanguage();
  const contextText = `${dilemma || ''} ${recommendation || ''}`;
  const detectedVertical = I18nService.detectVertical(contextText, currentLanguage);
  
  // Filter and sort links by relevance
  const filterRelevantLinks = (links: ILink[]) => {
    if (!detectedVertical) return links;
    
    return links
      .map(link => {
        const linkText = `${link.title} ${link.description || ''}`;
        const linkVertical = I18nService.detectVertical(linkText, currentLanguage);
        const isRelevant = !linkVertical || linkVertical === detectedVertical;
        return { ...link, relevanceScore: isRelevant ? 1 : 0 };
      })
      .filter(link => link.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8); // Limit to most relevant links
  };
  
  const filteredShoppingLinks = shoppingLinks ? filterRelevantLinks(shoppingLinks) : [];
  const hasContent = (filteredShoppingLinks.length > 0) || 
                    (socialContent?.youtubeVideos && socialContent.youtubeVideos.length > 0);
  
  const shouldShowFallbackSearch = filteredShoppingLinks.length === 0;
  
  if (!hasContent && !shouldShowFallbackSearch) {
    return null;
  }

  return (
    <section 
      className="animate-fade-in"
      role="region"
      aria-labelledby="useful-links-heading"
    >
      <h3 
        id="useful-links-heading"
        className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white"
      >
        <Link className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
        Liens utiles
      </h3>
      
      <div className="space-y-6">
        {/* Vidéos YouTube populaires */}
        {socialContent?.youtubeVideos && socialContent.youtubeVideos.length > 0 && (
          <div className="space-y-3">
            <h4 
              className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 flex items-center gap-2"
              id="youtube-videos-heading"
            >
              <span className="text-base sm:text-lg" aria-hidden="true">📺</span>
              Vidéos populaires
            </h4>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              role="list"
              aria-labelledby="youtube-videos-heading"
            >
              {socialContent.youtubeVideos.map((video) => (
                <div key={video.id} role="listitem">
                  <YouTubeVideoCard video={video} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liens d'achat */}
        {filteredShoppingLinks.length > 0 && (
          <div className="space-y-3">
            <h4 
              className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 flex items-center gap-2"
              id="shopping-links-heading"
            >
              <span className="text-base sm:text-lg" aria-hidden="true">
                {detectedVertical === 'dining' ? '🍽️' : 
                 detectedVertical === 'accommodation' ? '🏨' : 
                 detectedVertical === 'travel' ? '✈️' : '🛒'}
              </span>
              {detectedVertical === 'dining' ? (
                currentLanguage === 'fr' ? 'Réservations' : 
                currentLanguage === 'es' ? 'Reservas' : 
                currentLanguage === 'it' ? 'Prenotazioni' : 
                currentLanguage === 'de' ? 'Reservierungen' : 'Reservations'
              ) : detectedVertical === 'accommodation' ? (
                currentLanguage === 'fr' ? 'Hébergements' : 
                currentLanguage === 'es' ? 'Alojamientos' : 
                currentLanguage === 'it' ? 'Alloggi' : 
                currentLanguage === 'de' ? 'Unterkünfte' : 'Accommodations'
              ) : (
                currentLanguage === 'fr' ? 'Liens d\'achat' : 
                currentLanguage === 'es' ? 'Enlaces de compra' : 
                currentLanguage === 'it' ? 'Link per acquisti' : 
                currentLanguage === 'de' ? 'Einkaufslinks' : 'Shopping Links'
              )}
            </h4>
            <div 
              className="space-y-2"
              role="list"
              aria-labelledby="shopping-links-heading"
            >
              {filteredShoppingLinks.map((link, index) => (
                <div 
                  key={index}
                  role="listitem"
                  className="group"
                >
                  <ValidatedLink 
                    link={link} 
                    fallbackSearchQuery={I18nService.buildVerticalQuery(recommendation || '', detectedVertical, currentLanguage)} 
                    contextText={contextText}
                    className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md group-focus-within:ring-2 group-focus-within:ring-green-500 group-focus-within:ring-offset-2" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback search when no shopping links */}
        {shouldShowFallbackSearch && recommendation && (
          <div className="space-y-3">
            <h4 
              className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 flex items-center gap-2"
              id="fallback-search-heading"
            >
              <span className="text-base sm:text-lg" aria-hidden="true">
                {detectedVertical === 'dining' ? '🗺️' : '🔍'}
              </span>
              {detectedVertical === 'dining' ? (
                currentLanguage === 'fr' ? 'Recherche locale' : 
                currentLanguage === 'es' ? 'Búsqueda local' : 
                currentLanguage === 'it' ? 'Ricerca locale' : 
                currentLanguage === 'de' ? 'Lokale Suche' : 'Local Search'
              ) : (
                currentLanguage === 'fr' ? 'Recherche suggérée' : 
                currentLanguage === 'es' ? 'Búsqueda sugerida' : 
                currentLanguage === 'it' ? 'Ricerca suggerita' : 
                currentLanguage === 'de' ? 'Vorgeschlagene Suche' : 'Suggested Search'
              )}
            </h4>
            <div 
              className="space-y-2"
              role="list"
              aria-labelledby="fallback-search-heading"
            >
              <div className="group">
                <ValidatedLink 
                  link={{
                    title: detectedVertical === 'dining' ? 
                      `${currentLanguage === 'fr' ? 'Trouver' : 
                        currentLanguage === 'es' ? 'Encontrar' : 
                        currentLanguage === 'it' ? 'Trovare' : 
                        currentLanguage === 'de' ? 'Finden' : 'Find'} "${recommendation}"` :
                      `${currentLanguage === 'fr' ? 'Rechercher' : 
                        currentLanguage === 'es' ? 'Buscar' : 
                        currentLanguage === 'it' ? 'Cercare' : 
                        currentLanguage === 'de' ? 'Suchen' : 'Search'} "${recommendation}"`,
                    url: '',
                    description: detectedVertical === 'dining' ? 
                      (currentLanguage === 'fr' ? 'Recherche géographique' : 
                       currentLanguage === 'es' ? 'Búsqueda geográfica' : 
                       currentLanguage === 'it' ? 'Ricerca geografica' : 
                       currentLanguage === 'de' ? 'Geografische Suche' : 'Geographic search') :
                      (currentLanguage === 'fr' ? 'Recherche contextuelle' : 
                       currentLanguage === 'es' ? 'Búsqueda contextual' : 
                       currentLanguage === 'it' ? 'Ricerca contestuale' : 
                       currentLanguage === 'de' ? 'Kontextuelle Suche' : 'Contextual search')
                  }} 
                  fallbackSearchQuery={I18nService.buildVerticalQuery(recommendation, detectedVertical, currentLanguage)} 
                  contextText={contextText}
                  className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-offset-2" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
