
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
  const hasContent = (shoppingLinks && shoppingLinks.length > 0) || 
                    (socialContent?.youtubeVideos && socialContent.youtubeVideos.length > 0);
  
  const shouldShowFallbackSearch = !shoppingLinks || shoppingLinks.length === 0;
  
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
        {shoppingLinks && shoppingLinks.length > 0 && (
          <div className="space-y-3">
            <h4 
              className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 flex items-center gap-2"
              id="shopping-links-heading"
            >
              <span className="text-base sm:text-lg" aria-hidden="true">🛒</span>
              Liens d'achat
            </h4>
            <div 
              className="space-y-2"
              role="list"
              aria-labelledby="shopping-links-heading"
            >
              {shoppingLinks.map((link, index) => (
                <div 
                  key={index}
                  role="listitem"
                  className="group"
                >
                  <ValidatedLink 
                    link={link} 
                    fallbackSearchQuery={I18nService.buildShoppingQuery(recommendation || '', I18nService.getCurrentLanguage())} 
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
              <span className="text-base sm:text-lg" aria-hidden="true">🔍</span>
              Recherche suggérée
            </h4>
            <div 
              className="space-y-2"
              role="list"
              aria-labelledby="fallback-search-heading"
            >
              <div className="group">
                <ValidatedLink 
                  link={{
                    title: `Rechercher "${recommendation}"`,
                    url: '',
                    description: 'Recherche contextuelle'
                  }} 
                  fallbackSearchQuery={I18nService.buildShoppingQuery(recommendation, I18nService.getCurrentLanguage())} 
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
