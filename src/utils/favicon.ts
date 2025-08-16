/**
 * Utility to get favicon URLs for domains
 */

/**
 * Get favicon URL for a domain using Google S2 Favicons service
 */
export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    // Fallback for invalid URLs
    return `https://s2.googleusercontent.com/s2/favicons?domain=google.com&sz=16`;
  }
};

/**
 * Get high resolution favicon URL (32px) for better quality
 */
export const getHighResFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return `https://s2.googleusercontent.com/s2/favicons?domain=google.com&sz=32`;
  }
};