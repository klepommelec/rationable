import { supabase } from '@/integrations/supabase/client';
import { I18nService, SupportedLanguage } from './i18nService';
import { searchCacheService } from './searchCacheService';
import { LinkVerifierService } from './linkVerifierService';

export interface FirstResultResponse {
  url: string;
  title: string;
  sourceProvider: 'google_cse' | 'serpapi' | 'tavily' | 'perplexity';
  fromCache: boolean;
}

export interface FirstResultOptions {
  optionName: string;
  dilemma: string;
  language?: SupportedLanguage;
  vertical?: 'dining' | 'accommodation' | 'travel' | 'automotive' | 'software' | null;
}

class FirstResultService {
  async getFirstResultUrl({ optionName, dilemma, language, vertical }: FirstResultOptions): Promise<FirstResultResponse> {
    // 1. Detect language if not provided
    const detectedLanguage = language || I18nService.detectLanguage(dilemma + ' ' + optionName);
    
    // 2. Detect vertical if not provided
    const detectedVertical = vertical || I18nService.detectVertical(dilemma + ' ' + optionName);
    
    // 3. Build optimized search query
    const query = this.buildOptimizedQuery(optionName, detectedVertical, detectedLanguage);
    
    // 4. Check cache first
    const cacheKey = `${query}_${detectedLanguage}_${detectedVertical || 'general'}`;
    const cached = searchCacheService.get(cacheKey);
    if (cached) {
      try {
        // Verify cached URL is still valid
        const verified = await LinkVerifierService.verifyLinks([{ url: cached.content.url, title: cached.content.title }]);
        if (verified.validLinks.length > 0) {
          console.log(`✅ Using cached result: ${cached.content.url}`);
          return {
            url: verified.validLinks[0].url,
            title: cached.content.title,
            sourceProvider: cached.provider as any,
            fromCache: true
          };
        } else {
          console.log(`🗑️ Cached URL no longer valid: ${cached.content.url}`);
          searchCacheService.clear(); // Clear invalid cached entry
        }
      } catch (error) {
        console.log(`⚠️ Error verifying cached URL: ${error.message}`);
      }
    }

    // 5. Call edge function for fresh results
    try {
      console.log(`🔍 Searching for: "${query}" (${detectedLanguage}, ${detectedVertical})`);
      
      const { data, error } = await supabase.functions.invoke('first-web-result', {
        body: {
          query,
          language: detectedLanguage,
          vertical: detectedVertical,
          numResults: 5 // Increase to get more options for verification
        }
      });

      if (error) {
        console.error(`❌ Edge function error:`, error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      console.log(`📊 Search results:`, { 
        provider: data?.provider, 
        resultCount: data?.results?.length || 0,
        hasResults: !!data?.results?.length 
      });

      if (!data?.results?.length) {
        console.log(`⚠️ No results returned from search provider: ${data?.provider}`);
        throw new Error('No results returned from search');
      }

      // 6. Pre-filter results to prioritize e-commerce URLs
      const prioritizedResults = this.prioritizeEcommerceResults(data.results);
      console.log(`🎯 Prioritized ${prioritizedResults.length} results from ${data.results.length} total`);

      // 7. Verify results and find first valid one
      const linksToVerify = prioritizedResults.slice(0, 3).map((r: any) => ({ 
        url: r.url, 
        title: r.title,
        description: r.snippet 
      }));
      
      console.log(`🔍 Verifying links:`, linksToVerify.map(l => l.url));
      const verified = await LinkVerifierService.verifyLinks(linksToVerify);
      
      console.log(`✅ Link verification complete:`, verified.summary);

      let validResult = null;
      if (verified.validLinks.length > 0) {
        const firstValidLink = verified.validLinks[0];
        const originalResult = prioritizedResults.find((r: any) => 
          r.url === firstValidLink.url || 
          r.title === firstValidLink.title ||
          this.normalizeUrl(r.url) === this.normalizeUrl(firstValidLink.url)
        );
        validResult = {
          ...originalResult,
          url: firstValidLink.url,
          title: firstValidLink.title || originalResult?.title
        };
        
        console.log(`🎉 Found valid result: ${validResult.url}`);
      }

      if (validResult) {
        // Cache the valid result
        searchCacheService.set(
          cacheKey, 
          detectedVertical || 'general', 
          { url: validResult.url, title: validResult.title }, 
          data.provider
        );

        return {
          url: validResult.url,
          title: validResult.title,
          sourceProvider: data.provider,
          fromCache: false
        };
      } else {
        console.log(`⚠️ No valid URLs found after verification`);
        throw new Error('No valid URLs found in search results');
      }
    } catch (error) {
      console.error(`❌ FirstResultService error for "${optionName}":`, error);
      
      // Enhanced fallback: try to construct a merchant-specific search URL
      const merchantFallback = this.buildMerchantFallbackUrl(optionName, detectedLanguage);
      if (merchantFallback) {
        console.log(`🔄 Using merchant fallback: ${merchantFallback}`);
        return {
          url: merchantFallback,
          title: `Rechercher "${optionName}"`,
          sourceProvider: 'perplexity', // arbitrary fallback
          fromCache: false
        };
      }
      
      // Final fallback to Google search page
      const fallbackUrl = I18nService.buildGoogleWebUrl(query, detectedLanguage);
      console.log(`🔄 Using Google fallback: ${fallbackUrl}`);
      return {
        url: fallbackUrl,
        title: `Rechercher "${optionName}"`,
        sourceProvider: 'perplexity', // arbitrary fallback
        fromCache: false
      };
    }
  }

  private buildOptimizedQuery(optionName: string, vertical: string | null, language: SupportedLanguage): string {
    const config = I18nService.getShoppingConfig(language);
    
    // Build contextual query based on vertical
    switch (vertical) {
      case 'dining':
        return language === 'fr' ? `Réserver ${optionName}` : 
               language === 'es' ? `Reservar ${optionName}` :
               language === 'it' ? `Prenotare ${optionName}` :
               language === 'de' ? `Reservieren ${optionName}` :
               `Book ${optionName}`;
      
      case 'accommodation':
        return language === 'fr' ? `Réserver ${optionName} hôtel` : 
               language === 'es' ? `Reservar ${optionName} hotel` :
               language === 'it' ? `Prenotare ${optionName} hotel` :
               language === 'de' ? `${optionName} Hotel buchen` :
               `Book ${optionName} hotel`;
      
      case 'travel':
        return language === 'fr' ? `Réserver ${optionName}` : 
               language === 'es' ? `Reservar ${optionName}` :
               language === 'it' ? `Prenotare ${optionName}` :
               language === 'de' ? `${optionName} buchen` :
               `Book ${optionName}`;
      
      default:
        // For shopping/general items, use buy verb
        return `${config.buyVerb} ${optionName}`;
    }
  }

  getActionVerb(vertical: string | null, language: SupportedLanguage): string {
    switch (vertical) {
      case 'dining':
      case 'accommodation':
      case 'travel':
        return language === 'fr' ? 'Réserver' : 
               language === 'es' ? 'Reservar' :
               language === 'it' ? 'Prenotare' :
               language === 'de' ? 'Buchen' :
               'Book';
      
      default:
        const config = I18nService.getShoppingConfig(language);
        return config.buyVerb.charAt(0).toUpperCase() + config.buyVerb.slice(1);
    }
  }

  getDiscoverVerb(language: SupportedLanguage): string {
    return language === 'fr' ? 'Découvrir' : 
           language === 'es' ? 'Descubrir' :
           language === 'it' ? 'Scoprire' :
           language === 'de' ? 'Entdecken' :
           'Discover';
  }

  private prioritizeEcommerceResults(results: any[]): any[] {
    if (!results || results.length === 0) return [];

    // Define e-commerce domains and keywords
    const ecommerceDomains = [
      'amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'samsung', 'apple', 
      'leboncoin', 'rueducommerce', 'materiel', 'ldlc', 'grosbill', 'topachat',
      'store', 'shop', 'boutique', 'magasin'
    ];

    const ecommerceKeywords = [
      'buy', 'acheter', 'comprar', 'comprare', 'kaufen',
      'price', 'prix', 'precio', 'prezzo', 'preis',
      'shop', 'store', 'boutique', 'magasin', 'tienda'
    ];

    // Score and sort results
    const scoredResults = results.map(result => {
      let score = 0;
      const url = result.url?.toLowerCase() || '';
      const title = result.title?.toLowerCase() || '';

      // Higher score for known e-commerce domains
      for (const domain of ecommerceDomains) {
        if (url.includes(domain)) {
          score += url.includes('amazon') || url.includes('fnac') || url.includes('samsung') ? 10 : 5;
          break;
        }
      }

      // Score for e-commerce keywords in title or URL
      for (const keyword of ecommerceKeywords) {
        if (title.includes(keyword) || url.includes(keyword)) {
          score += 2;
        }
      }

      // Bonus for HTTPS
      if (url.startsWith('https')) score += 1;

      // Penalty for generic sites
      const genericDomains = ['wikipedia', 'youtube', 'facebook', 'twitter', 'reddit', 'blog'];
      for (const generic of genericDomains) {
        if (url.includes(generic)) {
          score -= 5;
          break;
        }
      }

      return { ...result, _score: score };
    });

    // Sort by score (highest first) and return original format
    return scoredResults
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...result }) => result);
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove www, trailing slash, and common tracking parameters
      let normalized = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname.replace(/\/$/, '');
      
      // Remove common tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
      const searchParams = new URLSearchParams(urlObj.search);
      for (const param of trackingParams) {
        searchParams.delete(param);
      }
      
      const cleanParams = searchParams.toString();
      if (cleanParams) {
        normalized += '?' + cleanParams;
      }
      
      return normalized;
    } catch {
      return url;
    }
  }

  private buildMerchantFallbackUrl(optionName: string, language: SupportedLanguage): string | null {
    const config = I18nService.getShoppingConfig(language);
    const cleanOptionName = I18nService.sanitizeProductQuery(optionName);
    
    // Try to detect product category and use appropriate merchant
    const lowerOption = optionName.toLowerCase();
    
    // Electronics/Tech products -> go to major tech retailers
    if (lowerOption.includes('samsung') || lowerOption.includes('apple') || lowerOption.includes('iphone') || 
        lowerOption.includes('galaxy') || lowerOption.includes('macbook') || lowerOption.includes('laptop')) {
      
      // For Samsung products, try official Samsung store first
      if (lowerOption.includes('samsung')) {
        const samsungDomains = {
          'fr': 'samsung.com/fr',
          'en': 'samsung.com/us',
          'es': 'samsung.com/es',
          'it': 'samsung.com/it',
          'de': 'samsung.com/de'
        };
        const domain = samsungDomains[language] || samsungDomains.en;
        return `https://www.${domain}/search/?searchvalue=${encodeURIComponent(cleanOptionName)}`;
      }
      
      // For Apple products, try Apple store
      if (lowerOption.includes('apple') || lowerOption.includes('iphone') || lowerOption.includes('macbook')) {
        const appleDomains = {
          'fr': 'apple.com/fr',
          'en': 'apple.com/us',
          'es': 'apple.com/es',
          'it': 'apple.com/it',
          'de': 'apple.com/de'
        };
        const domain = appleDomains[language] || appleDomains.en;
        return `https://www.${domain}/search/${encodeURIComponent(cleanOptionName)}`;
      }
      
      // For other electronics, try major retailers
      if (language === 'fr') {
        return `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(cleanOptionName)}`;
      }
    }
    
    // Fallback to Amazon search
    const amazonDomains = {
      'fr': 'amazon.fr',
      'en': 'amazon.com',
      'es': 'amazon.es',
      'it': 'amazon.it',
      'de': 'amazon.de'
    };
    
    const amazonDomain = amazonDomains[language] || amazonDomains.en;
    return `https://www.${amazonDomain}/s?k=${encodeURIComponent(cleanOptionName)}`;
  }
}

export const firstResultService = new FirstResultService();