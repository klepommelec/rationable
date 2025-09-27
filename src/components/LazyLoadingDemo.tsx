import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  createLazyComponent, 
  IntersectionLazyComponent,
  lazyUtils 
} from './LazyComponent';
import { 
  OptimizedImage, 
  AspectRatioImage, 
  ResponsiveImage 
} from './OptimizedImage';
import { 
  FadeTransition, 
  ScaleTransition, 
  StaggerTransition, 
  StaggerItem 
} from './animations/PageTransition';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Image, 
  Zap,
  Eye,
  Clock
} from 'lucide-react';

// Composant lourd simulé pour la démonstration
const HeavyComponent = createLazyComponent(
  () => new Promise(resolve => {
    // Simuler un composant lourd qui prend du temps à charger
    setTimeout(() => {
      resolve({
        default: () => (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Composant Lourd Chargé</h3>
            <p className="text-gray-600 mb-4">
              Ce composant a été chargé de manière paresseuse avec notre système avancé.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm font-medium">Fonctionnalité 1</div>
                <div className="text-xs text-gray-500">Description</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm font-medium">Fonctionnalité 2</div>
                <div className="text-xs text-gray-500">Description</div>
              </div>
            </div>
          </div>
        )
      });
    }, 2000);
  }),
  { preload: false, retryCount: 3 }
);

// Composant avec préchargement
const PreloadedComponent = createLazyComponent(
  () => new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Composant Préchargé</h3>
            <p className="text-gray-600">
              Ce composant a été préchargé en arrière-plan pour un chargement instantané.
            </p>
          </div>
        )
      });
    }, 1000);
  }),
  { preload: true, preloadDelay: 1000 }
);

/**
 * Composant de démonstration du lazy loading avancé
 */
export const LazyLoadingDemo: React.FC = () => {
  const [showHeavyComponent, setShowHeavyComponent] = useState(false);
  const [showPreloadedComponent, setShowPreloadedComponent] = useState(false);
  const [showIntersectionDemo, setShowIntersectionDemo] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const handleLoadHeavyComponent = () => {
    const startTime = performance.now();
    setShowHeavyComponent(true);
    
    // Simuler le temps de chargement
    setTimeout(() => {
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
    }, 2000);
  };

  const handleLoadPreloadedComponent = () => {
    setShowPreloadedComponent(true);
  };

  const handleLoadIntersectionDemo = () => {
    setShowIntersectionDemo(true);
  };

  const resetDemo = () => {
    setShowHeavyComponent(false);
    setShowPreloadedComponent(false);
    setShowIntersectionDemo(false);
    setLoadTime(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Démonstration Lazy Loading Avancé</h1>
          <p className="text-gray-600 mt-2">
            Testez les améliorations du lazy loading avec préchargement intelligent
          </p>
        </div>
        <Button onClick={resetDemo} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Statistiques de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {loadTime ? `${loadTime.toFixed(0)}ms` : '--'}
              </div>
              <div className="text-sm text-gray-600">Temps de chargement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {showHeavyComponent ? '✓' : '--'}
              </div>
              <div className="text-sm text-gray-600">Composant lourd</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {showPreloadedComponent ? '✓' : '--'}
              </div>
              <div className="text-sm text-gray-600">Composant préchargé</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Démonstrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composant lourd */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Composant Lourd
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Ce composant simule un composant lourd qui prend 2 secondes à charger.
              Il utilise notre système de retry automatique.
            </p>
            <Button 
              onClick={handleLoadHeavyComponent}
              disabled={showHeavyComponent}
              className="w-full"
            >
              {showHeavyComponent ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Chargement en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Charger le composant lourd
                </>
              )}
            </Button>
            {showHeavyComponent && (
              <FadeTransition>
                <HeavyComponent />
              </FadeTransition>
            )}
          </CardContent>
        </Card>

        {/* Composant préchargé */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Composant Préchargé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Ce composant est préchargé en arrière-plan pour un chargement instantané
              quand vous cliquez sur le bouton.
            </p>
            <Button 
              onClick={handleLoadPreloadedComponent}
              disabled={showPreloadedComponent}
              className="w-full"
            >
              {showPreloadedComponent ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Chargé instantanément !
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Charger le composant préchargé
                </>
              )}
            </Button>
            {showPreloadedComponent && (
              <ScaleTransition>
                <PreloadedComponent />
              </ScaleTransition>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Démonstration Intersection Observer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Intersection Observer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Ce composant se charge automatiquement quand il devient visible dans la viewport.
            Faites défiler vers le bas pour le voir se charger.
          </p>
          <Button onClick={handleLoadIntersectionDemo} className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Activer l'Intersection Observer
          </Button>
          
          {showIntersectionDemo && (
            <div className="space-y-4">
              {/* Espace pour forcer le scroll */}
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Faites défiler vers le bas...</p>
              </div>
              
              <IntersectionLazyComponent
                fallback={
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="animate-pulse text-gray-500">Chargement...</div>
                  </div>
                }
              >
                <StaggerTransition>
                  <div className="space-y-4">
                    <StaggerItem>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold">Élément 1</h3>
                        <p className="text-sm text-gray-600">Chargé avec intersection observer</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold">Élément 2</h3>
                        <p className="text-sm text-gray-600">Animation en cascade</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h3 className="font-semibold">Élément 3</h3>
                        <p className="text-sm text-gray-600">Performance optimisée</p>
                      </div>
                    </StaggerItem>
                  </div>
                </StaggerTransition>
              </IntersectionLazyComponent>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Démonstration des images optimisées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Images Optimisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Image Standard</h4>
              <OptimizedImage
                src="https://picsum.photos/300/200?random=1"
                alt="Image optimisée"
                width={300}
                height={200}
                quality={75}
                loading="lazy"
                className="rounded-lg"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Image Responsive</h4>
              <ResponsiveImage
                src="https://picsum.photos/300/200?random=2"
                alt="Image responsive"
                breakpoints={{
                  sm: 640,
                  md: 768,
                  lg: 1024
                }}
                className="rounded-lg"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Image avec Ratio</h4>
              <AspectRatioImage
                src="https://picsum.photos/300/200?random=3"
                alt="Image avec ratio"
                aspectRatio={16/9}
                className="rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilitaires de lazy loading */}
      <Card>
        <CardHeader>
          <CardTitle>Utilitaires de Lazy Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => lazyUtils.preload(() => import('./LazyComponent'))}
              >
                Précharger LazyComponent
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => lazyUtils.preloadMultiple([
                  () => import('./OptimizedImage'),
                  () => import('./animations/PageTransition')
                ])}
              >
                Précharger Multiple
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>Ces boutons démontrent les utilitaires de préchargement :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><code>preload()</code> - Précharge un composant spécifique</li>
                <li><code>preloadMultiple()</code> - Précharge plusieurs composants</li>
                <li>Vérifiez la console pour voir les composants se charger</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


