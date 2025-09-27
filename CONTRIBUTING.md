# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à **Rationable** ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Pull Requests](#pull-requests)
- [Questions et Support](#questions-et-support)

## 📜 Code de Conduite

Ce projet adhère au [Code de Conduite Contributor Covenant](https://www.contributor-covenant.org/). En participant, vous acceptez de respecter ce code.

### Nos Engagements

- **Respect** : Traiter tous les contributeurs avec respect
- **Inclusion** : Accueillir les personnes de tous horizons
- **Collaboration** : Travailler ensemble de manière constructive
- **Professionnalisme** : Maintenir un environnement professionnel

## 🚀 Comment Contribuer

### Types de Contributions

Nous accueillons plusieurs types de contributions :

- 🐛 **Rapports de bugs**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Amélioration de la documentation**
- 🧪 **Tests et qualité**
- 🎨 **Améliorations UI/UX**
- ⚡ **Optimisations de performance**

### Première Contribution

Si c'est votre première contribution, voici comment commencer :

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez** une branche pour votre contribution
4. **Développez** votre fonctionnalité
5. **Testez** vos changements
6. **Soumettez** une Pull Request

## 🛠️ Processus de Développement

### 1. Configuration de l'Environnement

```bash
# Fork et clone du repository
git clone https://github.com/votre-username/rationable.git
cd rationable

# Installation des dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditez .env avec vos clés API

# Démarrage du serveur de développement
npm run dev
```

### 2. Création d'une Branche

```bash
# Créer une nouvelle branche
git checkout -b feature/nom-de-votre-fonctionnalite

# Ou pour un bug fix
git checkout -b fix/description-du-bug
```

### 3. Convention de Nommage des Branches

- `feature/nom-fonctionnalite` - Nouvelles fonctionnalités
- `fix/description-bug` - Corrections de bugs
- `docs/description` - Améliorations documentation
- `refactor/description` - Refactoring
- `test/description` - Ajout de tests
- `chore/description` - Tâches de maintenance

### 4. Développement

- **Commits fréquents** avec des messages clairs
- **Tests** pour les nouvelles fonctionnalités
- **Documentation** mise à jour
- **Code review** de vos propres changements

## 📏 Standards de Code

### TypeScript

- **Strict mode** activé
- **Types explicites** pour les fonctions publiques
- **Interfaces** pour les objets complexes
- **JSDoc** pour la documentation

```typescript
/**
 * Calcule le score d'une décision basé sur les critères
 * @param criteria - Liste des critères de décision
 * @param weights - Poids associés à chaque critère
 * @returns Score total de la décision
 */
function calculateDecisionScore(
  criteria: Criterion[],
  weights: Record<string, number>
): number {
  // Implementation...
}
```

### React

- **Fonctional Components** avec hooks
- **Props** typées avec TypeScript
- **Custom hooks** pour la logique réutilisable
- **Memoization** quand approprié

```typescript
interface ButtonProps {
  /** Texte du bouton */
  children: React.ReactNode;
  /** Variante visuelle */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Taille du bouton */
  size?: 'sm' | 'md' | 'lg';
  /** Fonction appelée au clic */
  onClick?: () => void;
  /** État désactivé */
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false
}) => {
  // Implementation...
};
```

### CSS/Styling

- **Tailwind CSS** pour le styling
- **Classes utilitaires** préférées
- **Composants** shadcn/ui
- **Variables CSS** pour les thèmes

```typescript
// ✅ Bon
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">

// ❌ Éviter
<div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
```

### Structure des Fichiers

```
src/
├── components/
│   ├── ui/                 # Composants de base
│   ├── feature-name/       # Composants par fonctionnalité
│   └── __tests__/          # Tests des composants
├── hooks/
│   ├── useFeatureName.ts   # Hooks personnalisés
│   └── __tests__/          # Tests des hooks
├── services/
│   └── apiService.ts       # Services API
├── types/
│   └── feature.ts          # Types TypeScript
└── utils/
    └── helpers.ts          # Fonctions utilitaires
```

## 🧪 Tests

### Types de Tests

- **Tests unitaires** - Composants et fonctions isolés
- **Tests d'intégration** - Interactions entre composants
- **Tests E2E** - Flux utilisateur complets (à venir)

### Exécution des Tests

```bash
# Tests en mode watch
npm run test

# Tests une seule fois
npm run test:run

# Tests avec couverture
npm run test:coverage

# Tests spécifiques
npm run test -- Button.test.tsx
```

### Écriture de Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i }))
      .toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Couverture de Code

- **Minimum 80%** de couverture pour les nouvelles fonctionnalités
- **Tests critiques** pour la logique métier
- **Mocks** appropriés pour les dépendances externes

## 📚 Documentation

### JSDoc

Documentez toutes les fonctions publiques :

```typescript
/**
 * Crée une nouvelle décision dans l'espace de travail
 * @param title - Titre de la décision
 * @param description - Description détaillée
 * @param workspaceId - ID de l'espace de travail
 * @param criteria - Liste des critères de décision
 * @returns Promise résolue avec la décision créée
 * @throws {Error} Si l'espace de travail n'existe pas
 * @example
 * ```typescript
 * const decision = await createDecision(
 *   'Choisir un framework',
 *   'Décision pour le nouveau projet',
 *   'workspace-123',
 *   [{ name: 'Performance', weight: 0.4 }]
 * );
 * ```
 */
async function createDecision(
  title: string,
  description: string,
  workspaceId: string,
  criteria: Criterion[]
): Promise<Decision> {
  // Implementation...
}
```

### README

- **Mise à jour** pour les nouvelles fonctionnalités
- **Exemples** d'utilisation
- **Configuration** détaillée
- **Dépannage** des problèmes courants

### Commentaires de Code

```typescript
// ✅ Bon - Explique le "pourquoi"
// Utiliser un timeout pour éviter les appels API trop fréquents
// lors de la saisie utilisateur
const debouncedSearch = useDebounce(searchTerm, 300);

// ❌ Éviter - Explique le "quoi" évident
// Incrémenter le compteur
counter++;
```

## 🔄 Pull Requests

### Avant de Soumettre

- [ ] **Tests** passent (`npm run test:run`)
- [ ] **Linting** sans erreurs (`npm run lint`)
- [ ] **Build** réussi (`npm run build`)
- [ ] **Documentation** mise à jour
- [ ] **Commits** avec messages clairs

### Template de Pull Request

```markdown
## 📝 Description

Brève description des changements apportés.

## 🔗 Issue Liée

Fixes #123

## 🧪 Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration si applicable
- [ ] Tests manuels effectués

## 📸 Captures d'Écran

Si applicable, ajoutez des captures d'écran des changements UI.

## ✅ Checklist

- [ ] Code respecte les standards du projet
- [ ] Documentation mise à jour
- [ ] Tests ajoutés/mis à jour
- [ ] Pas de breaking changes
- [ ] Performance testée

## 📋 Notes Supplémentaires

Toute information supplémentaire pour les reviewers.
```

### Processus de Review

1. **Auto-review** - Vérifiez vos propres changements
2. **Tests** - Assurez-vous que tous les tests passent
3. **Documentation** - Mettez à jour la documentation
4. **Soumission** - Créez la Pull Request
5. **Review** - Attendez les commentaires des maintainers
6. **Modifications** - Apportez les changements demandés
7. **Merge** - Une fois approuvée, la PR sera mergée

## 🐛 Rapporter un Bug

### Template de Bug Report

```markdown
## 🐛 Description du Bug

Description claire et concise du problème.

## 🔄 Étapes pour Reproduire

1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler vers '...'
4. Voir l'erreur

## ✅ Comportement Attendu

Description de ce qui devrait se passer.

## ❌ Comportement Actuel

Description de ce qui se passe réellement.

## 📸 Captures d'Écran

Si applicable, ajoutez des captures d'écran.

## 🖥️ Environnement

- OS: [ex: Windows 10, macOS 12.0, Ubuntu 20.04]
- Navigateur: [ex: Chrome 91, Firefox 89, Safari 14]
- Version: [ex: 1.2.3]

## 📋 Informations Supplémentaires

Toute autre information pertinente.
```

## ✨ Proposer une Fonctionnalité

### Template de Feature Request

```markdown
## 🚀 Fonctionnalité Proposée

Description claire et concise de la fonctionnalité souhaitée.

## 💡 Motivation

Pourquoi cette fonctionnalité serait-elle utile ?

## 📋 Description Détaillée

Description détaillée de la fonctionnalité et de son comportement.

## 🎯 Cas d'Usage

Exemples concrets d'utilisation de cette fonctionnalité.

## 🔄 Alternatives Considérées

Autres solutions ou fonctionnalités que vous avez considérées.

## 📋 Informations Supplémentaires

Toute autre information pertinente.
```

## 🏷️ Labels et Milestones

### Labels Utilisés

- `bug` - Quelque chose ne fonctionne pas
- `enhancement` - Nouvelle fonctionnalité ou amélioration
- `documentation` - Améliorations de documentation
- `good first issue` - Bon pour les nouveaux contributeurs
- `help wanted` - Besoin d'aide de la communauté
- `priority: high` - Priorité élevée
- `priority: medium` - Priorité moyenne
- `priority: low` - Priorité faible
- `status: in progress` - En cours de développement
- `status: needs review` - Besoin de review
- `type: frontend` - Changements frontend
- `type: backend` - Changements backend
- `type: testing` - Changements liés aux tests

## 📞 Questions et Support

### Où Obtenir de l'Aide

- **GitHub Issues** - Pour les bugs et feature requests
- **GitHub Discussions** - Pour les questions générales
- **Discord** - Pour le chat en temps réel (à venir)
- **Email** - support@rationable.ai

### Ressources Utiles

- [Documentation React](https://react.dev/)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation shadcn/ui](https://ui.shadcn.com/)

## 🎉 Reconnaissance

Tous les contributeurs sont reconnus dans :

- **README.md** - Section contributeurs
- **CHANGELOG.md** - Historique des contributions
- **Releases** - Notes de version

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet (MIT).

---

**Merci de contribuer à Rationable ! 🚀**

Vos contributions aident à faire de Rationable une meilleure plateforme de prise de décision pour tous.


