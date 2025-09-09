// Configuration constants
export const APP_CONFIG = {
  // Custom domain for sharing URLs
  DOMAIN: 'https://www.rationable.ai',
  
  // Fallback to current origin if needed
  getShareDomain: () => {
    // In production, always use custom domain
    if (typeof window !== 'undefined' && window.location.hostname.includes('rationable.ai')) {
      return 'https://www.rationable.ai';
    }
    // For development or staging, use current origin
    return typeof window !== 'undefined' ? window.location.origin : 'https://www.rationable.ai';
  }
};