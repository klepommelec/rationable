/**
 * Utility to get favicon URLs for domains with fallback providers
 */

export interface FaviconSource {
  url: string;
  srcSet?: string;
}

/**
 * Get favicon sources with multiple fallbacks and high resolution support
 */
export const getFaviconSources = (url: string, size: number = 32): FaviconSource[] => {
  try {
    const domain = new URL(url).hostname;
    const retinaSize = size * 2;
    
    return [
      {
        url: `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=${size}`,
        srcSet: `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=${size} 1x, https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=${retinaSize} 2x`
      },
      {
        url: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      },
      {
        url: `https://logo.clearbit.com/${domain}?size=${size}`,
      }
    ];
  } catch {
    return [
      {
        url: `https://s2.googleusercontent.com/s2/favicons?domain=google.com&sz=${size}`,
      }
    ];
  }
};

/**
 * Legacy function for backward compatibility
 */
export const getFaviconUrl = (url: string): string => {
  const sources = getFaviconSources(url, 16);
  return sources[0].url;
};

/**
 * Get high resolution favicon URL (32px) for better quality
 */
export const getHighResFaviconUrl = (url: string): string => {
  const sources = getFaviconSources(url, 32);
  return sources[0].url;
};