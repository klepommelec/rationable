
import React from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { ILink } from '@/types/decision';
import { I18nService } from '@/services/i18nService';

interface ValidatedLinkProps {
  link: ILink;
  fallbackSearchQuery?: string;
  className?: string;
}

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

  const generateFallbackUrl = (title: string, query?: string, originalUrl?: string): string => {
    const searchQuery = query || title;
    let finalQuery = searchQuery;
    let extractedDomain = null;
    
    // Extract domain from original URL for site-specific search
    if (originalUrl && isValidUrl(originalUrl)) {
      try {
        const urlObj = new URL(originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`);
        extractedDomain = urlObj.hostname.replace('www.', '');
        finalQuery = `${searchQuery} site:${extractedDomain}`;
      } catch {
        // Use original query if domain extraction fails
      }
    }
    
    // Detect vertical category
    const fullText = `${title} ${query || ''}`;
    const isAutomotive = I18nService.isAutomotiveRelated(fullText, currentLanguage);
    const isTravel = I18nService.isTravelRelated(fullText, currentLanguage);
    const isSoftware = I18nService.isSoftwareRelated(fullText, currentLanguage);
    const isShoppingRelated = I18nService.isShoppingRelated(fullText, currentLanguage);
    
    // For site-specific searches, check if domain is a trusted e-commerce merchant
    if (extractedDomain) {
      const isTrustedEcommerce = isTrustedMerchant(`https://${extractedDomain}`);
      // If it's not a trusted e-commerce domain, use Web search (not Shopping)
      if (!isTrustedEcommerce) {
        return I18nService.buildGoogleWebUrl(finalQuery, currentLanguage);
      }
    }
    
    // For specific verticals that work better with Web search
    if (isAutomotive || isTravel || isSoftware) {
      return I18nService.buildGoogleWebUrl(finalQuery, currentLanguage);
    }
    
    // For retail/e-commerce, use Shopping search
    if (isShoppingRelated) {
      return I18nService.buildGoogleShoppingUrl(finalQuery, currentLanguage);
    }
    
    // Default to regular localized Google Web search
    return I18nService.buildGoogleWebUrl(finalQuery, currentLanguage);
  };

  const finalUrl = (() => {
    if (isValidUrl(link.url)) {
      const cleanedUrl = cleanUrl(link.url);
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

  const isSearchUrl = finalUrl.includes('/search');

  return (
    <a 
      href={finalUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      title={isSearchUrl ? `${I18nService.getShoppingConfig(currentLanguage).buyVerb}: ${link.title}` : link.title}
    >
      <span className="flex items-center gap-2 truncate flex-1 text-gray-700 dark:text-gray-300">
        {isSearchUrl ? <Search className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" /> : <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />}
        {link.description || link.title}
      </span>
    </a>
  );
};

export default ValidatedLink;
