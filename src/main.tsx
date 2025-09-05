import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { I18nService } from '@/services/i18nService'
import { loadAnalytics } from '@/lib/analytics'

// Initialize language from localStorage on app start
I18nService.initializeLanguage();

// Load analytics safely
loadAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
