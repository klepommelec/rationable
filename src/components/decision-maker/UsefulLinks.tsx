
import React from 'react';
import { Link } from 'lucide-react';
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
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Link className="h-5 w-5" />
        Liens utiles
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {infoLinks && infoLinks.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">📚 Ressources d'information</h4>
            <div className="space-y-2">
              {infoLinks.map((link, index) => (
                <ValidatedLink 
                  key={index} 
                  link={link} 
                  fallbackSearchQuery={dilemma} 
                  className="block p-2 rounded border hover:bg-muted text-sm" 
                />
              ))}
            </div>
          </div>
        )}
        
        {shoppingLinks && shoppingLinks.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">🛒 Liens d'achat</h4>
            <div className="space-y-2">
              {shoppingLinks.map((link, index) => (
                <ValidatedLink 
                  key={index} 
                  link={link} 
                  fallbackSearchQuery={`acheter ${recommendation}`} 
                  className="block p-2 rounded border hover:bg-muted text-sm" 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
