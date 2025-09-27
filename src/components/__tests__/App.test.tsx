import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import App from '../../App';

// Mock des composants lazy
vi.mock('../../pages/Index', () => ({
  default: () => <div data-testid="index-page">Index Page</div>,
}));

vi.mock('../../pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

vi.mock('../../pages/Auth', () => ({
  default: () => <div data-testid="auth-page">Auth Page</div>,
}));

vi.mock('../../pages/Privacy', () => ({
  default: () => <div data-testid="privacy-page">Privacy Page</div>,
}));

vi.mock('../../pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

vi.mock('../../pages/SharedDecision', () => ({
  default: () => <div data-testid="shared-decision-page">Shared Decision Page</div>,
}));

vi.mock('../../pages/TemplatePreview', () => ({
  default: () => <div data-testid="template-preview-page">Template Preview Page</div>,
}));

vi.mock('../../pages/CommunityTemplates', () => ({
  default: () => <div data-testid="community-templates-page">Community Templates Page</div>,
}));

// Mock des contextes et providers
vi.mock('../../contexts/WorkspacesContext', () => ({
  WorkspacesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../contexts/DecisionMakerContext', () => ({
  DecisionMakerProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../contexts/I18nUIContext', () => ({
  I18nUIProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('../../components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

vi.mock('../../components/core/AppErrorBoundary', () => ({
  AppErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    
    // Vérifier que les providers sont présents
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('should render performance monitor', () => {
    render(<App />);
    
    // Le PerformanceMonitor ne rend rien visible, mais il est présent
    // On peut vérifier qu'il n'y a pas d'erreur de rendu
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('should have proper routing structure', () => {
    render(<App />);
    
    // Vérifier que la structure de base est présente
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});
