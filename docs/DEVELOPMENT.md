# 🛠️ Guide de Développement Local

Ce guide vous accompagne dans la configuration et le développement local de Rationable.

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du Projet](#structure-du-projet)
- [Scripts Disponibles](#scripts-disponibles)
- [Développement](#développement)
- [Tests](#tests)
- [Build et Déploiement](#build-et-déploiement)
- [Dépannage](#dépannage)
- [Outils de Développement](#outils-de-développement)

## 🔧 Prérequis

### Logiciels Requis

- **Node.js** 18+ ([installer avec nvm](https://github.com/nvm-sh/nvm))
- **npm** 9+ ou **bun** 1.0+
- **Git** pour le versioning
- **VS Code** (recommandé) ou votre IDE préféré

### Extensions VS Code Recommandées

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Vérification de l'Installation

```bash
# Vérifier Node.js
node --version  # Doit être >= 18.0.0

# Vérifier npm
npm --version   # Doit être >= 9.0.0

# Vérifier Git
git --version
```

## 🚀 Installation

### 1. Cloner le Repository

```bash
# Cloner le repository
git clone https://github.com/klepommelec/rationable.git
cd rationable

# Vérifier la branche
git branch
```

### 2. Installer les Dépendances

```bash
# Avec npm (recommandé)
npm install

# Ou avec bun (plus rapide)
bun install

# Vérifier l'installation
npm list --depth=0
```

### 3. Configuration des Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env
nano .env  # ou code .env
```

### 4. Configuration Supabase

#### Créer un Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer l'URL et la clé anonyme
4. Configurer les variables d'environnement

#### Variables d'Environnement Requises

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# APIs IA (optionnelles pour le développement)
VITE_OPENAI_API_KEY=sk-...
VITE_PERPLEXITY_API_KEY=pplx-...
VITE_CLAUDE_API_KEY=sk-ant-...

# Configuration de développement
VITE_APP_ENV=development
VITE_DEBUG=true
```

### 5. Configuration de la Base de Données

#### Exécuter les Migrations

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref your-project-id

# Exécuter les migrations
supabase db push
```

#### Vérifier la Configuration

```bash
# Tester la connexion
npm run test:db-connection
```

## 📁 Structure du Projet

```
rationable/
├── 📁 public/                 # Assets statiques
│   ├── 📄 favicon.ico
│   ├── 📄 logo.svg
│   └── 📄 robots.txt
├── 📁 src/
│   ├── 📁 components/         # Composants React
│   │   ├── 📁 ui/            # Composants UI de base
│   │   ├── 📁 decision-maker/ # Composants de décision
│   │   ├── 📁 workspace/     # Gestion des espaces
│   │   ├── 📁 settings/      # Configuration
│   │   └── 📁 __tests__/     # Tests des composants
│   ├── 📁 hooks/             # Hooks personnalisés
│   │   ├── 📄 useAuth.tsx
│   │   ├── 📄 useWorkspaces.tsx
│   │   ├── 📄 useDecisionMaker.tsx
│   │   └── 📁 __tests__/     # Tests des hooks
│   ├── 📁 services/          # Services API
│   │   ├── 📄 decisionService.ts
│   │   ├── 📄 workspaceService.ts
│   │   └── 📄 aiService.ts
│   ├── 📁 contexts/          # Contextes React
│   │   ├── 📄 AuthContext.tsx
│   │   └── 📄 WorkspaceContext.tsx
│   ├── 📁 types/             # Types TypeScript
│   │   ├── 📄 decision.ts
│   │   ├── 📄 workspace.ts
│   │   └── 📄 user.ts
│   ├── 📁 utils/             # Fonctions utilitaires
│   │   ├── 📄 helpers.ts
│   │   ├── 📄 validation.ts
│   │   └── 📄 constants.ts
│   ├── 📁 pages/             # Pages de l'application
│   │   ├── 📄 Index.tsx
│   │   ├── 📄 Auth.tsx
│   │   └── 📄 Settings.tsx
│   ├── 📁 test/              # Configuration des tests
│   │   ├── 📄 setup.ts
│   │   ├── 📄 test-utils.tsx
│   │   └── 📁 mocks/
│   ├── 📄 App.tsx            # Composant principal
│   ├── 📄 main.tsx           # Point d'entrée
│   └── 📄 vite-env.d.ts      # Types Vite
├── 📁 supabase/              # Configuration Supabase
│   ├── 📁 migrations/        # Migrations de base de données
│   ├── 📁 functions/         # Edge Functions
│   └── 📄 config.toml        # Configuration Supabase
├── 📁 docs/                  # Documentation
│   ├── 📄 API.md
│   ├── 📄 DEVELOPMENT.md
│   └── 📄 DEPLOYMENT.md
├── 📄 .env.example           # Variables d'environnement d'exemple
├── 📄 .gitignore             # Fichiers ignorés par Git
├── 📄 package.json           # Dépendances et scripts
├── 📄 tsconfig.json          # Configuration TypeScript
├── 📄 vite.config.ts         # Configuration Vite
├── 📄 tailwind.config.ts     # Configuration Tailwind
├── 📄 vitest.config.ts       # Configuration Vitest
└── 📄 README.md              # Documentation principale
```

## 🎯 Scripts Disponibles

### Scripts de Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Démarrer avec un port spécifique
npm run dev -- --port 3000

# Démarrer avec un host spécifique
npm run dev -- --host 0.0.0.0

# Mode debug
DEBUG=* npm run dev
```

### Scripts de Build

```bash
# Build de production
npm run build

# Build avec analyse du bundle
npm run build -- --analyze

# Preview du build local
npm run preview

# Build pour différents environnements
npm run build:staging
npm run build:production
```

### Scripts de Tests

```bash
# Tests en mode watch
npm run test

# Tests une seule fois
npm run test:run

# Tests avec couverture
npm run test:coverage

# Tests spécifiques
npm run test -- Button.test.tsx

# Tests E2E (à venir)
npm run test:e2e
```

### Scripts de Qualité

```bash
# Linting
npm run lint

# Linting avec correction automatique
npm run lint:fix

# Formatage du code
npm run format

# Vérification des types
npm run type-check
```

### Scripts de Base de Données

```bash
# Reset de la base de données locale
npm run db:reset

# Génération des types TypeScript
npm run db:types

# Backup de la base de données
npm run db:backup
```

## 💻 Développement

### Workflow de Développement

1. **Créer une branche** pour votre fonctionnalité
2. **Développer** avec le serveur de dev
3. **Tester** vos changements
4. **Linter** et formater le code
5. **Commit** avec un message clair
6. **Push** et créer une PR

### Hot Reload et Développement

Le serveur de développement utilise Vite avec :
- **Hot Module Replacement** (HMR) instantané
- **Fast Refresh** pour React
- **TypeScript** en temps réel
- **CSS** avec Tailwind JIT

### Débogage

#### Debug avec VS Code

Créer `.vscode/launch.json` :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

#### Debug avec React DevTools

```bash
# Installer l'extension React DevTools
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

#### Logs de Débogage

```typescript
// Utiliser console.log avec des niveaux
console.log('🔍 Debug:', data);
console.warn('⚠️ Warning:', warning);
console.error('❌ Error:', error);

// Debug conditionnel
if (import.meta.env.DEV) {
  console.log('Debug info:', debugData);
}
```

### Gestion de l'État

#### Contextes React

```typescript
// Créer un contexte
const MyContext = createContext<MyContextType | undefined>(undefined);

// Provider avec gestion d'état
export const MyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  const value = useMemo(() => ({
    state,
    setState,
    // Autres fonctions
  }), [state]);
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};

// Hook personnalisé
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

#### TanStack Query

```typescript
// Configuration du client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Utilisation dans un composant
const { data, isLoading, error } = useQuery({
  queryKey: ['decisions', workspaceId],
  queryFn: () => fetchDecisions(workspaceId),
  enabled: !!workspaceId,
});
```

## 🧪 Tests

### Configuration des Tests

Les tests utilisent :
- **Vitest** comme runner de tests
- **React Testing Library** pour les tests de composants
- **MSW** pour mocker les API
- **JSDOM** comme environnement de test

### Écriture de Tests

#### Test de Composant

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i }))
      .toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Test de Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

#### Test d'Intégration

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { DecisionList } from './DecisionList';

describe('DecisionList Integration', () => {
  it('should load and display decisions', async () => {
    render(<DecisionList workspaceId="test-workspace" />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Decision')).toBeInTheDocument();
  });
});
```

### Mocks et Fixtures

#### Mock de Supabase

```typescript
// src/test/mocks/supabase.ts
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};
```

#### Fixtures de Test

```typescript
// src/test/fixtures/decisions.ts
export const mockDecision = {
  id: 'decision-1',
  title: 'Test Decision',
  description: 'Test description',
  workspace_id: 'workspace-1',
  status: 'draft',
  criteria: [
    { name: 'Performance', weight: 0.5 },
    { name: 'Cost', weight: 0.5 }
  ],
  options: [
    { name: 'Option A', description: 'First option' },
    { name: 'Option B', description: 'Second option' }
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};
```

## 🏗️ Build et Déploiement

### Build de Production

```bash
# Build standard
npm run build

# Build avec analyse
npm run build:analyze

# Vérifier le build
npm run preview
```

### Optimisations de Build

Le build utilise plusieurs optimisations :
- **Code splitting** automatique
- **Tree shaking** pour supprimer le code mort
- **Minification** des assets
- **Compression** gzip/brotli
- **Lazy loading** des composants

### Variables d'Environnement de Production

```env
# Production
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_ANALYTICS_ID=your-analytics-id

# Staging
VITE_APP_ENV=staging
VITE_DEBUG=true
```

## 🐛 Dépannage

### Problèmes Courants

#### Erreur de Connexion Supabase

```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Tester la connexion
npm run test:db-connection
```

#### Problèmes de Build

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Vérifier les types
npm run type-check

# Build en mode debug
npm run build -- --debug
```

#### Tests qui Échouent

```bash
# Nettoyer le cache de test
npm run test:run -- --reporter=verbose

# Tests en mode debug
DEBUG=* npm run test

# Vérifier les mocks
npm run test -- --run --reporter=verbose
```

#### Problèmes de Performance

```bash
# Analyser le bundle
npm run build:analyze

# Vérifier les dépendances
npm run audit

# Mettre à jour les dépendances
npm update
```

### Logs et Debug

#### Logs de Développement

```typescript
// Configuration des logs
const logger = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔍 ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    console.info(`ℹ️ ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error);
  }
};
```

#### Debug des Requêtes API

```typescript
// Intercepteur de requêtes
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);
```

## 🛠️ Outils de Développement

### Extensions VS Code

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest",
    "ms-vscode.vscode-vitest"
  ]
}
```

### Configuration VS Code

`.vscode/settings.json` :

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Scripts Utilitaires

```bash
# Nettoyer le projet
npm run clean

# Vérifier la santé du projet
npm run health-check

# Générer les types
npm run generate-types

# Linter avec correction
npm run lint:fix

# Formatage automatique
npm run format
```

### Outils de Performance

```bash
# Analyser le bundle
npm run build:analyze

# Profiler les performances
npm run dev -- --profile

# Vérifier les dépendances
npm run audit

# Mettre à jour les dépendances
npm run update-deps
```

---

Ce guide de développement est maintenu à jour avec les évolutions du projet. Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue sur GitHub.


