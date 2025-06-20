
import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(breakpoints: Partial<BreakpointConfig> = {}) {
  const config = { ...defaultBreakpoints, ...breakpoints };
  
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return 'sm';
    const width = window.innerWidth;
    if (width >= config['2xl']) return '2xl';
    if (width >= config.xl) return 'xl';
    if (width >= config.lg) return 'lg';
    if (width >= config.md) return 'md';
    return 'sm';
  });

  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width >= config['2xl']) setScreenSize('2xl');
      else if (width >= config.xl) setScreenSize('xl');
      else if (width >= config.lg) setScreenSize('lg');
      else if (width >= config.md) setScreenSize('md');
      else setScreenSize('sm');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config]);

  const isMobile = screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const isDesktop = ['lg', 'xl', '2xl'].includes(screenSize);
  const isLargeScreen = ['xl', '2xl'].includes(screenSize);

  return {
    screenSize,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    breakpoints: config,
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
