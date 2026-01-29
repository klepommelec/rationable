# Storybook Configuration

Ce projet utilise Storybook pour visualiser et tester tous les composants de l'application.

## Démarrage

```bash
# Lancer Storybook en mode développement
npm run storybook

# Build Storybook pour la production
npm run build-storybook
```

Storybook sera accessible sur `http://localhost:6006`

## Structure

- Les stories sont dans `src/**/*.stories.tsx`
- La configuration est dans `.storybook/`
- Les composants UI sont dans `src/components/ui/`

## Ajouter une nouvelle story

Créez un fichier `ComponentName.stories.tsx` à côté de votre composant :

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'UI/YourComponent',
  component: YourComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // props par défaut
  },
};
```

## Providers configurés

Les providers suivants sont automatiquement inclus dans toutes les stories :
- `ThemeProvider` (next-themes)
- `QueryClientProvider` (TanStack Query)
- `I18nUIProvider` (Internationalisation)
- `TooltipProvider` (Radix UI)

## Fonctionnalités

- **Autodocs** : Documentation automatique générée
- **Controls** : Modifier les props en temps réel
- **Accessibility** : Tests d'accessibilité intégrés
- **Viewport** : Tester différentes tailles d'écran
- **Actions** : Logger les événements
