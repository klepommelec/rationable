import React from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { I18nService } from '@/services/i18nService'
import { loadAnalytics } from '@/lib/analytics'
// Configuration Sentry - temporairement désactivé
// import { initSentry, SentryErrorBoundary } from '@/lib/sentry'

// Initialiser Sentry si la DSN est configurée
// if (import.meta.env.VITE_SENTRY_DSN) {
//   initSentry();
// }

// axe-core temporairement désactivé
// if (import.meta.env.DEV) {
//   import('@axe-core/react').then(axe => {
//     axe.default(React, ReactDOM, 1000);
//   }).catch(() => {
//     console.warn('Axe-core not available');
//   });
// }

// Initialize language from localStorage on app start
I18nService.initializeLanguage();

// Load analytics safely
loadAnalytics();

// Rendre l'application avec Sentry Error Boundary
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
