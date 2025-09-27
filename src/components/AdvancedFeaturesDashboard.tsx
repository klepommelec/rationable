import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard principal pour les fonctionnalités avancées
 */
export const AdvancedFeaturesDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard des Fonctionnalités Avancées</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lazy Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Système de lazy loading avancé avec préchargement intelligent.
            </p>
            <div className="mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Activé
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Animations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Transitions fluides avec Framer Motion.
            </p>
            <div className="mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Activé
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibilité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Audit automatique avec axe-core.
            </p>
            <div className="mt-2">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Dev Mode
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring Sentry</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Suivi des erreurs et performances.
            </p>
            <div className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Configuré
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Démonstration Lazy Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Testez les améliorations du lazy loading avec cette démonstration interactive.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Composant Lourd</h3>
              <p className="text-sm text-gray-600 mb-2">
                Ce composant simule un composant lourd qui prend du temps à charger.
              </p>
              <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
                Charger le composant
              </button>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">Composant Préchargé</h3>
              <p className="text-sm text-gray-600 mb-2">
                Ce composant est préchargé en arrière-plan pour un chargement instantané.
              </p>
              <button className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600">
                Charger instantanément
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métriques de Performance</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};