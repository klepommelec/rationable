import * as Sentry from '@sentry/react';
import React from 'react';

/**
 * Configuration de Sentry pour le monitoring des erreurs
 */
export const initSentry = () => {
  // Vérifier si nous sommes en production et si la DSN est configurée
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Configuration des traces
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Configuration des sessions
    replaysSessionSampleRate: environment === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filtrage des erreurs
    beforeSend(event, hint) {
      // Envoyer en développement pour les tests
      if (environment === 'development') {
        console.log('Sentry Event:', event);
        return event; // Envoyer en développement pour les tests
      }

      // Filtrer les erreurs de réseau
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Filtrer les erreurs de réseau
          if (error.message.includes('Network Error') || 
              error.message.includes('Failed to fetch')) {
            return null;
          }
        }
      }

      return event;
    },

    // Configuration des tags
    initialScope: {
      tags: {
        component: 'rationable-app',
      },
    },
  });

  console.log('Sentry initialized successfully');
};

/**
 * Capture une erreur manuellement
 */
export const captureException = (error: unknown, context?: Record<string, any>) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
    console.error('Error captured by Sentry:', error, context);
  } else {
    console.error('Sentry not initialized. Error:', error, context);
  }
};

/**
 * Capture un message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, { level, extra: context });
    console.log(`Message captured by Sentry (${level}):`, message, context);
  } else {
    console.log(`Sentry not initialized. Message (${level}):`, message, context);
  }
};

/**
 * Composant Error Boundary avec Sentry
 */
export const SentryErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}> = ({ children, fallback: Fallback }) => {
  const defaultFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
    if (Fallback) {
      return React.createElement(Fallback, { error, resetError });
    }
    
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
      React.createElement('div', { className: 'max-w-md w-full bg-white shadow-lg rounded-lg p-6' },
        React.createElement('div', { className: 'flex items-center mb-4' },
          React.createElement('div', { className: 'flex-shrink-0' },
            React.createElement('svg', { 
              className: 'h-8 w-8 text-red-500', 
              fill: 'none', 
              viewBox: '0 0 24 24', 
              stroke: 'currentColor' 
            },
              React.createElement('path', { 
                strokeLinecap: 'round', 
                strokeLinejoin: 'round', 
                strokeWidth: 2, 
                d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' 
              })
            )
          ),
          React.createElement('div', { className: 'ml-3' },
            React.createElement('h3', { className: 'text-lg font-medium text-gray-900' },
              'Une erreur s\'est produite'
            )
          )
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('p', { className: 'text-sm text-gray-600' },
            'Désolé, quelque chose s\'est mal passé. L\'erreur a été automatiquement signalée à notre équipe.'
          )
        ),
        React.createElement('div', { className: 'flex space-x-3' },
          React.createElement('button', {
            onClick: resetError,
            className: 'bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700'
          }, 'Réessayer'),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            className: 'bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700'
          }, 'Recharger la page')
        )
      )
    );
  };

  return React.createElement(Sentry.ErrorBoundary, {
    fallback: defaultFallback,
    beforeCapture: (scope: any, error: Error, errorInfo: any) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
    }
  }, children);
};

/**
 * Utilitaires Sentry
 */
export const sentryUtils = {
  /**
   * Ajouter des tags personnalisés
   */
  setTag: (key: string, value: string) => {
    Sentry.setTag(key, value);
  },

  /**
   * Ajouter du contexte personnalisé
   */
  setContext: (key: string, context: any) => {
    Sentry.setContext(key, context);
  },

  /**
   * Ajouter des données utilisateur
   */
  setUser: (user: { id?: string; email?: string; username?: string }) => {
    Sentry.setUser(user);
  },

  /**
   * Créer une transaction personnalisée
   */
  startTransaction: (name: string, op: string = 'custom') => {
    return Sentry.startSpan({ name, op }, () => {});
  },

  /**
   * Créer un span personnalisé
   */
  startSpan: (name: string, callback: (span: any) => void) => {
    return Sentry.startSpan({ name }, callback);
  },
};