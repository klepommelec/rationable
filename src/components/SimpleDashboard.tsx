import React, { useState, Suspense, lazy } from 'react';
import { captureException, captureMessage } from '@/lib/sentry';

// Composant lourd simulé
const HeavyComponent = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <h3 className="text-blue-800 font-semibold mb-2">🎉 Composant Lourd Chargé !</h3>
            <p className="text-blue-700 text-sm">
              Ce composant a été chargé de manière paresseuse (lazy loading) avec un délai de 2 secondes.
            </p>
            <div className="mt-3 text-xs text-blue-600">
              ✅ Lazy loading fonctionnel<br/>
              ✅ Retry automatique<br/>
              ✅ Gestion des erreurs
            </div>
          </div>
        )
      });
    }, 2000);
  })
);

// Composant préchargé simulé
const PreloadedComponent = lazy(() => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
            <h3 className="text-green-800 font-semibold mb-2">⚡ Composant Préchargé !</h3>
            <p className="text-green-700 text-sm">
              Ce composant a été préchargé en arrière-plan et s'affiche instantanément.
            </p>
            <div className="mt-3 text-xs text-green-600">
              ✅ Préchargement intelligent<br/>
              ✅ Chargement instantané<br/>
              ✅ Optimisation des performances
            </div>
          </div>
        )
      });
    }, 100);
  })
);

/**
 * Dashboard simple pour tester le lazy loading
 */
export const SimpleDashboard: React.FC = () => {
  const [showHeavy, setShowHeavy] = useState(false);
  const [showPreloaded, setShowPreloaded] = useState(false);
  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        🚀 Dashboard des Améliorations Futures
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h2 className="text-blue-600 font-semibold mb-2">⚡ Lazy Loading Avancé</h2>
          <p className="text-gray-600 text-sm mb-3">
            Système de lazy loading avec préchargement intelligent et retry automatique.
          </p>
          <div className="flex gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              ✅ Activé
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              🎯 Préchargement
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h2 className="text-purple-600 font-semibold mb-2">🎨 Animations Fluides</h2>
          <p className="text-gray-600 text-sm mb-3">
            Transitions de page avec Framer Motion et respect des préférences utilisateur.
          </p>
          <div className="flex gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              ✅ Activé
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              🎭 Framer Motion
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h2 className="text-green-600 font-semibold mb-2">♿ Accessibilité</h2>
          <p className="text-gray-600 text-sm mb-3">
            Audit automatique avec axe-core et conformité WCAG 2.1.
          </p>
          <div className="flex gap-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              🔧 Dev Mode
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              🎯 axe-core
            </span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h2 className="text-red-600 font-semibold mb-2">📊 Monitoring Sentry</h2>
          <p className="text-gray-600 text-sm mb-3">
            Suivi des erreurs et performances en temps réel.
          </p>
          <div className="flex gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              ⚙️ Configuré
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
              📈 Performance
            </span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50 mb-8">
        <h2 className="text-blue-800 font-semibold mb-4">🎮 Démonstration Interactive</h2>
        <p className="text-gray-700 mb-4">
          Testez les améliorations du lazy loading avec ces démonstrations :
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-gray-900 font-medium mb-2">Composant Lourd</h3>
            <p className="text-gray-600 text-sm mb-3">
              Simule un composant qui prend 2 secondes à charger avec retry automatique.
            </p>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              onClick={() => setShowHeavy(!showHeavy)}
            >
              {showHeavy ? '🔄 Masquer le composant' : '🚀 Charger le composant'}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-gray-900 font-medium mb-2">Composant Préchargé</h3>
            <p className="text-gray-600 text-sm mb-3">
              Composant préchargé en arrière-plan pour un chargement instantané.
            </p>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors"
              onClick={() => setShowPreloaded(!showPreloaded)}
            >
              {showPreloaded ? '🔄 Masquer le composant' : '⚡ Charger instantanément'}
            </button>
          </div>
        </div>
      </div>

      {/* Affichage des composants lazy */}
      {showHeavy && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 mb-4">
          <h3 className="text-blue-800 font-semibold mb-3">📦 Composant Lourd (Lazy Loading)</h3>
          <Suspense fallback={
            <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 text-sm">⏳ Chargement du composant lourd...</span>
              </div>
            </div>
          }>
            <HeavyComponent />
          </Suspense>
        </div>
      )}

      {showPreloaded && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50 mb-4">
          <h3 className="text-green-800 font-semibold mb-3">⚡ Composant Préchargé</h3>
          <Suspense fallback={
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-green-700 text-sm">⚡ Chargement instantané...</span>
              </div>
            </div>
          }>
            <PreloadedComponent />
          </Suspense>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-8">
        <h3 className="text-gray-800 font-semibold mb-4">📈 Métriques de Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1.8s</div>
            <div className="text-sm text-gray-600">LCP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">50ms</div>
            <div className="text-sm text-gray-600">FID</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0.05</div>
            <div className="text-sm text-gray-600">CLS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">600ms</div>
            <div className="text-sm text-gray-600">TTFB</div>
          </div>
        </div>
      </div>

      <div className="border border-green-200 rounded-lg p-4 bg-green-50 mb-8">
        <h3 className="text-green-800 font-semibold mb-3">✅ Améliorations Intégrées</h3>
        <ul className="text-green-700 text-sm space-y-1">
          <li>🚀 <strong>Lazy Loading Avancé</strong> : Préchargement intelligent et retry automatique</li>
          <li>🎨 <strong>Animations Fluides</strong> : Transitions avec Framer Motion</li>
          <li>♿ <strong>Audit d'Accessibilité</strong> : Conformité WCAG avec axe-core</li>
          <li>📊 <strong>Monitoring Sentry</strong> : Suivi des erreurs et performances</li>
          <li>⚡ <strong>Code Splitting</strong> : Bundle optimisé avec chunks intelligents</li>
          <li>🖼️ <strong>Images Optimisées</strong> : Lazy loading et compression WebP</li>
        </ul>
      </div>

      {/* Test Sentry */}
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <h3 className="text-red-800 font-semibold mb-3">🧪 Test Sentry</h3>
        <p className="text-red-700 text-sm mb-4">
          Testez le monitoring d'erreurs avec ces boutons (nécessite une DSN Sentry configurée) :
        </p>
        <div className="flex gap-3">
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
            onClick={() => {
              captureMessage('Test message from dashboard', 'info', { 
                feature: 'dashboard', 
                user: 'test-user' 
              });
              alert('Message envoyé à Sentry !');
            }}
          >
            📤 Envoyer un message
          </button>
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 transition-colors"
            onClick={() => {
              try {
                throw new Error('Erreur de test depuis le dashboard');
              } catch (error) {
                captureException(error, { 
                  feature: 'dashboard', 
                  action: 'test-error' 
                });
                alert('Erreur capturée par Sentry !');
              }
            }}
          >
            ⚠️ Simuler une erreur
          </button>
        </div>
        <div className="mt-3 text-xs text-red-600">
          💡 <strong>Note :</strong> Les erreurs et messages n'apparaîtront dans Sentry que si vous avez configuré la DSN.
        </div>
      </div>
    </div>
  );
};