/**
 * Navigation utilities for handling external links in embedded contexts
 */

/**
 * Forces external links to open in a new window/tab, bypassing iframe restrictions
 * This is essential when the app runs inside an iframe that may block certain domains
 */
export const openExternal = (url: string, target: string = '_blank'): void => {
  try {
    // First try: Use window.top to break out of iframe
    if (window.top && window.top !== window.self) {
      window.top.open(url, target, 'noopener,noreferrer');
      return;
    }

    // Fallback: Regular window.open
    window.open(url, target, 'noopener,noreferrer');
  } catch (error) {
    console.warn('Failed to open external URL:', error);
    // Last resort: navigate current window
    window.location.href = url;
  }
};

/**
 * Enhanced click handler for external links that may be blocked by iframe restrictions
 */
export const handleExternalLinkClick = (
  event: React.MouseEvent,
  url: string,
  target: string = '_blank'
): void => {
  event.preventDefault();
  openExternal(url, target);
};