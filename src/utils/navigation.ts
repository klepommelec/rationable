/**
 * Navigation utilities for handling external links in embedded contexts
 */

/**
 * Forces external links to open by bypassing iframe restrictions
 * This is essential when the app runs inside an iframe that may block certain domains
 */
export const openExternal = (url: string, target: string = '_blank'): void => {
  try {
    // For iframe contexts, try to navigate the top window directly
    if (window.top && window.top !== window.self) {
      // Try to post message to parent to handle navigation
      try {
        window.top.postMessage({ type: 'OPEN_EXTERNAL_URL', url, target }, '*');
        
        // Fallback: Direct navigation to top window
        setTimeout(() => {
          if (window.top && confirm(`Ouvrir le lien dans un nouvel onglet ?\n${url}`)) {
            window.top.location.href = url;
          }
        }, 100);
        return;
      } catch (e) {
        // If postMessage fails, try direct navigation
        window.top.location.href = url;
        return;
      }
    }

    // Regular window.open for non-iframe contexts
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