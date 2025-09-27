import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@/test/test-utils';
import { PerformanceMonitor } from '../PerformanceMonitor';

// Mock de PerformanceObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

// Mock de performance.now
global.performance = {
  ...global.performance,
  now: vi.fn(() => 1000),
};

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should render without crashing', () => {
    const { container } = render(<PerformanceMonitor />);
    // Le composant ne rend rien visible, mais peut ajouter des scripts
    expect(container).toBeInTheDocument();
  });

  it('should set up performance observer on mount', () => {
    render(<PerformanceMonitor />);
    
    expect(global.PerformanceObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['navigation'] });
  });

  it('should log performance metrics', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<PerformanceMonitor />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('⚡ Render Time:'),
      expect.any(Number),
      'ms'
    );
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = render(<PerformanceMonitor />);
    unmount();
    
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
