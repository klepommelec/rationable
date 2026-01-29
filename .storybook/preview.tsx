import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../src/components/theme-provider';
import { TooltipProvider } from '../src/components/ui/tooltip';
import { I18nUIProvider } from '../src/contexts/I18nUIContext';
import { AuthProvider } from '../src/hooks/useAuth';
import { WorkspacesProvider } from '../src/contexts/WorkspacesContext';

// Create a QueryClient for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper with all necessary providers
const StorybookProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WorkspacesProvider>
              <I18nUIProvider>
                {children}
              </I18nUIProvider>
            </WorkspacesProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
      ],
    },
    a11y: {
      test: 'todo'
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <StorybookProviders>
        <div className="p-4">
          <Story />
        </div>
      </StorybookProviders>
    ),
  ],
};

export default preview;