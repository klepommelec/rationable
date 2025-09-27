# 🧠 Rationable

> **Plateforme intelligente de prise de décision collaborative**

Rationable est une application web moderne qui aide les utilisateurs et les équipes à prendre des décisions éclairées grâce à l'intelligence artificielle, l'analyse de données et la collaboration en temps réel.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-rationable.ai-blue?style=for-the-badge&logo=vercel)](https://www.rationable.ai/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/klepommelec/rationable)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## ✨ Fonctionnalités

### 🎯 **Prise de Décision Intelligente**
- **Analyse multi-critères** avec pondération personnalisée
- **Recommandations IA** basées sur Claude, OpenAI et Perplexity
- **Visualisations interactives** (graphiques, tableaux, radar charts)
- **Templates prédéfinis** pour différents types de décisions

### 👥 **Collaboration d'Équipe**
- **Espaces de travail partagés** avec gestion des permissions
- **Commentaires en temps réel** et historique des discussions
- **Invitations collaboratives** par email
- **Suivi des contributions** et métriques d'engagement

### 🔍 **Recherche et Analyse**
- **Recherche web intégrée** pour enrichir les décisions
- **Vérification de liens** et validation des sources
- **Extraction de contenu** depuis documents et URLs
- **Cache intelligent** pour optimiser les performances

### 🌍 **Internationalisation**
- **Support multilingue** (FR, EN, ES, DE, IT, PT)
- **Détection automatique** de la langue
- **Interface adaptative** selon les préférences culturelles

### 📊 **Analytics et Insights**
- **Métriques de performance** en temps réel
- **Historique des décisions** avec recherche avancée
- **Export PDF** et partage public
- **Tableau de bord** personnalisable

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** 18+ ([installer avec nvm](https://github.com/nvm-sh/nvm))
- **npm** ou **bun** (gestionnaire de packages)
- **Git** pour le versioning

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/klepommelec/rationable.git
cd rationable

# 2. Installer les dépendances
npm install
# ou
bun install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# 4. Démarrer le serveur de développement
npm run dev
# ou
bun dev
```

L'application sera accessible sur `http://localhost:8080` (ou le port suivant disponible).

### Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# API Keys (optionnelles)
VITE_OPENAI_API_KEY=your_openai_key
VITE_PERPLEXITY_API_KEY=your_perplexity_key
VITE_CLAUDE_API_KEY=your_claude_key
```

## 🏗️ Architecture Technique

### Stack Technologique

- **Frontend** : React 18 + TypeScript + Vite
- **UI/UX** : Tailwind CSS + shadcn/ui + Radix UI
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **IA** : OpenAI, Claude, Perplexity
- **Tests** : Vitest + React Testing Library + MSW
- **Déploiement** : Lovable + Vercel

### Structure du Projet

```
rationable/
├── 📁 src/
│   ├── 📁 components/          # Composants React réutilisables
│   │   ├── 📁 ui/             # Composants UI de base (shadcn)
│   │   ├── 📁 decision-maker/ # Composants de prise de décision
│   │   ├── 📁 workspace/      # Gestion des espaces de travail
│   │   └── 📁 settings/       # Configuration et paramètres
│   ├── 📁 hooks/              # Hooks personnalisés React
│   ├── 📁 services/           # Services API et logique métier
│   ├── 📁 contexts/           # Contextes React (état global)
│   ├── 📁 types/              # Types TypeScript
│   ├── 📁 utils/              # Fonctions utilitaires
│   ├── 📁 pages/              # Pages de l'application
│   └── 📁 test/               # Configuration et utilitaires de test
├── 📁 supabase/               # Configuration et fonctions Supabase
├── 📁 public/                 # Assets statiques
└── 📄 Configuration files     # Vite, TypeScript, Tailwind, etc.
```

### Fonctionnalités Clés

#### 🧠 **Moteur de Décision**
- **Analyse multi-critères** avec pondération
- **Scoring intelligent** basé sur l'IA
- **Visualisations interactives** (Recharts)
- **Export et partage** des résultats

#### 🔄 **Gestion d'État**
- **React Context** pour l'état global
- **TanStack Query** pour la gestion des données serveur
- **Optimistic updates** pour une UX fluide
- **Cache intelligent** avec invalidation

#### 🎨 **Interface Utilisateur**
- **Design System** cohérent avec shadcn/ui
- **Mode sombre/clair** avec next-themes
- **Responsive design** mobile-first
- **Animations fluides** avec Framer Motion

## 🧪 Tests et Qualité

### Exécution des Tests

```bash
# Tests en mode watch (développement)
npm run test

# Tests une seule fois
npm run test:run

# Tests avec couverture de code
npm run test:coverage

# Interface graphique des tests
npm run test:ui
```

### Qualité du Code

```bash
# Linting
npm run lint

# Build de production
npm run build

# Preview du build
npm run preview
```

### Couverture de Code

Le projet maintient une couverture de code élevée avec :
- **Tests unitaires** pour les composants
- **Tests d'intégration** pour les services
- **Mocks** pour les API externes
- **Tests E2E** (à venir)

## 🚀 Déploiement

### Déploiement via Lovable

1. Ouvrez [Lovable](https://lovable.dev/projects/d3dc0946-d463-4413-864e-4c2d74415b5e)
2. Cliquez sur **Share → Publish**
3. Configurez votre domaine personnalisé si nécessaire

### Déploiement Manuel

```bash
# Build de production
npm run build

# Déployer sur Vercel
npx vercel --prod

# Ou sur Netlify
npx netlify deploy --prod --dir=dist
```

### Configuration du Domaine

Pour connecter un domaine personnalisé :
1. Allez dans **Project → Settings → Domains**
2. Cliquez sur **Connect Domain**
3. Suivez les instructions de configuration DNS

## 🤝 Contribution

Nous accueillons les contributions ! Voici comment contribuer :

### 1. Fork et Clone

```bash
git clone https://github.com/votre-username/rationable.git
cd rationable
```

### 2. Créer une Branche

```bash
git checkout -b feature/nouvelle-fonctionnalite
```

### 3. Développer

- Suivez les conventions de code existantes
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez les changements importants

### 4. Tests

```bash
npm run test:run
npm run lint
```

### 5. Pull Request

- Créez une PR détaillée
- Incluez des captures d'écran si applicable
- Référencez les issues liées

### Standards de Code

- **TypeScript** strict mode
- **ESLint** + **Prettier** pour le formatage
- **Conventional Commits** pour les messages
- **Tests** obligatoires pour les nouvelles fonctionnalités

## 📚 Documentation API

### Endpoints Supabase

#### Authentification
```typescript
// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

#### Gestion des Décisions
```typescript
// Créer une décision
const { data, error } = await supabase
  .from('decisions')
  .insert({
    title: 'Nouvelle décision',
    description: 'Description...',
    workspace_id: 'workspace-id'
  })

// Récupérer les décisions
const { data, error } = await supabase
  .from('decisions')
  .select('*')
  .eq('workspace_id', workspaceId)
```

#### Espaces de Travail
```typescript
// Créer un espace de travail
const { data, error } = await supabase
  .from('workspaces')
  .insert({
    name: 'Mon Espace',
    description: 'Description...'
  })
```

### Hooks Personnalisés

#### useAuth
```typescript
const { user, loading, signIn, signOut } = useAuth()
```

#### useWorkspaces
```typescript
const { 
  workspaces, 
  currentWorkspace, 
  createWorkspace,
  updateWorkspace 
} = useWorkspaces()
```

#### useDecisionMaker
```typescript
const {
  decision,
  criteria,
  options,
  analysis,
  createDecision,
  updateCriteria
} = useDecisionMaker()
```

## 🔧 Configuration Avancée

### Variables d'Environnement Complètes

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# APIs IA
VITE_OPENAI_API_KEY=sk-...
VITE_PERPLEXITY_API_KEY=pplx-...
VITE_CLAUDE_API_KEY=sk-ant-...

# Analytics (optionnel)
VITE_ANALYTICS_ID=your-analytics-id

# Features Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
```

### Configuration Vite

Le projet utilise Vite avec des optimisations avancées :

- **Code splitting** automatique
- **Lazy loading** des composants
- **Tree shaking** pour réduire la taille du bundle
- **Hot Module Replacement** pour le développement

### Configuration Tailwind

Tailwind CSS est configuré avec :
- **Design tokens** personnalisés
- **Composants** shadcn/ui
- **Mode sombre** natif
- **Responsive design** mobile-first

## 🐛 Dépannage

### Problèmes Courants

#### Erreur de Connexion Supabase
```bash
# Vérifiez vos variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Problèmes de Build
```bash
# Nettoyage et réinstallation
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Tests qui Échouent
```bash
# Nettoyage du cache de test
npm run test:run -- --reporter=verbose
```

### Logs et Debug

```bash
# Mode debug
DEBUG=* npm run dev

# Logs détaillés
npm run dev -- --log-level=debug
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Lovable** pour la plateforme de développement
- **Supabase** pour le backend
- **shadcn/ui** pour les composants
- **Vercel** pour l'hébergement
- **Communauté open source** pour les contributions

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/klepommelec/rationable/issues)
- **Discussions** : [GitHub Discussions](https://github.com/klepommelec/rationable/discussions)
- **Email** : support@rationable.ai

---

<div align="center">

**Fait avec ❤️ par l'équipe Rationable**

[🌐 Site Web](https://www.rationable.ai/) • [📖 Documentation](https://docs.rationable.ai/) • [🐦 Twitter](https://twitter.com/rationable_ai)

</div>