#!/usr/bin/env node

/**
 * Script pour mettre à jour COMPONENTS_INDEX.md avec les résultats de l'analyse
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const ANALYSIS_FILE = path.join(ROOT_DIR, '.storybook', 'components-analysis.json');
const INDEX_FILE = path.join(ROOT_DIR, '.storybook', 'COMPONENTS_INDEX.md');

// Lire l'analyse
const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf-8'));

// Créer une map pour accès rapide
const componentMap = new Map();
analysis.components.forEach(comp => {
  componentMap.set(comp.name.toLowerCase(), comp);
  // Aussi par nom exact
  componentMap.set(comp.name, comp);
});

// Lire l'index actuel
let indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');

// Fonction pour obtenir les données d'un composant
function getComponentData(name) {
  const comp = componentMap.get(name) || componentMap.get(name.toLowerCase());
  if (!comp) return null;
  
  return {
    usageCount: comp.usageCount,
    hasStory: comp.hasStory,
    isUsed: comp.usageCount > 0,
  };
}

// Mettre à jour les lignes de tableau dans chaque section
const sections = [
  { pattern: /\| (accordion|alert-dialog|alert|aspect-ratio|avatar|badge|breadcrumb|button|calendar|card|carousel|chart|checkbox|collapsible|command|context-menu|dialog|drawer|dropdown-menu|form|hover-card|input-otp|input|label|menubar|navigation-menu|pagination|popover|progress|radio-group|resizable|scroll-area|select|separator|sheet|sidebar|skeleton|slider|sonner|switch|table|tabs|textarea|toast|toaster|toggle-group|toggle|tooltip|use-toast) \|/g, category: 'UI' },
];

// Pour chaque composant dans l'analyse, mettre à jour sa ligne
analysis.components.forEach(comp => {
  const name = comp.name;
  const usage = comp.usageCount;
  const hasStory = comp.hasStory;
  const status = hasStory ? '✅' : '⏳';
  const usageText = usage > 0 ? `${usage} usages` : 'Non utilisé';
  
  // Pattern pour trouver la ligne du composant dans l'index
  const namePattern = new RegExp(`\\|\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\|`, 'i');
  
  // Remplacer la ligne si elle existe
  indexContent = indexContent.replace(
    namePattern,
    (match) => {
      // Extraire les parties de la ligne
      const parts = match.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        // Mettre à jour les colonnes
        parts[1] = status; // Storybook
        parts[2] = usageText; // Usage
        return '| ' + parts.join(' | ') + ' |';
      }
      return match;
    }
  );
});

// Mettre à jour le résumé global
const summaryPattern = /\*\*Total.*?\*\*: \d+ composants \| \*\*Stories créées\*\*: \d+ \| \*\*Stories à créer\*\*: \d+/g;
const uiTotal = analysis.components.filter(c => c.category === 'UI').length;
const uiStories = analysis.components.filter(c => c.category === 'UI' && c.hasStory).length;
const uiToCreate = uiTotal - uiStories;

indexContent = indexContent.replace(
  /\*\*Total UI\*\*: \d+ composants \| \*\*Stories créées\*\*: \d+ \| \*\*Stories à créer\*\*: \d+/,
  `**Total UI :** ${uiTotal} composants | **Stories créées :** ${uiStories} | **Stories à créer :** ${uiToCreate}`
);

// Mettre à jour la date
const datePattern = /\*Dernière mise à jour :.*?\*/;
const newDate = `*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')} - Analyse automatique*`;
indexContent = indexContent.replace(datePattern, newDate);

// Sauvegarder
fs.writeFileSync(INDEX_FILE, indexContent);
console.log('✅ Index mis à jour avec les résultats de l\'analyse');
