
import React from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { ILink } from '@/types/decision';
import { I18nService } from '@/services/i18nService';

interface ValidatedLinkProps {
  link: ILink;
  fallbackSearchQuery?: string;
  contextText?: string;
  className?: string;
}

// Vertical-specific merchant domains
const VERTICAL_MERCHANT_DOMAINS = {
  // Dining/Restaurant platforms
  dining: {
    global: ['opentable.com', 'resy.com', 'bookatable.com'],
    fr: ['thefork.fr', 'lafourchette.com', 'opentable.fr', 'zomato.com'],
    en: ['opentable.com', 'resy.com', 'bookatable.com', 'zomato.com'],
    es: ['eltenedor.es', 'opentable.es', 'zomato.com'],
    it: ['thefork.it', 'opentable.it', 'zomato.com'],
    de: ['opentable.de', 'bookatable.de', 'zomato.com']
  },
  // Accommodation platforms
  accommodation: {
    global: ['booking.com', 'expedia.com', 'hotels.com', 'airbnb.com', 'tripadvisor.com'],
    fr: ['booking.com', 'expedia.fr', 'hotels.com', 'airbnb.fr'],
    en: ['booking.com', 'expedia.com', 'hotels.com', 'airbnb.com'],
    es: ['booking.com', 'expedia.es', 'hotels.com', 'airbnb.es'],
    it: ['booking.com', 'expedia.it', 'hotels.com', 'airbnb.it'],
    de: ['booking.com', 'expedia.de', 'hotels.com', 'airbnb.de']
  }
};

// International merchant domain whitelist by vertical
const TRUSTED_MERCHANT_DOMAINS = {
  // Global e-commerce
  global: [
    'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.es', 'amazon.it',
    'ebay.com', 'ebay.co.uk', 'ebay.de', 'ebay.fr', 'ebay.es', 'ebay.it',
    'apple.com', 'samsung.com', 'microsoft.com', 'sony.com', 'nike.com', 'adidas.com',
    'booking.com', 'airbnb.com', 'tripadvisor.com'
  ],
  // France
  fr: [
    // E-commerce
    'fnac.com', 'darty.com', 'boulanger.com', 'cdiscount.com', 'carrefour.fr',
    'auchan.fr', 'leclerc.com', 'decathlon.fr', 'leroymerlin.fr', 'ikea.com',
    'zalando.fr', 'vinted.fr', 'leboncoin.fr',
    // Auto
    'toyota.fr', 'peugeot.fr', 'renault.fr', 'citroen.fr', 'bmw.fr', 'audi.fr',
    'lacentrale.fr', 'autoscout24.fr', 'paruvendu.fr',
    // Travel
    'sncf-connect.com', 'airfrance.fr', 'hotels.com', 'expedia.fr'
  ],
  // USA
  us: [
    // E-commerce
    'bestbuy.com', 'target.com', 'walmart.com', 'homedepot.com', 'lowes.com',
    'costco.com', 'macys.com', 'nordstrom.com', 'zappos.com',
    // Auto
    'toyota.com', 'ford.com', 'gm.com', 'autotrader.com', 'cars.com', 'cargurus.com', 'carvana.com',
    // Travel
    'delta.com', 'american.com', 'united.com', 'expedia.com', 'priceline.com'
  ],
  // UK
  uk: [
    // E-commerce
    'argos.co.uk', 'currys.co.uk', 'johnlewis.com', 'marks-and-spencer.com',
    'tesco.com', 'boots.com', 'next.co.uk',
    // Auto
    'toyota.co.uk', 'bmw.co.uk', 'audi.co.uk', 'autotrader.co.uk', 'heycar.co.uk', 'carwow.co.uk',
    // Travel
    'britishairways.com', 'easyjet.com', 'trainline.com'
  ],
  // Germany
  de: [
    // E-commerce
    'otto.de', 'zalando.de', 'mediamarkt.de', 'saturn.de', 'real.de',
    'kaufland.de', 'lidl.de', 'aldi.de',
    // Auto
    'toyota.de', 'bmw.de', 'audi.de', 'mercedes-benz.de', 'mobile.de', 'autoscout24.de',
    // Travel
    'lufthansa.com', 'db.de', 'booking.com'
  ],
  // Spain
  es: [
    // E-commerce
    'elcorteingles.es', 'mediamarkt.es', 'carrefour.es', 'fnac.es',
    'zalando.es', 'pccomponentes.com',
    // Auto
    'toyota.es', 'seat.es', 'bmw.es', 'coches.net', 'autoscout24.es', 'milanuncios.com',
    // Travel
    'iberia.com', 'vueling.com', 'renfe.com'
  ],
  // Italy
  it: [
    // E-commerce
    'mediaworld.it', 'unieuro.it', 'carrefour.it', 'zalando.it',
    'yoox.com', 'eprice.it',
    // Auto
    'toyota.it', 'fiat.it', 'ferrari.it', 'autoscout24.it', 'subito.it',
    // Travel
    'alitalia.com', 'trenitalia.com', 'lastminute.com'
  ]
};

const ValidatedLink: React.FC<ValidatedLinkProps> = ({ 
  link, 
  fallbackSearchQuery,
  contextText, 
  className = "text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5" 
}) => {
  const currentLanguage = I18nService.getCurrentLanguage();
  
  const cleanUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      // Remove tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
      trackingParams.forEach(param => urlObj.searchParams.delete(param));
      // Force HTTPS
      urlObj.protocol = 'https:';
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(urlObj.protocol) && !url.includes('example.com');
    } catch {
      return false;
    }
  };

  const isTrustedMerchant = (url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname.toLowerCase().replace('www.', '');
      
      // Check global domains
      if (TRUSTED_MERCHANT_DOMAINS.global.some(d => domain.includes(d.toLowerCase()))) {
        return true;
      }
      
      // Check language-specific domains
      const languageKey = currentLanguage === 'en' ? 'us' : currentLanguage;
      const languageDomains = TRUSTED_MERCHANT_DOMAINS[languageKey as keyof typeof TRUSTED_MERCHANT_DOMAINS] || [];
      return languageDomains.some(d => domain.includes(d.toLowerCase()));
    } catch {
      return false;
    }
  };

  const isVerticalCompatible = (url: string, vertical: string | null): boolean => {
    if (!vertical) return true;
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = urlObj.hostname.toLowerCase().replace('www.', '');
      
      const verticalDomains = VERTICAL_MERCHANT_DOMAINS[vertical as keyof typeof VERTICAL_MERCHANT_DOMAINS];
      if (!verticalDomains) return true;
      
      // Check global and language-specific vertical domains
      const languageKey = currentLanguage === 'en' ? 'en' : currentLanguage;
      const relevantDomains = [
        ...verticalDomains.global,
        ...(verticalDomains[languageKey as keyof typeof verticalDomains.global] || [])
      ];
      
      return relevantDomains.some(d => domain.includes(d.toLowerCase()));
    } catch {
      return true; // Allow invalid URLs to be processed by fallback
    }
  };

  const generateFallbackUrl = (title: string, query?: string, originalUrl?: string): string => {
    const searchQuery = query || title;
    const sanitizedQuery = I18nService.sanitizeProductQuery(searchQuery);
    let finalQuery = sanitizedQuery;
    let extractedDomain = null;
    
    // Extract domain from original URL for site-specific search
    if (originalUrl && isValidUrl(originalUrl)) {
      try {
        const urlObj = new URL(originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`);
        extractedDomain = urlObj.hostname.replace('www.', '');
      } catch {
        // Use original query if domain extraction fails
      }
    }
    
    // Detect vertical category with context
    const fullText = `${title} ${query || ''} ${contextText || ''}`;
    const detectedVertical = I18nService.detectVertical(fullText, currentLanguage);
    const isSportsMerch = I18nService.detectSportsMerch(fullText, currentLanguage);
    const isShoppingRelated = I18nService.isShoppingRelated(fullText, currentLanguage);
    
    // Multi-step fallback system
    const fallbackStrategies = [
      // Strategy 1: Site-specific search for known domains
      () => {
        if (!extractedDomain) return null;
        
        const isTrustedEcommerce = isTrustedMerchant(`https://${extractedDomain}`);
        
        // Special handling for Fnac - always use merchant search
        if (extractedDomain.includes('fnac.')) {
          return I18nService.buildMerchantSearchUrl(extractedDomain, sanitizedQuery, currentLanguage);
        }
        
        // For sports merchandise on trusted e-commerce sites
        if (isSportsMerch && isTrustedEcommerce) {
          return I18nService.buildMerchantSearchUrl(extractedDomain, `${sanitizedQuery} equipment`, currentLanguage);
        }
        
        // For trusted e-commerce domains, use site-specific search
        if (isTrustedEcommerce) {
          return I18nService.buildMerchantSearchUrl(extractedDomain, sanitizedQuery, currentLanguage);
        }
        
        // For unknown domains, use web search with site filter
        const siteQuery = `${sanitizedQuery} site:${extractedDomain}`;
        return I18nService.buildGoogleWebUrl(siteQuery, currentLanguage);
      },
      
      // Strategy 2: Vertical-specific search
      () => {
        switch (detectedVertical) {
          case 'dining':
            return I18nService.buildGoogleMapsSearchUrl(
              I18nService.buildVerticalQuery(finalQuery, 'dining', currentLanguage), 
              currentLanguage
            );
          case 'accommodation':
            return I18nService.buildGoogleWebUrl(
              I18nService.buildVerticalQuery(finalQuery, 'accommodation', currentLanguage), 
              currentLanguage
            );
          case 'automotive':
          case 'travel':
          case 'software':
            return I18nService.buildGoogleWebUrl(
              I18nService.buildVerticalQuery(finalQuery, detectedVertical, currentLanguage), 
              currentLanguage
            );
          default:
            return null;
        }
      },
      
      // Strategy 3: Product/shopping search
      () => {
        if (isShoppingRelated || isSportsMerch) {
          const enhancedQuery = isSportsMerch ? `${sanitizedQuery} equipment gear` : sanitizedQuery;
          return I18nService.buildGoogleShoppingUrl(enhancedQuery, currentLanguage);
        }
        return null;
      },
      
      // Strategy 4: Default web search
      () => {
        return I18nService.buildGoogleWebUrl(finalQuery, currentLanguage);
      }
    ];
    
    // Execute strategies in order until one succeeds
    for (const strategy of fallbackStrategies) {
      const result = strategy();
      if (result) return result;
    }
    
    // Final fallback (should never reach here)
    return I18nService.buildGoogleWebUrl(finalQuery, currentLanguage);
  };

  const finalUrl = (() => {
    const fullText = `${link.title} ${fallbackSearchQuery || ''} ${contextText || ''}`;
    const detectedVertical = I18nService.detectVertical(fullText, currentLanguage);
    
    if (isValidUrl(link.url)) {
      const cleanedUrl = cleanUrl(link.url);
      
      // Check if link is compatible with the detected vertical
      if (!isVerticalCompatible(cleanedUrl, detectedVertical)) {
        console.log(`🔄 Vertical mismatch for ${cleanedUrl}, falling back to search`);
        return generateFallbackUrl(link.title, fallbackSearchQuery, link.url);
      }
      
      // If valid and trusted, use direct link
      if (isTrustedMerchant(cleanedUrl)) {
        return cleanedUrl;
      }
      // If valid but not trusted, fallback to search with site filter
      return generateFallbackUrl(link.title, fallbackSearchQuery, link.url);
    }
    // If invalid URL, fallback to search
    return generateFallbackUrl(link.title, fallbackSearchQuery);
  })();

  const isSearchUrl = finalUrl.includes('/search') || finalUrl.includes('/maps/search');
  const fullText = `${link.title} ${fallbackSearchQuery || ''} ${contextText || ''}`;
  const detectedVertical = I18nService.detectVertical(fullText, currentLanguage);
  
  // Context-aware action verbs
  const getActionVerb = (): string => {
    if (!isSearchUrl) return link.title;
    
    const config = I18nService.getShoppingConfig(currentLanguage);
    switch (detectedVertical) {
      case 'dining':
        return currentLanguage === 'fr' ? 'Réserver' : 
               currentLanguage === 'es' ? 'Reservar' :
               currentLanguage === 'it' ? 'Prenotare' :
               currentLanguage === 'de' ? 'Reservieren' : 'Book';
      case 'accommodation':
        return currentLanguage === 'fr' ? 'Réserver' :
               currentLanguage === 'es' ? 'Reservar' :
               currentLanguage === 'it' ? 'Prenotare' :
               currentLanguage === 'de' ? 'Buchen' : 'Book';
      case 'travel':
        return currentLanguage === 'fr' ? 'Réserver' :
               currentLanguage === 'es' ? 'Reservar' :
               currentLanguage === 'it' ? 'Prenotare' :
               currentLanguage === 'de' ? 'Buchen' : 'Book';
      default:
        return config.buyVerb;
    }
  };

  return (
    <a 
      href={finalUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      title={isSearchUrl ? `${getActionVerb()}: ${link.title}` : link.title}
    >
      <span className="flex items-center gap-2 truncate flex-1 text-gray-700 dark:text-gray-300">
        {isSearchUrl ? <Search className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" /> : <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />}
        {link.description || link.title}
      </span>
    </a>
  );
};

export default ValidatedLink;
