import { supabase } from '@/integrations/supabase/client';
import { I18nService, SupportedLanguage } from './i18nService';
import { searchCacheService } from './searchCacheService';
import { actionLinksCacheService } from './actionLinksCacheService';
import { LinkVerifierService } from './linkVerifierService';

export interface FirstResultResponse {
  url: string;
  title: string;
  sourceProvider: 'google_cse' | 'serpapi' | 'tavily' | 'perplexity';
  fromCache: boolean;
}

export interface BestLinksResponse {
  official?: { url: string; title: string; domain: string };
  merchants: Array<{ url: string; title: string; domain: string }>;
  maps?: { url: string; title: string };
  actionType: 'directions' | 'reserve' | 'buy';
  provider: 'google_cse' | 'serpapi' | 'tavily' | 'perplexity';
  fromCache: boolean;
}

export interface FirstResultOptions {
  optionName: string;
  dilemma: string;
  language?: SupportedLanguage;
  vertical?: 'dining' | 'accommodation' | 'travel' | 'automotive' | 'software' | null;
}

export class FirstResultService {
  async getBestLinks({ optionName, dilemma, language, vertical }: FirstResultOptions): Promise<BestLinksResponse> {
    // Check if real-time search is enabled
    const realTimeSearchEnabled = localStorage.getItem('realTimeSearchEnabled');
    if (realTimeSearchEnabled === 'false') {
      console.log('🚫 Best links search disabled by user preference');
      // Return negative cache to prevent re-attempts
      return {
        official: undefined,
        merchants: [],
        maps: undefined,
        actionType: 'buy',
        provider: 'disabled' as any,
        fromCache: true
      };
    }

    const startTime = Date.now();
    const TIMEOUT_MS = 3500; // Total timeout for the entire operation
    
    // 1. Detect language and vertical
    const detectedLanguage = language || I18nService.getCurrentLanguage();
    const detectedVertical = vertical || I18nService.detectVertical(dilemma + ' ' + optionName);
    
    // 2. Classify action type and extract location context
    const actionType = this.classifyActionType(optionName, detectedVertical, dilemma);
    const cityContext = this.extractCityFromDilemma(dilemma);
    
    // 3. Detect brand from option name
    const brand = this.detectBrand(optionName);
    console.log(`🏷️ Brand detected: ${brand || 'none'} for "${optionName}"`);
    console.log(`📍 Action type: ${actionType}, City context: ${cityContext || 'none'}`);
    
    // 4. Build search query with location context
    const query = this.buildOptimizedQuery(optionName, detectedVertical, detectedLanguage, cityContext);
    
    // 5. Generate maps URL for directions actions
    const mapsResult = actionType === 'directions' ? {
      url: I18nService.buildGoogleMapsSearchUrl(
        cityContext ? `${optionName} ${cityContext}` : optionName, 
        detectedLanguage
      ),
      title: I18nService.getDirectionsLabel(detectedLanguage)
    } : undefined;
    
    try {
    
    // 6. Check action links cache first (plus spécifique et persistant)
    const cachedActionLinks = actionLinksCacheService.get(optionName, detectedLanguage, detectedVertical);
    if (cachedActionLinks) {
      console.log(`✅ Using cached action links for: ${optionName}`);
      return {
        official: cachedActionLinks.official,
        merchants: cachedActionLinks.merchants || [],
        maps: cachedActionLinks.maps,
        actionType: cachedActionLinks.actionType,
        provider: cachedActionLinks.provider as any,
        fromCache: true
      };
    }

    // 7. Fallback to search cache for backward compatibility
    const officialCacheKey = `${query}_${detectedLanguage}_${detectedVertical || 'general'}_official`;
    const merchantsCacheKey = `${query}_${detectedLanguage}_${detectedVertical || 'general'}_merchants`;
    
    const cachedOfficial = searchCacheService.get(officialCacheKey);
    const cachedMerchants = searchCacheService.get(merchantsCacheKey);
    
    if (cachedOfficial && cachedMerchants) {
      console.log(`✅ Using cached search results for: ${optionName}`);
      return {
        official: cachedOfficial.content.official,
        merchants: cachedMerchants.content.merchants || [],
        maps: mapsResult,
        actionType,
        provider: cachedOfficial.provider as any,
        fromCache: true
      };
    }
    
      // Performance optimization: Race condition with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), TIMEOUT_MS);
      });

      const searchPromise = (async () => {
        console.log(`🔍 Searching best links for: "${query}" (${detectedLanguage}, ${detectedVertical})`);
        
        // 7. Search for official site first if we have a brand (with timeout)
        let officialResult = null;
        if (brand && (Date.now() - startTime) < 2000) {
          // Improved query to target product pages specifically
          const officialQuery = this.buildOfficialSiteQuery(brand, optionName, detectedLanguage, detectedVertical);
          const siteBias = this.getBrandDomains(brand);
          
          try {
            const { data: officialData, error: officialError } = await Promise.race([
              supabase.functions.invoke('first-web-result', {
                body: {
                  query: officialQuery,
                  language: detectedLanguage,
                  vertical: detectedVertical,
                  numResults: 2, // Reduced for speed
                  siteBias
                }
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Official search timeout')), 2500))
            ]) as any;
            
            if (!officialError && officialData?.results?.length) {
              const officialResults = officialData.results.filter((r: any) => 
                this.isOfficialDomain(r.url, brand)
              );
              
              if (officialResults.length > 0) {
                // Prefer product-specific pages over homepage
                const productPage = officialResults.find((r: any) => 
                  this.isProductPage(r.url, optionName, brand)
                );
                
                if (productPage) {
                  officialResult = {
                    url: productPage.url,
                    title: productPage.title,
                    domain: this.extractDomain(productPage.url)
                  };
                  console.log(`✅ Product page found: ${productPage.url}`);
                } else {
                  // Try to construct a product page URL if we have the homepage
                  const homepage = officialResults[0];
                  const productUrl = this.constructProductPageUrl(homepage.url, optionName, brand, detectedVertical);
                  if (productUrl) {
                    officialResult = {
                      url: productUrl,
                      title: `${homepage.title} - ${optionName}`,
                      domain: this.extractDomain(productUrl)
                    };
                    console.log(`✅ Constructed product page: ${productUrl}`);
                  } else {
                    officialResult = {
                      url: homepage.url,
                      title: homepage.title,
                      domain: this.extractDomain(homepage.url)
                    };
                    console.log(`✅ Official site found: ${homepage.url}`);
                  }
                }
              }
            }
          } catch (error) {
            console.log(`⚠️ Official search failed/timed out: ${error.message}`);
          }
        }
        
        // 8. Search for general results (merchants) with location boost
        const locationBoostQuery = cityContext ? `${query} ${cityContext}` : query;
        const { data, error } = await Promise.race([
          supabase.functions.invoke('first-web-result', {
            body: {
              query: locationBoostQuery,
              language: detectedLanguage,
              vertical: detectedVertical,
              numResults: 3 // Reduced for speed
            }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Merchant search timeout')), 2500))
        ]) as any;

        if (error) {
          console.error(`❌ Edge function error:`, error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (!data?.results?.length) {
          console.log(`⚠️ No results returned from search provider: ${data?.provider}`);
          throw new Error('No results returned from search');
        }

        // 9. Separate official vs merchants and prioritize with location boost
        const { merchants } = this.separateOfficialAndMerchants(data.results, brand, officialResult, cityContext, actionType);
        
        return { data, merchants, officialResult };
      })();

      const { data, merchants, officialResult } = await Promise.race([searchPromise, timeoutPromise]) as any;
      
      // 10. Build final merchant list (max 2) - Skip verification for speed, filter for pertinence
      let finalMerchants = [];
      if (merchants.length > 0) {
        const pertinentMerchants = merchants.filter(merchant => 
          this.isPertinentLink(merchant.url, detectedVertical, optionName)
        );
        
        if (pertinentMerchants.length > 0) {
          finalMerchants = pertinentMerchants.slice(0, 2).map(merchant => ({
            url: merchant.url,
            title: merchant.title,
            domain: this.extractDomain(merchant.url)
          }));
          console.log(`✅ Found ${finalMerchants.length} pertinent merchants (unverified for speed)`);
        }
      }

      // No fallback for directions (local queries) - return with empty merchants

      const result = {
        official: officialResult,
        merchants: finalMerchants,
        maps: mapsResult,
        actionType,
        provider: data.provider,
        fromCache: false
      };

      // 10. Cache results in both caches
      // Cache principal (action links cache - persistant)
      actionLinksCacheService.set(optionName, detectedLanguage, detectedVertical, {
        official: officialResult,
        merchants: finalMerchants,
        maps: mapsResult,
        actionType,
        provider: data.provider
      });

      // Cache de fallback (search cache - pour compatibilité)
      if (officialResult) {
        searchCacheService.set(officialCacheKey, detectedVertical || 'general', { official: officialResult }, data.provider);
      }
      searchCacheService.set(merchantsCacheKey, detectedVertical || 'general', { merchants: finalMerchants }, data.provider);

        console.log(`🎉 Best links found: ${officialResult ? 'official + ' : ''}${finalMerchants.length} merchants`);
        return result;

    } catch (error) {
      console.error(`❌ getBestLinks error for "${optionName}":`, error);
      
      // Soft fallback: provide basic links for known categories
      const softFallback = this.createSoftFallback(optionName, detectedVertical, detectedLanguage, actionType, brand);
      
      return {
        official: softFallback.official,
        merchants: softFallback.merchants,
        maps: mapsResult,
        actionType,
        provider: 'fallback' as any,
        fromCache: false
      };
    } finally {
      const duration = Date.now() - startTime;
      console.log(`⏱️ getBestLinks completed in ${duration}ms for "${optionName}"`);
    }
  }

  async getFirstResultUrl({ optionName, dilemma, language, vertical }: FirstResultOptions): Promise<FirstResultResponse> {
    // 1. Detect language if not provided
    const detectedLanguage = language || I18nService.getCurrentLanguage();
    
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
          numResults: 3 // Optimize for speed
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
      
      // Don't provide generic fallbacks - throw error instead
      throw new Error('No pertinent results found');
    }
  }

  private createSoftFallback(optionName: string, vertical: string | null, language: SupportedLanguage, actionType: string, brand?: string | null) {
    // Create sensible fallbacks for common cases
    let official = null;
    let merchants = [];

    // Only provide official site for recognized brands
    if (brand && this.getBrandDomains(brand).length > 0) {
      const primaryDomain = this.getBrandDomains(brand)[0];
      official = {
        url: `https://www.${primaryDomain}`,
        title: I18nService.getOfficialSiteLabel(language),
        domain: primaryDomain
      };
    }

    // Add pertinent merchants based on vertical
    if (vertical === 'automotive' && actionType === 'buy') {
      // Don't include Amazon for cars
      merchants = [];
    } else if (vertical === 'software' || vertical === 'tech') {
      merchants = [{
        url: I18nService.buildGoogleShoppingUrl(optionName, language),
        title: I18nService.getShoppingConfig(language).buyVerb.charAt(0).toUpperCase() + I18nService.getShoppingConfig(language).buyVerb.slice(1),
        domain: 'google.com'
      }];
    }

    return { official, merchants };
  }

  private buildOptimizedQuery(optionName: string, vertical: string | null, language: SupportedLanguage, cityContext?: string | null): string {
    const config = I18nService.getShoppingConfig(language);
    const locationSuffix = cityContext ? ` ${cityContext}` : '';
    
    // Build contextual query based on vertical
    switch (vertical) {
      case 'dining':
        return language === 'fr' ? `Réserver ${optionName}${locationSuffix}` : 
               language === 'es' ? `Reservar ${optionName}${locationSuffix}` :
               language === 'it' ? `Prenotare ${optionName}${locationSuffix}` :
               language === 'de' ? `Reservieren ${optionName}${locationSuffix}` :
               `Book ${optionName}${locationSuffix}`;
      
      case 'accommodation':
        return language === 'fr' ? `Réserver ${optionName} hôtel${locationSuffix}` : 
               language === 'es' ? `Reservar ${optionName} hotel${locationSuffix}` :
               language === 'it' ? `Prenotare ${optionName} hotel${locationSuffix}` :
               language === 'de' ? `${optionName} Hotel buchen${locationSuffix}` :
               `Book ${optionName} hotel${locationSuffix}`;
      
      case 'travel':
        return language === 'fr' ? `Réserver ${optionName}${locationSuffix}` : 
               language === 'es' ? `Reservar ${optionName}${locationSuffix}` :
               language === 'it' ? `Prenotare ${optionName}${locationSuffix}` :
               language === 'de' ? `${optionName} buchen${locationSuffix}` :
               `Book ${optionName}${locationSuffix}`;
      
      default:
        // For shopping/general items, use buy verb
        return `${config.buyVerb} ${optionName}${locationSuffix}`;
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

  private detectBrand(optionName: string): string | null {
    const lowerOption = optionName.toLowerCase();
    
    // Extract potential restaurant/business names using common patterns
    const restaurantName = this.extractRestaurantName(lowerOption);
    if (restaurantName) {
      return restaurantName;
    }
    
    // Enhanced multilingual brand mapping with more comprehensive coverage
    const brandMap = {
      // Automotive - with multilingual variants
      'toyota': 'toyota',
      'honda': 'honda',
      'ford': 'ford',
      'bmw': 'bmw',
      'mercedes': 'mercedes',
      'mercedes-benz': 'mercedes',
      'mercedes benz': 'mercedes',
      'audi': 'audi',
      'volkswagen': 'volkswagen',
      'vw': 'volkswagen',
      'peugeot': 'peugeot',
      'renault': 'renault',
      'citroën': 'citroen',
      'citroen': 'citroen',
      'dacia': 'dacia',
      'hyundai': 'hyundai',
      'kia': 'kia',
      'nissan': 'nissan',
      'mazda': 'mazda',
      'subaru': 'subaru',
      'opel': 'opel',
      'fiat': 'fiat',
      
      // Technology - with multilingual variants  
      'samsung': 'samsung',
      'apple': 'apple',
      'iphone': 'apple',
      'ipad': 'apple',
      'macbook': 'apple',
      'imac': 'apple',
      'galaxy': 'samsung',
      'pixel': 'google',
      'oneplus': 'oneplus',
      'xiaomi': 'xiaomi',
      'huawei': 'huawei',
      'sony': 'sony',
      'dell': 'dell',
      'hp': 'hp',
      'lenovo': 'lenovo',
      'microsoft': 'microsoft',
      'surface': 'microsoft',
      'asus': 'asus',
      'acer': 'acer',
      'msi': 'msi',
      
      // Dining & Leisure brands - with multilingual variants
      'mcdonalds': 'mcdonalds',
      'mcdonald\'s': 'mcdonalds',
      'mcdonald': 'mcdonalds',
      'kfc': 'kfc',
      'burger king': 'burgerking',
      'quick': 'quick',
      'starbucks': 'starbucks',
      'subway': 'subway',
      'fenocchio': 'fenocchio',
      'paul': 'paul',
      'plongeoir': 'plongeoir',
      
      // Hotels & Travel
      'hilton': 'hilton',
      'marriott': 'marriott',
      'accor': 'accor',
      'ibis': 'ibis',
      'novotel': 'novotel',
      'mercure': 'mercure',
      'sofitel': 'sofitel',
      
      // Technology & Electronics
      'apple': 'apple',
      'samsung': 'samsung',
      'google': 'google',
      'microsoft': 'microsoft',
      'sony': 'sony',
      'lg': 'lg',
      'huawei': 'huawei',
      'xiaomi': 'xiaomi',
      'oneplus': 'oneplus',
      'oppo': 'oppo',
      'vivo': 'vivo',
      'realme': 'realme',
      
      // Bikes & Cycling
      'tern': 'tern',
      'yuba': 'yuba',
      'riese': 'riese-muller',
      'riese & müller': 'riese-muller',
      'riese müller': 'riese-muller',
      'riese-muller': 'riese-muller',
      'riese-müller': 'riese-muller',
      'decathlon': 'decathlon',
      'canyon': 'canyon',
      'trek': 'trek',
      'specialized': 'specialized',
      'giant': 'giant',
      'cannondale': 'cannondale',
      'cube': 'cube',
      'scott': 'scott',
      'bianchi': 'bianchi',
      'pinarello': 'pinarello',
      'cervelo': 'cervelo',
      'look': 'look',
      'time': 'time',
      'lapierre': 'lapierre',
      'btwin': 'btwin',
      'rockrider': 'rockrider',
      'elops': 'elops',
      
      // Fashion & Lifestyle
      'nike': 'nike',
      'adidas': 'adidas',
      'puma': 'puma',
      'reebok': 'reebok',
      'converse': 'converse',
      'vans': 'vans',
      'new balance': 'new-balance',
      'under armour': 'under-armour',
      'lululemon': 'lululemon',
      'patagonia': 'patagonia',
      'north face': 'north-face',
      'columbia': 'columbia',
      'timberland': 'timberland',
      'dr martens': 'dr-martens',
      'clarks': 'clarks',
      'ecco': 'ecco',
      'birkenstock': 'birkenstock',
      'ugg': 'ugg',
      'crocs': 'crocs',
      
      // Home & Furniture
      'ikea': 'ikea',
      'lego': 'lego',
      'zara': 'zara',
      'h&m': 'hm',
      'uniqlo': 'uniqlo',
      'mango': 'mango',
      'massimo dutti': 'massimo-dutti',
      'bershka': 'bershka',
      'pull & bear': 'pull-bear',
      'stradivarius': 'stradivarius',
      'oysho': 'oysho',
      'zara home': 'zara-home',
      'home': 'zara-home',
      'west elm': 'west-elm',
      'crate & barrel': 'crate-barrel',
      'pottery barn': 'pottery-barn',
      'williams sonoma': 'williams-sonoma',
      'restoration hardware': 'restoration-hardware',
      'cb2': 'cb2',
      'anthropologie': 'anthropologie',
      'urban outfitters': 'urban-outfitters',
      
      // Beauty & Cosmetics
      'l\'oréal': 'loreal',
      'loreal': 'loreal',
      'maybelline': 'maybelline',
      'revlon': 'revlon',
      'covergirl': 'covergirl',
      'clinique': 'clinique',
      'estée lauder': 'estee-lauder',
      'estee lauder': 'estee-lauder',
      'lancôme': 'lancome',
      'lancome': 'lancome',
      'ysl': 'ysl',
      'dior': 'dior',
      'chanel': 'chanel',
      'mac': 'mac',
      'nars': 'nars',
      'urban decay': 'urban-decay',
      'too faced': 'too-faced',
      'fenty': 'fenty',
      'rare beauty': 'rare-beauty',
      'glossier': 'glossier',
      'drunk elephant': 'drunk-elephant',
      'the ordinary': 'the-ordinary',
      'paula\'s choice': 'paulas-choice',
      'paulas choice': 'paulas-choice',
      'cerave': 'cerave',
      'neutrogena': 'neutrogena',
      'olay': 'olay',
      'aveeno': 'aveeno',
      'cetaphil': 'cetaphil',
      'la roche-posay': 'la-roche-posay',
      'laroche posay': 'la-roche-posay',
      'vichy': 'vichy',
      'avène': 'avene',
      'avene': 'avene',
      'eucerin': 'eucerin',
      'bioderma': 'bioderma',
      'philips': 'philips',
      'braun': 'braun',
      'remington': 'remington',
      'conair': 'conair',
      'dyson': 'dyson',
      't3': 't3',
      'ghd': 'ghd',
      'babyliss': 'babyliss',
      'wahl': 'wahl',
      'andis': 'andis',
      'oster': 'oster'
    };
    
    for (const [keyword, brand] of Object.entries(brandMap)) {
      if (lowerOption.includes(keyword)) {
        return brand;
      }
    }
    
    return null;
  }

  private extractRestaurantName(lowerOption: string): string | null {
    // Look for restaurant names in common patterns
    const patterns = [
      /restaurant\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /chez\s+([a-zA-ZÀ-ÿ]+)/i,
      /café\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /bar\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /brasserie\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /bistrot?\s+([a-zA-ZÀ-ÿ\s]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = lowerOption.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 30) {
          return name.toLowerCase().replace(/\s+/g, '');
        }
      }
    }
    
    // Look for specific known restaurant names
    const knownRestaurants = [
      'fenocchio', 'plongeoir', 'lapérouse', 'procope', 'flore', 'closerie', 
      'brasserie lipp', 'fouquet', 'maxim', 'train bleu'
    ];
    
    for (const restaurant of knownRestaurants) {
      if (lowerOption.includes(restaurant.toLowerCase())) {
        return restaurant.toLowerCase().replace(/\s+/g, '');
      }
    }
    
    return null;
  }

  private getBrandDomains(brand: string): string[] {
    const domainMap: Record<string, string[]> = {
      // Technology & Electronics
      'samsung': ['samsung.com', 'samsung.fr', 'samsung.es', 'samsung.it', 'samsung.de'],
      'apple': ['apple.com', 'apple.fr', 'apple.es', 'apple.it', 'apple.de'],
      'google': ['store.google.com', 'google.com'],
      'microsoft': ['microsoft.com', 'microsoft.fr', 'microsoft.es', 'microsoft.it', 'microsoft.de'],
      'sony': ['sony.com', 'sony.fr', 'sony.es', 'sony.it', 'sony.de'],
      'lg': ['lg.com', 'lg.fr', 'lg.es', 'lg.it', 'lg.de'],
      'huawei': ['huawei.com', 'huawei.fr', 'huawei.es', 'huawei.it', 'huawei.de'],
      'xiaomi': ['mi.com', 'xiaomi.com', 'xiaomi.fr', 'xiaomi.es', 'xiaomi.it', 'xiaomi.de'],
      'oneplus': ['oneplus.com', 'oneplus.fr', 'oneplus.es', 'oneplus.it', 'oneplus.de'],
      'oppo': ['oppo.com', 'oppo.fr', 'oppo.es', 'oppo.it', 'oppo.de'],
      'vivo': ['vivo.com', 'vivo.fr', 'vivo.es', 'vivo.it', 'vivo.de'],
      'realme': ['realme.com', 'realme.fr', 'realme.es', 'realme.it', 'realme.de'],
      
      // Automotive
      'toyota': ['toyota.fr', 'toyota.com', 'toyota.es', 'toyota.it', 'toyota.de'],
      'honda': ['honda.fr', 'honda.com', 'honda.es', 'honda.it', 'honda.de'],
      'ford': ['ford.fr', 'ford.com', 'ford.es', 'ford.it', 'ford.de'],
      'bmw': ['bmw.fr', 'bmw.com', 'bmw.es', 'bmw.it', 'bmw.de'],
      'mercedes': ['mercedes-benz.fr', 'mercedes-benz.com', 'mercedes-benz.es', 'mercedes-benz.it', 'mercedes-benz.de'],
      'audi': ['audi.fr', 'audi.com', 'audi.es', 'audi.it', 'audi.de'],
      'volkswagen': ['volkswagen.fr', 'volkswagen.com', 'volkswagen.es', 'volkswagen.it', 'volkswagen.de'],
      'peugeot': ['peugeot.fr', 'peugeot.com', 'peugeot.es'],
      'renault': ['renault.fr', 'renault.com', 'renault.es'],
      'dacia': ['dacia.fr', 'dacia.com', 'dacia.es'],
      'hyundai': ['hyundai.fr', 'hyundai.com', 'hyundai.es', 'hyundai.it', 'hyundai.de'],
      'kia': ['kia.fr', 'kia.com', 'kia.es', 'kia.it', 'kia.de'],
      'nissan': ['nissan.fr', 'nissan.com', 'nissan.es', 'nissan.it', 'nissan.de'],
      'mazda': ['mazda.fr', 'mazda.com', 'mazda.es', 'mazda.it', 'mazda.de'],
      'subaru': ['subaru.fr', 'subaru.com', 'subaru.es', 'subaru.it', 'subaru.de'],
      'opel': ['opel.fr', 'opel.com', 'opel.es', 'opel.it', 'opel.de'],
      'fiat': ['fiat.fr', 'fiat.com', 'fiat.es', 'fiat.it', 'fiat.de'],
      
      // Bikes & Cycling
      'tern': ['ternbicycles.com', 'ternbicycles.fr', 'ternbicycles.es', 'ternbicycles.it', 'ternbicycles.de'],
      'yuba': ['yubabikes.com', 'yubabikes.fr', 'yubabikes.es', 'yubabikes.it', 'yubabikes.de'],
      'riese-muller': ['riese-mueller.com', 'riese-mueller.fr', 'riese-mueller.es', 'riese-mueller.it', 'riese-mueller.de'],
      'decathlon': ['decathlon.fr', 'decathlon.com', 'decathlon.es', 'decathlon.it', 'decathlon.de'],
      'canyon': ['canyon.com', 'canyon.fr', 'canyon.es', 'canyon.it', 'canyon.de'],
      'trek': ['trekbikes.com', 'trekbikes.fr', 'trekbikes.es', 'trekbikes.it', 'trekbikes.de'],
      'specialized': ['specialized.com', 'specialized.fr', 'specialized.es', 'specialized.it', 'specialized.de'],
      'giant': ['giant-bicycles.com', 'giant-bicycles.fr', 'giant-bicycles.es', 'giant-bicycles.it', 'giant-bicycles.de'],
      'cannondale': ['cannondale.com', 'cannondale.fr', 'cannondale.es', 'cannondale.it', 'cannondale.de'],
      'cube': ['cube.eu', 'cube.fr', 'cube.es', 'cube.it', 'cube.de'],
      'scott': ['scott-sports.com', 'scott-sports.fr', 'scott-sports.es', 'scott-sports.it', 'scott-sports.de'],
      'bianchi': ['bianchi.com', 'bianchi.fr', 'bianchi.es', 'bianchi.it', 'bianchi.de'],
      'pinarello': ['pinarello.com', 'pinarello.fr', 'pinarello.es', 'pinarello.it', 'pinarello.de'],
      'cervelo': ['cervelo.com', 'cervelo.fr', 'cervelo.es', 'cervelo.it', 'cervelo.de'],
      'look': ['lookcycle.com', 'lookcycle.fr', 'lookcycle.es', 'lookcycle.it', 'lookcycle.de'],
      'time': ['time-sport.com', 'time-sport.fr', 'time-sport.es', 'time-sport.it', 'time-sport.de'],
      'lapierre': ['lapierre-bikes.com', 'lapierre-bikes.fr', 'lapierre-bikes.es', 'lapierre-bikes.it', 'lapierre-bikes.de'],
      'btwin': ['btwin.com', 'btwin.fr', 'btwin.es', 'btwin.it', 'btwin.de'],
      'rockrider': ['rockrider.com', 'rockrider.fr', 'rockrider.es', 'rockrider.it', 'rockrider.de'],
      'elops': ['elops.com', 'elops.fr', 'elops.es', 'elops.it', 'elops.de'],
      
      // Fashion & Lifestyle
      'nike': ['nike.com', 'nike.fr', 'nike.es', 'nike.it', 'nike.de'],
      'adidas': ['adidas.com', 'adidas.fr', 'adidas.es', 'adidas.it', 'adidas.de'],
      'puma': ['puma.com', 'puma.fr', 'puma.es', 'puma.it', 'puma.de'],
      'reebok': ['reebok.com', 'reebok.fr', 'reebok.es', 'reebok.it', 'reebok.de'],
      'converse': ['converse.com', 'converse.fr', 'converse.es', 'converse.it', 'converse.de'],
      'vans': ['vans.com', 'vans.fr', 'vans.es', 'vans.it', 'vans.de'],
      'new-balance': ['newbalance.com', 'newbalance.fr', 'newbalance.es', 'newbalance.it', 'newbalance.de'],
      'under-armour': ['underarmour.com', 'underarmour.fr', 'underarmour.es', 'underarmour.it', 'underarmour.de'],
      'lululemon': ['lululemon.com', 'lululemon.fr', 'lululemon.es', 'lululemon.it', 'lululemon.de'],
      'patagonia': ['patagonia.com', 'patagonia.fr', 'patagonia.es', 'patagonia.it', 'patagonia.de'],
      'north-face': ['thenorthface.com', 'thenorthface.fr', 'thenorthface.es', 'thenorthface.it', 'thenorthface.de'],
      'columbia': ['columbia.com', 'columbia.fr', 'columbia.es', 'columbia.it', 'columbia.de'],
      'timberland': ['timberland.com', 'timberland.fr', 'timberland.es', 'timberland.it', 'timberland.de'],
      'dr-martens': ['drmartens.com', 'drmartens.fr', 'drmartens.es', 'drmartens.it', 'drmartens.de'],
      'clarks': ['clarks.com', 'clarks.fr', 'clarks.es', 'clarks.it', 'clarks.de'],
      'ecco': ['ecco.com', 'ecco.fr', 'ecco.es', 'ecco.it', 'ecco.de'],
      'birkenstock': ['birkenstock.com', 'birkenstock.fr', 'birkenstock.es', 'birkenstock.it', 'birkenstock.de'],
      'ugg': ['ugg.com', 'ugg.fr', 'ugg.es', 'ugg.it', 'ugg.de'],
      'crocs': ['crocs.com', 'crocs.fr', 'crocs.es', 'crocs.it', 'crocs.de'],
      
      // Home & Furniture
      'ikea': ['ikea.com', 'ikea.fr', 'ikea.es', 'ikea.it', 'ikea.de'],
      'lego': ['lego.com', 'lego.fr', 'lego.es', 'lego.it', 'lego.de'],
      'zara': ['zara.com', 'zara.fr', 'zara.es', 'zara.it', 'zara.de'],
      'hm': ['hm.com', 'hm.fr', 'hm.es', 'hm.it', 'hm.de'],
      'uniqlo': ['uniqlo.com', 'uniqlo.fr', 'uniqlo.es', 'uniqlo.it', 'uniqlo.de'],
      'mango': ['mango.com', 'mango.fr', 'mango.es', 'mango.it', 'mango.de'],
      'massimo-dutti': ['massimodutti.com', 'massimodutti.fr', 'massimodutti.es', 'massimodutti.it', 'massimodutti.de'],
      'bershka': ['bershka.com', 'bershka.fr', 'bershka.es', 'bershka.it', 'bershka.de'],
      'pull-bear': ['pullandbear.com', 'pullandbear.fr', 'pullandbear.es', 'pullandbear.it', 'pullandbear.de'],
      'stradivarius': ['stradivarius.com', 'stradivarius.fr', 'stradivarius.es', 'stradivarius.it', 'stradivarius.de'],
      'oysho': ['oysho.com', 'oysho.fr', 'oysho.es', 'oysho.it', 'oysho.de'],
      'zara-home': ['zarahome.com', 'zarahome.fr', 'zarahome.es', 'zarahome.it', 'zarahome.de'],
      'west-elm': ['westelm.com', 'westelm.fr', 'westelm.es', 'westelm.it', 'westelm.de'],
      'crate-barrel': ['crateandbarrel.com', 'crateandbarrel.fr', 'crateandbarrel.es', 'crateandbarrel.it', 'crateandbarrel.de'],
      'pottery-barn': ['potterybarn.com', 'potterybarn.fr', 'potterybarn.es', 'potterybarn.it', 'potterybarn.de'],
      'williams-sonoma': ['williams-sonoma.com', 'williams-sonoma.fr', 'williams-sonoma.es', 'williams-sonoma.it', 'williams-sonoma.de'],
      'restoration-hardware': ['rh.com', 'rh.fr', 'rh.es', 'rh.it', 'rh.de'],
      'cb2': ['cb2.com', 'cb2.fr', 'cb2.es', 'cb2.it', 'cb2.de'],
      'anthropologie': ['anthropologie.com', 'anthropologie.fr', 'anthropologie.es', 'anthropologie.it', 'anthropologie.de'],
      'urban-outfitters': ['urbanoutfitters.com', 'urbanoutfitters.fr', 'urbanoutfitters.es', 'urbanoutfitters.it', 'urbanoutfitters.de'],
      
      // Beauty & Cosmetics
      'loreal': ['loreal.com', 'loreal.fr', 'loreal.es', 'loreal.it', 'loreal.de'],
      'maybelline': ['maybelline.com', 'maybelline.fr', 'maybelline.es', 'maybelline.it', 'maybelline.de'],
      'revlon': ['revlon.com', 'revlon.fr', 'revlon.es', 'revlon.it', 'revlon.de'],
      'covergirl': ['covergirl.com', 'covergirl.fr', 'covergirl.es', 'covergirl.it', 'covergirl.de'],
      'clinique': ['clinique.com', 'clinique.fr', 'clinique.es', 'clinique.it', 'clinique.de'],
      'estee-lauder': ['esteelauder.com', 'esteelauder.fr', 'esteelauder.es', 'esteelauder.it', 'esteelauder.de'],
      'lancome': ['lancome.com', 'lancome.fr', 'lancome.es', 'lancome.it', 'lancome.de'],
      'ysl': ['ysl.com', 'ysl.fr', 'ysl.es', 'ysl.it', 'ysl.de'],
      'dior': ['dior.com', 'dior.fr', 'dior.es', 'dior.it', 'dior.de'],
      'chanel': ['chanel.com', 'chanel.fr', 'chanel.es', 'chanel.it', 'chanel.de'],
      'mac': ['maccosmetics.com', 'maccosmetics.fr', 'maccosmetics.es', 'maccosmetics.it', 'maccosmetics.de'],
      'nars': ['nars.com', 'nars.fr', 'nars.es', 'nars.it', 'nars.de'],
      'urban-decay': ['urbandecay.com', 'urbandecay.fr', 'urbandecay.es', 'urbandecay.it', 'urbandecay.de'],
      'too-faced': ['toofaced.com', 'toofaced.fr', 'toofaced.es', 'toofaced.it', 'toofaced.de'],
      'fenty': ['fenty.com', 'fenty.fr', 'fenty.es', 'fenty.it', 'fenty.de'],
      'rare-beauty': ['rarebeauty.com', 'rarebeauty.fr', 'rarebeauty.es', 'rarebeauty.it', 'rarebeauty.de'],
      'glossier': ['glossier.com', 'glossier.fr', 'glossier.es', 'glossier.it', 'glossier.de'],
      'drunk-elephant': ['drunkelephant.com', 'drunkelephant.fr', 'drunkelephant.es', 'drunkelephant.it', 'drunkelephant.de'],
      'the-ordinary': ['theordinary.com', 'theordinary.fr', 'theordinary.es', 'theordinary.it', 'theordinary.de'],
      'paulas-choice': ['paulaschoice.com', 'paulaschoice.fr', 'paulaschoice.es', 'paulaschoice.it', 'paulaschoice.de'],
      'cerave': ['cerave.com', 'cerave.fr', 'cerave.es', 'cerave.it', 'cerave.de'],
      'neutrogena': ['neutrogena.com', 'neutrogena.fr', 'neutrogena.es', 'neutrogena.it', 'neutrogena.de'],
      'olay': ['olay.com', 'olay.fr', 'olay.es', 'olay.it', 'olay.de'],
      'aveeno': ['aveeno.com', 'aveeno.fr', 'aveeno.es', 'aveeno.it', 'aveeno.de'],
      'cetaphil': ['cetaphil.com', 'cetaphil.fr', 'cetaphil.es', 'cetaphil.it', 'cetaphil.de'],
      'la-roche-posay': ['laroche-posay.com', 'laroche-posay.fr', 'laroche-posay.es', 'laroche-posay.it', 'laroche-posay.de'],
      'vichy': ['vichy.com', 'vichy.fr', 'vichy.es', 'vichy.it', 'vichy.de'],
      'avene': ['avene.com', 'avene.fr', 'avene.es', 'avene.it', 'avene.de'],
      'eucerin': ['eucerin.com', 'eucerin.fr', 'eucerin.es', 'eucerin.it', 'eucerin.de'],
      'bioderma': ['bioderma.com', 'bioderma.fr', 'bioderma.es', 'bioderma.it', 'bioderma.de'],
      'philips': ['philips.com', 'philips.fr', 'philips.es', 'philips.it', 'philips.de'],
      'braun': ['braun.com', 'braun.fr', 'braun.es', 'braun.it', 'braun.de'],
      'remington': ['remington.com', 'remington.fr', 'remington.es', 'remington.it', 'remington.de'],
      'conair': ['conair.com', 'conair.fr', 'conair.es', 'conair.it', 'conair.de'],
      'dyson': ['dyson.com', 'dyson.fr', 'dyson.es', 'dyson.it', 'dyson.de'],
      't3': ['t3micro.com', 't3micro.fr', 't3micro.es', 't3micro.it', 't3micro.de'],
      'ghd': ['ghd.com', 'ghd.fr', 'ghd.es', 'ghd.it', 'ghd.de'],
      'babyliss': ['babyliss.com', 'babyliss.fr', 'babyliss.es', 'babyliss.it', 'babyliss.de'],
      'wahl': ['wahl.com', 'wahl.fr', 'wahl.es', 'wahl.it', 'wahl.de'],
      'andis': ['andis.com', 'andis.fr', 'andis.es', 'andis.it', 'andis.de'],
      'oster': ['oster.com', 'oster.fr', 'oster.es', 'oster.it', 'oster.de'],
      
      // Dining brands
      'mcdonalds': ['mcdonalds.com', 'mcdonalds.fr', 'mcdonalds.es', 'mcdonalds.it', 'mcdonalds.de'],
      'kfc': ['kfc.com', 'kfc.fr', 'kfc.es', 'kfc.it', 'kfc.de'],
      'burgerking': ['burgerking.fr', 'burgerking.com', 'burgerking.es', 'burgerking.it', 'burgerking.de'],
      'quick': ['quick.be', 'quick.fr'],
      'starbucks': ['starbucks.com', 'starbucks.fr', 'starbucks.es', 'starbucks.it', 'starbucks.de'],
      'subway': ['subway.com', 'subway.fr', 'subway.es', 'subway.it', 'subway.de'],
      
      // Hotels
      'hilton': ['hilton.com', 'hilton.fr', 'hilton.es', 'hilton.it', 'hilton.de'],
      'marriott': ['marriott.com', 'marriott.fr', 'marriott.es', 'marriott.it', 'marriott.de'],
      'accor': ['accor.com', 'all.accor.com'],
      'ibis': ['ibis.com', 'all.accor.com'],
      'novotel': ['novotel.com', 'all.accor.com'],
      'mercure': ['mercure.com', 'all.accor.com'],
      'sofitel': ['sofitel.com', 'all.accor.com'],
      
      // Fashion & Retail
      'zara': ['zara.com', 'zara.fr', 'zara.es', 'zara.it', 'zara.de'],
      'hm': ['hm.com', '2.hm.com'],
      'uniqlo': ['uniqlo.com', 'uniqlo.fr', 'uniqlo.es', 'uniqlo.it', 'uniqlo.de']
    };
    
    return domainMap[brand] || [`${brand}.com`, `${brand}.fr`, `www.${brand}.com`, `www.${brand}.fr`];
  }

  private isOfficialDomain(url: string, brand: string): boolean {
    const domain = this.extractDomain(url).toLowerCase();
    const brandDomains = this.getBrandDomains(brand);
    
    // Check exact brand domain matches first
    const exactMatch = brandDomains.some(brandDomain => 
      domain.includes(brandDomain.toLowerCase())
    );
    
    if (exactMatch) {
      // Exclude marketplaces even for exact matches
      const isMarketplace = ['amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'leboncoin', 'ebay', 'rakuten'].some(
        marketplace => domain.includes(marketplace)
      );
      return !isMarketplace;
    }
    
    // Enhanced multilingual brand detection
    const brandVariants = this.getBrandVariants(brand);
    const containsBrandVariant = brandVariants.some(variant => domain.includes(variant.toLowerCase()));
    
    if (containsBrandVariant) {
      // Check if it's likely to be official (not a marketplace/review site)
      const isMarketplace = ['amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'leboncoin', 'ebay', 'rakuten',
        'tripadvisor', 'booking', 'expedia', 'yelp', 'facebook', 'instagram'].some(
        marketplace => domain.includes(marketplace)
      );
      
      // More lenient official domain detection
      const hasOfficialIndicators = 
        domain.includes('.com') || domain.includes('.fr') || domain.includes('.es') || 
        domain.includes('.it') || domain.includes('.de') || domain.includes('.org') || 
        domain.includes('official') || domain.includes('store') || domain.includes('shop');
      
      return !isMarketplace && hasOfficialIndicators;
    }
    
    return false;
  }

  private buildOfficialSiteQuery(brand: string, optionName: string, language: SupportedLanguage, vertical: string | null): string {
    // Clean option name to remove generic prefixes
    const cleanOptionName = optionName.replace(/^(option\s+\d+:\s*)/i, '').trim();
    
    // Language-specific official site queries
    const officialQueries = {
      fr: {
        automotive: `${brand} ${cleanOptionName} site officiel`,
        dining: `${brand} restaurant officiel`,
        accommodation: `${brand} hôtel officiel`,
        travel: `${brand} voyage officiel`,
        software: `${brand} ${cleanOptionName} téléchargement officiel`,
        general: `${brand} ${cleanOptionName} site officiel`
      },
      en: {
        automotive: `${brand} ${cleanOptionName} official site`,
        dining: `${brand} restaurant official`,
        accommodation: `${brand} hotel official`,
        travel: `${brand} travel official`,
        software: `${brand} ${cleanOptionName} official download`,
        general: `${brand} ${cleanOptionName} official site`
      },
      es: {
        automotive: `${brand} ${cleanOptionName} sitio oficial`,
        dining: `${brand} restaurante oficial`,
        accommodation: `${brand} hotel oficial`,
        travel: `${brand} viaje oficial`,
        software: `${brand} ${cleanOptionName} descarga oficial`,
        general: `${brand} ${cleanOptionName} sitio oficial`
      },
      it: {
        automotive: `${brand} ${cleanOptionName} sito ufficiale`,
        dining: `${brand} ristorante ufficiale`,
        accommodation: `${brand} hotel ufficiale`,
        travel: `${brand} viaggio ufficiale`,
        software: `${brand} ${cleanOptionName} download ufficiale`,
        general: `${brand} ${cleanOptionName} sito ufficiale`
      },
      de: {
        automotive: `${brand} ${cleanOptionName} offizielle website`,
        dining: `${brand} restaurant offizielle`,
        accommodation: `${brand} hotel offizielle`,
        travel: `${brand} reise offizielle`,
        software: `${brand} ${cleanOptionName} offizielle download`,
        general: `${brand} ${cleanOptionName} offizielle website`
      }
    };
    
    const langQueries = officialQueries[language] || officialQueries.en;
    const verticalKey = vertical && langQueries[vertical as keyof typeof langQueries] ? vertical : 'general';
    
    return langQueries[verticalKey as keyof typeof langQueries];
  }

  private getBrandVariants(brand: string): string[] {
    // Generate brand variants for better multilingual detection
    const variants = [brand];
    
    // Add common brand variations
    const brandVariations: Record<string, string[]> = {
      mercedes: ['mercedes', 'mercedes-benz', 'mercedesbenz'],
      mcdonalds: ['mcdonalds', 'mcdonald', 'mcdonald\'s'],
      volkswagen: ['volkswagen', 'vw'],
      burgerking: ['burgerking', 'burger-king', 'burger king']
    };
    
    if (brandVariations[brand]) {
      variants.push(...brandVariations[brand]);
    }
    
    return variants;
  }

  private isProductPage(url: string, optionName: string, brand: string): boolean {
    const lowerUrl = url.toLowerCase();
    const lowerOption = optionName.toLowerCase();
    const lowerBrand = brand.toLowerCase();
    
    // Check for product-specific URL patterns
    const productPatterns = [
      // Common product page indicators
      /\/product[s]?\/[^\/]+/,
      /\/item[s]?\/[^\/]+/,
      /\/detail[s]?\/[^\/]+/,
      /\/model[s]?\/[^\/]+/,
      /\/bike[s]?\/[^\/]+/,
      /\/car[s]?\/[^\/]+/,
      /\/phone[s]?\/[^\/]+/,
      /\/laptop[s]?\/[^\/]+/,
      /\/shoe[s]?\/[^\/]+/,
      /\/clothing\/[^\/]+/,
      /\/furniture\/[^\/]+/,
      /\/cosmetics\/[^\/]+/,
      /\/makeup\/[^\/]+/,
      /\/skincare\/[^\/]+/,
      // Brand-specific patterns
      new RegExp(`\\/${lowerBrand}\\/[^\\/]+`),
      // Product name in URL
      new RegExp(lowerOption.replace(/[^a-z0-9]/g, '[^a-z0-9]*'))
    ];
    
    // Check if URL contains product indicators
    const hasProductPattern = productPatterns.some(pattern => pattern.test(lowerUrl));
    
    // Check if URL contains the product name (with some flexibility)
    const cleanOptionName = lowerOption.replace(/[^a-z0-9]/g, '');
    const hasProductName = cleanOptionName.length > 3 && lowerUrl.includes(cleanOptionName);
    
    // Check if URL contains brand name
    const hasBrandName = lowerUrl.includes(lowerBrand);
    
    // Exclude homepage and category pages
    const isHomepage = /\/$/.test(url) || /\/home\/?$/.test(lowerUrl) || /\/index\.html?$/.test(lowerUrl);
    const isCategoryPage = /\/category\/[^\/]+$/.test(lowerUrl) || /\/collection\/[^\/]+$/.test(lowerUrl);
    
    return (hasProductPattern || hasProductName) && hasBrandName && !isHomepage && !isCategoryPage;
  }

  private constructProductPageUrl(homepageUrl: string, optionName: string, brand: string, vertical: string | null): string | null {
    try {
      const url = new URL(homepageUrl);
      const cleanOptionName = optionName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const slug = cleanOptionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Brand-specific URL construction patterns
      const brandPatterns: Record<string, string[]> = {
        'nike': [`/products/${slug}`, `/shoes/${slug}`, `/clothing/${slug}`],
        'adidas': [`/products/${slug}`, `/shoes/${slug}`, `/clothing/${slug}`],
        'apple': [`/products/${slug}`, `/iphone/${slug}`, `/mac/${slug}`, `/ipad/${slug}`],
        'samsung': [`/products/${slug}`, `/galaxy/${slug}`, `/smartphones/${slug}`],
        'trek': [`/bikes/${slug}`, `/products/${slug}`],
        'specialized': [`/bikes/${slug}`, `/products/${slug}`],
        'canyon': [`/bikes/${slug}`, `/products/${slug}`],
        'tern': [`/bikes/${slug}`, `/products/${slug}`],
        'yuba': [`/bikes/${slug}`, `/products/${slug}`],
        'riese-muller': [`/bikes/${slug}`, `/products/${slug}`],
        'decathlon': [`/products/${slug}`, `/bikes/${slug}`, `/sports/${slug}`],
        'ikea': [`/products/${slug}`, `/furniture/${slug}`],
        'zara': [`/products/${slug}`, `/clothing/${slug}`],
        'hm': [`/products/${slug}`, `/clothing/${slug}`],
        'uniqlo': [`/products/${slug}`, `/clothing/${slug}`],
        'loreal': [`/products/${slug}`, `/makeup/${slug}`, `/skincare/${slug}`],
        'maybelline': [`/products/${slug}`, `/makeup/${slug}`],
        'dior': [`/products/${slug}`, `/makeup/${slug}`, `/perfume/${slug}`],
        'chanel': [`/products/${slug}`, `/makeup/${slug}`, `/perfume/${slug}`]
      };
      
      // Vertical-specific patterns
      const verticalPatterns: Record<string, string[]> = {
        'automotive': [`/vehicles/${slug}`, `/cars/${slug}`, `/bikes/${slug}`, `/products/${slug}`],
        'fashion': [`/clothing/${slug}`, `/shoes/${slug}`, `/accessories/${slug}`, `/products/${slug}`],
        'beauty': [`/makeup/${slug}`, `/skincare/${slug}`, `/perfume/${slug}`, `/products/${slug}`],
        'home': [`/furniture/${slug}`, `/decor/${slug}`, `/products/${slug}`],
        'tech': [`/products/${slug}`, `/smartphones/${slug}`, `/laptops/${slug}`, `/electronics/${slug}`]
      };
      
      // Try brand-specific patterns first
      const brandPattern = brandPatterns[brand];
      if (brandPattern) {
        for (const pattern of brandPattern) {
          const testUrl = `${url.origin}${pattern}`;
          return testUrl;
        }
      }
      
      // Try vertical-specific patterns
      if (vertical && verticalPatterns[vertical]) {
        for (const pattern of verticalPatterns[vertical]) {
          const testUrl = `${url.origin}${pattern}`;
          return testUrl;
        }
      }
      
      // Generic product page pattern
      return `${url.origin}/products/${slug}`;
      
    } catch (error) {
      console.log(`⚠️ Failed to construct product URL: ${error.message}`);
      return null;
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  // Méthode publique pour migrer les anciens caches
  static migrateOldCaches(): void {
    try {
      // Migrer depuis result.cachedActionLinks si disponible
      const oldCache = localStorage.getItem('rationable_decision_cache');
      if (oldCache) {
        const data = JSON.parse(oldCache);
        if (data.cachedActionLinks) {
          actionLinksCacheService.migrateFromOldCache(data.cachedActionLinks);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to migrate old caches:', error);
    }
  }

  private separateOfficialAndMerchants(results: any[], brand: string | null, existingOfficial: any, cityContext?: string | null, actionType?: string) {
    const merchants: any[] = [];
    let official = existingOfficial;
    
    for (const result of results) {
      const domain = this.extractDomain(result.url);
      
      // Skip if we already have this domain
      if (merchants.some(m => m.domain === domain) || (official && official.domain === domain)) {
        continue;
      }
      
      // If no official yet and this looks official
      if (!official && brand && this.isOfficialDomain(result.url, brand)) {
        official = {
          url: result.url,
          title: result.title,
          domain
        };
        continue;
      }
      
      // Add to merchants if it's a known e-commerce site
      if (this.isMerchantDomain(domain)) {
        let score = this.scoreMerchant(domain, result.title);
        
        // Boost score if merchant matches city context
        if (cityContext && (result.title.toLowerCase().includes(cityContext.toLowerCase()) || 
                           result.url.toLowerCase().includes(cityContext.toLowerCase()))) {
          score += 5;
        }
        
        // Boost relevant merchants based on action type
        score += this.getActionTypeBonus(domain, actionType || 'buy');
        
        merchants.push({
          ...result,
          domain,
          _score: score
        });
      }
    }
    
    // Sort merchants by score and return top ones
    merchants.sort((a, b) => b._score - a._score);
    
    return {
      official,
      merchants: merchants.slice(0, 5) // Get top 5 for verification
    };
  }

  private isMerchantDomain(domain: string): boolean {
    const merchantDomains = [
      // E-commerce platforms
      'amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'leboncoin',
      'rueducommerce', 'ldlc', 'materiel', 'grosbill', 'topachat',
      'conforama', 'but', 'castorama', 'leroy-merlin',
      
      // Booking/Reservation platforms
      'booking.com', 'expedia', 'hotels.com', 'agoda', 'trivago', 'kayak',
      'airbnb', 'vrbo', 'homeaway',
      
      // Restaurant booking platforms + Review sites (important for local businesses)
      'opentable', 'thefork', 'lafourchette', 'resy', 'yelp',
      'tripadvisor', 'zomato', 'deliveroo', 'ubereats', 'justeat',
      
      // Activity/Experience platforms
      'viator', 'getyourguide', 'klook', 'tiqets', 'ticketmaster',
      'eventbrite', 'stubhub', 'seetickets',
      
      // Travel platforms
      'sncf-connect', 'trainline', 'omio', 'flixbus', 'ouibus',
      'blablacar', 'europcar', 'hertz', 'avis', 'sixt'
    ];
    
    // Check if it's a merchant domain but completely exclude all Google domains
    const isMerchant = merchantDomains.some(merchant => domain.includes(merchant));
    
    // Exclude ALL Google domains from merchants (Google Maps should only be via maps button)
    if (domain.includes('google')) {
      return false;
    }
    
    return isMerchant;
  }

  private scoreMerchant(domain: string, title: string): number {
    let score = 0;
    
    // Review/Rating platforms (high priority for local businesses)
    if (domain.includes('tripadvisor')) score += 15; // Higher than booking for local restaurants
    if (domain.includes('yelp')) score += 13;
    // Google completely removed from merchant scoring (handled via maps button only)
    
    // Premium booking platforms
    if (domain.includes('booking.com')) score += 12;
    if (domain.includes('opentable')) score += 11;
    if (domain.includes('thefork') || domain.includes('lafourchette')) score += 11;
    
    // Premium e-commerce
    if (domain.includes('amazon')) score += 10;
    if (domain.includes('fnac')) score += 9;
    if (domain.includes('darty')) score += 8;
    if (domain.includes('boulanger')) score += 7;
    
    // Travel & activity platforms
    if (domain.includes('viator')) score += 9;
    if (domain.includes('getyourguide')) score += 9;
    if (domain.includes('expedia')) score += 8;
    if (domain.includes('airbnb')) score += 8;
    
    // Standard merchants
    if (domain.includes('cdiscount')) score += 6;
    if (domain.includes('rueducommerce')) score += 5;
    if (domain.includes('ldlc')) score += 5;
    
    // Restaurant delivery
    if (domain.includes('deliveroo') || domain.includes('ubereats')) score += 6;
    
    // Bonus for title containing relevant keywords
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('avis') || lowerTitle.includes('review') || lowerTitle.includes('note')) score += 4;
    if (lowerTitle.includes('réserver') || lowerTitle.includes('book')) score += 3;
    if (lowerTitle.includes('prix') || lowerTitle.includes('price')) score += 2;
    if (lowerTitle.includes('acheter') || lowerTitle.includes('buy')) score += 2;
    if (lowerTitle.includes('restaurant') || lowerTitle.includes('hotel')) score += 2;
    
    return score;
  }

  getDomainLabel(domain: string): string {
    const labelMap: Record<string, string> = {
      'amazon': 'Amazon',
      'fnac': 'Fnac',
      'cdiscount': 'Cdiscount',
      'darty': 'Darty',
      'boulanger': 'Boulanger',
      'ldlc': 'LDLC',
      'materiel': 'Materiel.net',
      'rueducommerce': 'Rue du Commerce',
      'topachat': 'TopAchat',
      'grosbill': 'Grosbill',
      'samsung': 'Samsung',
      'apple': 'Apple',
      'toyota': 'Toyota',
      'honda': 'Honda',
      'peugeot': 'Peugeot',
      'booking': 'Booking',
      'airbnb': 'Airbnb',
      'tripadvisor': 'TripAdvisor',
      'yelp': 'Yelp',
      'thefork': 'LaFourche',
      // 'google': 'Google', // Removed - Google should only appear via maps button
      'expedia': 'Expedia',
      'hotels': 'Hotels.com',
      'kayak': 'Kayak',
      'skyscanner': 'Skyscanner',
      'opentable': 'OpenTable',
      'leboncoin': 'Leboncoin',
      'ebay': 'eBay',
      'carrefour': 'Carrefour',
      'leclerc': 'Leclerc',
      'auchan': 'Auchan',
      'conforama': 'Conforama',
      'ikea': 'IKEA',
      'decathlon': 'Decathlon'
    };
    
    // Normalize domain: remove www, extract main domain
    const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
    
    // Extract the main domain name (handle subdomains like fr.booking.com)
    const parts = cleanDomain.split('.');
    let mainDomain = '';
    
    // For domains like fr.booking.com, we want "booking"
    // For domains like booking.com, we want "booking"
    if (parts.length >= 2) {
      // Check if the second-to-last part is a known brand
      const secondToLast = parts[parts.length - 2];
      if (labelMap[secondToLast]) {
        mainDomain = secondToLast;
      } else {
        // If no match, use the first non-language subdomain
        // Skip common language codes
        const languageCodes = ['fr', 'en', 'es', 'de', 'it', 'nl', 'pt', 'ru', 'ja', 'ko', 'zh', 'www'];
        for (const part of parts) {
          if (!languageCodes.includes(part) && part.length > 2) {
            mainDomain = part;
            break;
          }
        }
        
        // If still no main domain, use the second-to-last part
        if (!mainDomain && parts.length >= 2) {
          mainDomain = parts[parts.length - 2];
        }
      }
    } else {
      mainDomain = parts[0];
    }
    
    // Try to find a match in our label map
    if (labelMap[mainDomain]) {
      return labelMap[mainDomain];
    }
    
    // Try partial matches for compound names
    for (const [key, label] of Object.entries(labelMap)) {
      if (mainDomain.includes(key) || key.includes(mainDomain)) {
        return label;
      }
    }
    
    // Fallback: capitalize the main domain
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  }
  
  private classifyActionType(optionName: string, vertical: string | null, dilemma?: string): 'directions' | 'reserve' | 'buy' {
    const lowerOption = optionName.toLowerCase();
    const lowerDilemma = dilemma?.toLowerCase() || '';
    
    // Check if there's a city context in the dilemma
    const hasCityContext = this.extractCityFromDilemma(dilemma || '') !== null;
    
    // Product keywords that should always be 'buy' (never directions)
    const productKeywords = [
      // Bikes and cycling
      'vélo', 'bicyclette', 'bicycle', 'bike', 'ebike', 'cargo', 'longtail', 'cyclisme',
      // Cars and vehicles
      'voiture', 'auto', 'car', 'véhicule', 'vehicle', 'automobile', 'moto', 'motorcycle',
      // Electronics
      'iphone', 'smartphone', 'laptop', 'ordinateur', 'computer', 'tablette', 'tablet',
      // Other products
      'livre', 'book', 'vêtement', 'clothing', 'chaussure', 'shoe', 'montre', 'watch'
    ];
    
    // If it's clearly a product, always return 'buy'
    if (productKeywords.some(keyword => lowerOption.includes(keyword))) {
      return 'buy';
    }
    
    // If it's automotive vertical (includes bikes), always return 'buy'
    if (vertical === 'automotive') {
      return 'buy';
    }
    
    // Local business keywords that indicate physical locations
    const localBusinessKeywords = [
      // Food & dining
      'restaurant', 'café', 'bar', 'bistrot', 'brasserie', 'pizzeria', 'crêperie',
      'boulangerie', 'pâtisserie', 'deli', 'sandwicherie', 'fast-food', 'food truck',
      'traiteur', 'glacier', 'salon de thé',
      // Services & shopping
      'magasin', 'boutique', 'shop', 'store', 'pharmacie', 'librairie', 'pressing',
      'coiffeur', 'barbier', 'institut', 'spa', 'garage', 'station-service',
      // Entertainment & culture  
      'cinéma', 'théâtre', 'discothèque', 'club', 'casino', 'bowling',
      // Accommodation
      'hôtel', 'auberge', 'gîte', 'chambre d\'hôte', 'hostel'
    ];
    
    // Places/locations that need directions
    const locationKeywords = [
      'château', 'castle', 'colline', 'hill', 'mont', 'mountain', 'plage', 'beach', 
      'parc', 'park', 'jardin', 'garden', 'musée', 'museum', 'cathédrale', 'cathedral',
      'église', 'church', 'marché', 'market', 'centre', 'center', 'quartier', 'district',
      'promenade', 'promenada', 'corso', 'avenue', 'rue', 'street', 'place', 'square',
      'tour', 'tower', 'pont', 'bridge', 'fort', 'bastille', 'citadelle'
    ];
    
    // If it's a place/location, always directions
    if (locationKeywords.some(keyword => lowerOption.includes(keyword))) {
      return 'directions';
    }
    
    // If dilemma contains local search terms + city context, likely a local business
    const localSearchTerms = ['où', 'where', 'dónde', 'dove', 'wo', 'près de', 'near', 'cerca', 'vicino', 'autour'];
    const hasLocalSearch = localSearchTerms.some(term => lowerDilemma.includes(term));
    
    // If it's a dining question with local context, prioritize directions over reservation
    if (hasCityContext && (hasLocalSearch || lowerDilemma.includes('manger') || lowerDilemma.includes('eat'))) {
      // Check if the option looks like a local business
      if (localBusinessKeywords.some(keyword => 
        lowerOption.includes(keyword) || lowerDilemma.includes(keyword)
      )) {
        return 'directions';
      }
      
      // If it's clearly a restaurant/food place with a proper name (not generic)
      if ((vertical === 'dining' || lowerDilemma.includes('restaurant') || lowerDilemma.includes('sandwich')) && 
          optionName.length > 3 && !lowerOption.includes('option')) {
        return 'directions';
      }
    }
    
    // Services that need reservations (only if not a local search)
    if (!hasCityContext && (vertical === 'dining' || vertical === 'accommodation' || vertical === 'travel')) {
      return 'reserve';
    }
    
    // Products that need to be bought
    return 'buy';
  }
  
  private extractCityFromDilemma(dilemma: string): string | null {
    const lowerDilemma = dilemma.toLowerCase();
    
    // Common city patterns
    const cityPatterns = [
      /(?:à|in|en|dans|cerca de|vicino a|bei)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\s|,|\?|$)/g,
      /(?:ville de|city of|ciudad de|città di|stadt)\s+([a-zA-ZÀ-ÿ]+)/g,
      /([a-zA-ZÀ-ÿ]+)\s+(?:city|ville|ciudad|città)/g
    ];
    
    // Known major cities for better detection
    const knownCities = [
      'nice', 'paris', 'londres', 'madrid', 'barcelone', 'rome', 'milan', 'berlin',
      'munich', 'vienne', 'amsterdam', 'bruxelles', 'geneva', 'zurich', 'lisboa',
      'porto', 'florence', 'venise', 'naples', 'turin', 'bologne', 'palermo',
      'lyon', 'marseille', 'toulouse', 'bordeaux', 'nantes', 'strasbourg', 'lille',
      'london', 'manchester', 'birmingham', 'liverpool', 'edinburgh', 'glasgow',
      'valencia', 'sevilla', 'bilbao', 'malaga', 'zaragoza', 'palma', 'valencia'
    ];
    
    // First try to match known cities directly
    for (const city of knownCities) {
      if (lowerDilemma.includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
    
    // Then try patterns
    for (const pattern of cityPatterns) {
      const matches = Array.from(lowerDilemma.matchAll(pattern));
      for (const match of matches) {
        const cityCandidate = match[1]?.trim();
        if (cityCandidate && cityCandidate.length > 2 && cityCandidate.length < 20) {
          return cityCandidate.charAt(0).toUpperCase() + cityCandidate.slice(1);
        }
      }
    }
    
    return null;
  }
  
  private getActionTypeBonus(domain: string, actionType: string): number {
    let bonus = 0;
    
    switch (actionType) {
      case 'directions':
        // Boost review/rating sites for local businesses (restaurants, shops, etc.)
        if (domain.includes('tripadvisor') || domain.includes('yelp')) bonus += 12;
        // Google removed from bonus scoring - only handled via maps button
        break;
        
      case 'reserve':
        // Boost booking platforms for reservations
        if (domain.includes('booking') || domain.includes('opentable') || 
            domain.includes('thefork') || domain.includes('airbnb') ||
            domain.includes('expedia') || domain.includes('hotels')) bonus += 8;
        break;
        
      case 'buy':
        // Boost e-commerce for purchases
        if (domain.includes('amazon') || domain.includes('fnac') ||
            domain.includes('darty') || domain.includes('cdiscount')) bonus += 6;
        break;
    }
    
    return bonus;
  }

  private isPertinentLink(url: string, vertical: string | null, optionName: string): boolean {
    const lowerUrl = url.toLowerCase();
    const lowerOption = optionName.toLowerCase();
    
    // Filter out generic search engines and irrelevant domains
    const irrelevantDomains = [
      'google.com/search', 'google.fr/search', 'bing.com', 'yahoo.com',
      'duckduckgo.com', 'search.', '/search?'
    ];
    
    if (irrelevantDomains.some(domain => lowerUrl.includes(domain))) {
      return false;
    }
    
    // Context-specific filtering - make automotive less restrictive
    if (vertical === 'automotive') {
      // For automotive, avoid Amazon but be more lenient with other domains
      if (lowerUrl.includes('amazon.')) {
        console.log(`❌ Filtering out Amazon for automotive: ${url}`);
        return false;
      }
      
      // Allow broader automotive-relevant domains (less restrictive)
      const automotiveDomains = [
        // Official car brands
        'toyota', 'honda', 'ford', 'bmw', 'mercedes', 'audi', 'volkswagen',
        'peugeot', 'renault', 'citroen', 'dacia', 'hyundai', 'kia', 'nissan',
        'mazda', 'subaru', 'opel', 'fiat', 'skoda', 'seat', 'volvo',
        // Car marketplaces and info sites  
        'lacentrale', 'autoscout24', 'leboncoin', 'paruvendu', 'caradisiac',
        'largus', 'autoplus', 'turbo', 'auto-moto', 'challenges',
        // Generic automotive terms
        'automobile', 'voiture', 'auto', 'car', 'dealer', 'concessionnaire'
      ];
      
      const hasAutomotiveRelevance = automotiveDomains.some(domain => lowerUrl.includes(domain)) ||
        lowerUrl.includes('auto') || lowerUrl.includes('car') || lowerUrl.includes('voiture');
      
      if (!hasAutomotiveRelevance) {
        console.log(`❌ Filtering out non-automotive domain: ${url}`);
        return false;
      }
    }
    
    // For dining/local businesses, avoid generic e-commerce
    if (vertical === 'dining' || vertical === 'accommodation') {
      const genericEcommerce = ['amazon.', 'cdiscount.', 'fnac.', 'darty.'];
      if (genericEcommerce.some(domain => lowerUrl.includes(domain))) {
        console.log(`❌ Filtering out generic e-commerce for ${vertical}: ${url}`);
        return false;
      }
    }
    
    return true;
  }
}

export const firstResultService = new FirstResultService();