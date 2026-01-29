#!/usr/bin/env node

/**
 * Script d'analyse des composants Rationable
 * 
 * Analyse tous les composants dans src/components/ et identifie :
 * - Les exports de composants
 * - Les imports/usage de chaque composant
 * - Les composants non utilisés
 * - Les composants avec stories Storybook
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src', 'components');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Résultats de l'analyse
const components = new Map(); // Map<componentName, { path, category, exports, usages, hasStory }>
const imports = new Map(); // Map<importPath, Set<files>>

/**
 * Extrait le nom du composant depuis un chemin de fichier
 */
function getComponentName(filePath, category = '') {
  const basename = path.basename(filePath, path.extname(filePath));
  // Enlever .stories si présent
  return basename.replace(/\.stories$/, '');
}

/**
 * Détermine la catégorie d'un composant depuis son chemin
 */
function getCategory(filePath) {
  const relativePath = path.relative(COMPONENTS_DIR, filePath);
  const parts = relativePath.split(path.sep);
  
  if (parts[0] === 'ui') return 'UI';
  if (parts[0] === 'decision-maker') return 'DecisionMaker';
  if (parts[0] === 'comments') return 'Comments';
  if (parts[0] === 'settings') return 'Settings';
  if (parts[0] === 'workspace') return 'Workspace';
  if (parts[0] === 'templates') return 'Templates';
  if (parts[0] === 'history') return 'History';
  if (parts[0] === 'core') return 'Core';
  if (parts[0] === 'animations') return 'Core';
  return 'Core';
}

/**
 * Scanne un fichier pour extraire les exports
 */
function extractExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const exports = [];
  
  // Exports nommés: export const Component, export function Component, export class Component
  const namedExports = content.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g);
  for (const match of namedExports) {
    exports.push(match[1]);
  }
  
  // Export default
  if (content.match(/export\s+default/)) {
    const componentName = getComponentName(filePath);
    exports.push(componentName);
  }
  
  return exports;
}

/**
 * Scanne un fichier pour extraire les imports de composants
 */
function extractImportsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const foundImports = [];
  
  // Imports depuis @/components ou ./components ou ../components
  const importPatterns = [
    /from\s+['"]@\/components\/([^'"]+)['"]/g,
    /from\s+['"]\.\.?\/.*components\/([^'"]+)['"]/g,
    /from\s+['"]\.\/([^'"]+)['"]/g,
  ];
  
  for (const pattern of importPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      let importPath = match[1];
      // Enlever l'extension
      importPath = importPath.replace(/\.(tsx?|jsx?)$/, '');
      foundImports.push(importPath);
    }
  }
  
  return foundImports;
}

/**
 * Vérifie si un composant a une story Storybook
 */
function hasStorybookStory(componentPath) {
  const dir = path.dirname(componentPath);
  const basename = path.basename(componentPath, path.extname(componentPath));
  const storyPath = path.join(dir, `${basename}.stories.tsx`);
  const storyPath2 = path.join(dir, `${basename}.stories.ts`);
  return fs.existsSync(storyPath) || fs.existsSync(storyPath2);
}

/**
 * Scanne récursivement un répertoire pour trouver tous les composants
 */
function scanComponents(dir, category = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Ignorer node_modules, __tests__, etc.
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__tests__') {
        scanComponents(fullPath, category || getCategory(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      // Ignorer les fichiers .stories, .test, .spec
      if (!entry.name.match(/\.(stories|test|spec)\.(tsx?|jsx?)$/)) {
        const componentName = getComponentName(fullPath);
        const componentCategory = category || getCategory(fullPath);
        
        if (!components.has(componentName)) {
          components.set(componentName, {
            name: componentName,
            path: fullPath,
            category: componentCategory,
            exports: extractExports(fullPath),
            usages: [],
            usageCount: 0,
            hasStory: hasStorybookStory(fullPath),
          });
        }
      }
    }
  }
}

/**
 * Scanne tous les fichiers source pour trouver les imports
 */
function scanImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Ignorer node_modules, .git, etc.
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanImports(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      // Ignorer les fichiers .stories, .test, .spec
      if (!entry.name.match(/\.(stories|test|spec)\.(tsx?|jsx?)$/)) {
        const foundImports = extractImportsFromFile(fullPath);
        for (const importPath of foundImports) {
          if (!imports.has(importPath)) {
            imports.set(importPath, new Set());
          }
          imports.get(importPath).add(fullPath);
        }
      }
    }
  }
}

/**
 * Corrèle les imports avec les composants
 */
function correlateImports() {
  for (const [componentName, component] of components) {
    // Chercher les imports qui correspondent à ce composant
    for (const [importPath, files] of imports) {
      // Extraire le nom du composant depuis le chemin d'import
      const importParts = importPath.split('/');
      const importedName = importParts[importParts.length - 1];
      
      // Vérifier si l'import correspond au composant
      if (importedName === componentName || 
          importPath.includes(componentName.toLowerCase()) ||
          importPath.endsWith(`/${componentName}`) ||
          importPath.endsWith(`/${componentName.toLowerCase()}`)) {
        component.usages.push(...Array.from(files));
        component.usageCount = component.usages.length;
      }
    }
    
    // Vérifier aussi les imports directs par nom
    const relativePath = path.relative(COMPONENTS_DIR, component.path);
    const importPath = relativePath.replace(/\\/g, '/').replace(/\.(tsx?|jsx?)$/, '');
    
    if (imports.has(importPath)) {
      const files = imports.get(importPath);
      component.usages.push(...Array.from(files));
      component.usageCount = new Set(component.usages).size; // Dédupliquer
    }
  }
}

/**
 * Génère le rapport JSON
 */
function generateReport() {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: components.size,
      withStories: Array.from(components.values()).filter(c => c.hasStory).length,
      withoutStories: Array.from(components.values()).filter(c => !c.hasStory).length,
      used: Array.from(components.values()).filter(c => c.usageCount > 0).length,
      unused: Array.from(components.values()).filter(c => c.usageCount === 0).length,
    },
    components: Array.from(components.values()).map(c => ({
      name: c.name,
      path: path.relative(ROOT_DIR, c.path),
      category: c.category,
      exports: c.exports,
      usageCount: c.usageCount,
      hasStory: c.hasStory,
      usages: c.usages.map(u => path.relative(ROOT_DIR, u)),
    })),
  };
  
  return report;
}

/**
 * Affiche un résumé dans la console
 */
function printSummary(report) {
  console.log('\n📊 Analyse des Composants Rationable\n');
  console.log('=' .repeat(50));
  console.log(`Total de composants: ${report.summary.total}`);
  console.log(`  ✅ Avec stories: ${report.summary.withStories}`);
  console.log(`  ⏳ Sans stories: ${report.summary.withoutStories}`);
  console.log(`  📦 Utilisés: ${report.summary.used}`);
  console.log(`  🗑️  Non utilisés: ${report.summary.unused}`);
  console.log('=' .repeat(50));
  
  // Composants non utilisés
  const unused = report.components.filter(c => c.usageCount === 0);
  if (unused.length > 0) {
    console.log('\n🗑️  Composants non utilisés:');
    unused.forEach(c => {
      console.log(`  - ${c.name} (${c.category})`);
    });
  }
  
  // Composants les plus utilisés
  const mostUsed = report.components
    .filter(c => c.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
  
  if (mostUsed.length > 0) {
    console.log('\n🔥 Composants les plus utilisés:');
    mostUsed.forEach(c => {
      console.log(`  - ${c.name} (${c.category}): ${c.usageCount} usages`);
    });
  }
  
  // Par catégorie
  const byCategory = {};
  report.components.forEach(c => {
    if (!byCategory[c.category]) {
      byCategory[c.category] = { total: 0, withStories: 0, used: 0 };
    }
    byCategory[c.category].total++;
    if (c.hasStory) byCategory[c.category].withStories++;
    if (c.usageCount > 0) byCategory[c.category].used++;
  });
  
  console.log('\n📁 Par catégorie:');
  Object.entries(byCategory)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([cat, stats]) => {
      console.log(`  ${cat}: ${stats.total} total, ${stats.withStories} stories, ${stats.used} utilisés`);
    });
}

// Exécution principale
console.log('🔍 Scan des composants...');
scanComponents(COMPONENTS_DIR);

console.log('🔍 Scan des imports...');
scanImports(SRC_DIR);

console.log('🔗 Corrélation des imports...');
correlateImports();

console.log('📝 Génération du rapport...');
const report = generateReport();

// Sauvegarder le rapport JSON
const reportPath = path.join(ROOT_DIR, '.storybook', 'components-analysis.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);

// Afficher le résumé
printSummary(report);

console.log('\n✅ Analyse terminée!\n');
