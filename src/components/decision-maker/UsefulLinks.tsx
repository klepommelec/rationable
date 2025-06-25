
import React from 'react';
import { Link, ExternalLink } from 'lucide-react';
import { ILink } from '@/types/decision';
import ValidatedLink from '../ValidatedLink';

interface UsefulLinksProps {
  infoLinks?: ILink[];
  shoppingLinks?: ILink[];
  dilemma?: string;
  recommendation?: string;
}

export const UsefulLinks: React.FC<UsefulLinksProps> = ({
  infoLinks,
  shoppingLinks,
  dilemma,
  recommendation
}) => {
  if ((!infoLinks || infoLinks.length === 0) && (!shoppingLinks || shoppingLinks.length === 0)) {
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {infoLinks && infoLinks.length > 0 && (
          <div className="space-y-3">
            <h4 
              className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 flex items-center gap-2"
              id="info-links-heading"
            >
              <span className="text-base sm:text-lg" aria-hidden="true">📚</span>
              Ressources d'information
            </h4>
            <div 
              className="space-y-2"
              role="list"
              aria-labelledby="info-links-heading"
            >
              {infoLinks.map((link, index) => (
                <div 
                  key={index}
                  role="listitem"
                  className="group"
                >
                  <ValidatedLink 
                    link={link} 
                    fallbackSearchQuery={dilemma} 
                    className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-muted hover:border-gray-300 dark:hover:border-gray-600 text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-offset-2" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
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
                    fallbackSearchQuery={`acheter ${recommendation}`} 
                    className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md group-focus-within:ring-2 group-focus-within:ring-green-500 group-focus-within:ring-offset-2" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
