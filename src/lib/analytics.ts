/**
 * Analytics loader that safely loads Ahrefs analytics
 * Only loads when not in an iframe to prevent CSP issues
 */
export const loadAnalytics = () => {
  // Don't load analytics if we're in an iframe (like edit mode)
  if (window.self !== window.top) {
    console.log('Analytics not loaded: running in iframe');
    return;
  }

  // Don't load analytics in development mode
  if (import.meta.env.DEV) {
    console.log('Analytics not loaded: development mode');
    return;
  }

  try {
    const script = document.createElement('script');
    script.src = 'https://analytics.ahrefs.com/analytics.js';
    script.setAttribute('data-key', 'Es7KQT7nseDgV1Y1CZKpZQ');
    script.async = true;
    
    script.onerror = () => {
      console.warn('Failed to load Ahrefs analytics');
    };
    
    document.head.appendChild(script);
    console.log('Ahrefs analytics loaded successfully');
  } catch (error) {
    console.warn('Error loading analytics:', error);
  }
};