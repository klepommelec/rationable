import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  Database, 
  Image, 
  Network, 
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { performanceUtils } from './PerformanceMonitor';
import { cacheUtils } from '@/utils/cache';
import { taskScheduler, resourceManager, lruCache } from '@/utils/optimization';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  navigation?: PerformanceNavigationTiming;
}

interface CacheStats {
  api: any;
  user: any;
  workspace: any;
}

interface SystemStats {
  tasks: any;
  resources: any;
  cache: any;
}

/**
 * Dashboard de performance pour visualiser les métriques en temps réel
 */
export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Charger les métriques initiales
    loadMetrics();
    loadCacheStats();
    loadSystemStats();

    // Mettre à jour les stats périodiquement
    const interval = setInterval(() => {
      loadCacheStats();
      loadSystemStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    const navigation = performanceUtils.getNavigationMetrics();
    const resources = performanceUtils.getResourceMetrics();
    
    setMetrics({
      navigation,
      // Autres métriques seraient chargées depuis le PerformanceMonitor
    });
  };

  const loadCacheStats = () => {
    try {
      const stats = cacheUtils.getAllStats();
      setCacheStats(stats);
    } catch (error) {
      console.warn('Erreur lors du chargement des stats de cache:', error);
    }
  };

  const loadSystemStats = () => {
    try {
      setSystemStats({
        tasks: taskScheduler.getStats(),
        resources: resourceManager.getStats(),
        cache: lruCache.getStats()
      });
    } catch (error) {
      console.warn('Erreur lors du chargement des stats système:', error);
    }
  };

  const getMetricRating = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return { rating: 'good', color: 'green' };
    if (value <= thresholds.poor) return { rating: 'needs-improvement', color: 'yellow' };
    return { rating: 'poor', color: 'red' };
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const clearAllCaches = () => {
    // Implémentation pour vider tous les caches
    console.log('Clearing all caches...');
    loadCacheStats();
  };

  const refreshMetrics = () => {
    loadMetrics();
    loadCacheStats();
    loadSystemStats();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
        <div className="flex space-x-2">
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={clearAllCaches} variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Vider les caches
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métriques Web Vitals</TabsTrigger>
          <TabsTrigger value="cache">Cache & Stockage</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LCP */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}
                </div>
                {metrics.lcp && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={
                      getMetricRating(metrics.lcp, { good: 2500, poor: 4000 }).rating === 'good' ? 'default' :
                      getMetricRating(metrics.lcp, { good: 2500, poor: 4000 }).rating === 'needs-improvement' ? 'secondary' : 'destructive'
                    }>
                      {getMetricRating(metrics.lcp, { good: 2500, poor: 4000 }).rating}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FID */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}
                </div>
                {metrics.fid && (
                  <Badge variant={
                    getMetricRating(metrics.fid, { good: 100, poor: 300 }).rating === 'good' ? 'default' :
                    getMetricRating(metrics.fid, { good: 100, poor: 300 }).rating === 'needs-improvement' ? 'secondary' : 'destructive'
                  }>
                    {getMetricRating(metrics.fid, { good: 100, poor: 300 }).rating}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* CLS */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </div>
                {metrics.cls && (
                  <Badge variant={
                    getMetricRating(metrics.cls, { good: 0.1, poor: 0.25 }).rating === 'good' ? 'default' :
                    getMetricRating(metrics.cls, { good: 0.1, poor: 0.25 }).rating === 'needs-improvement' ? 'secondary' : 'destructive'
                  }>
                    {getMetricRating(metrics.cls, { good: 0.1, poor: 0.25 }).rating}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* TTFB */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time to First Byte</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}
                </div>
                {metrics.ttfb && (
                  <Badge variant={
                    getMetricRating(metrics.ttfb, { good: 800, poor: 1800 }).rating === 'good' ? 'default' :
                    getMetricRating(metrics.ttfb, { good: 800, poor: 1800 }).rating === 'needs-improvement' ? 'secondary' : 'destructive'
                  }>
                    {getMetricRating(metrics.ttfb, { good: 800, poor: 1800 }).rating}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* FCP */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First Contentful Paint</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A'}
                </div>
                {metrics.fcp && (
                  <Badge variant={
                    getMetricRating(metrics.fcp, { good: 1800, poor: 3000 }).rating === 'good' ? 'default' :
                    getMetricRating(metrics.fcp, { good: 1800, poor: 3000 }).rating === 'needs-improvement' ? 'secondary' : 'destructive'
                  }>
                    {getMetricRating(metrics.fcp, { good: 1800, poor: 3000 }).rating}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Cache API</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Entrées:</span>
                      <span>{cacheStats.api.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max:</span>
                      <span>{cacheStats.api.maxSize}</span>
                    </div>
                    <Progress 
                      value={(cacheStats.api.size / cacheStats.api.maxSize) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Cache Utilisateur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Entrées:</span>
                      <span>{cacheStats.user.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max:</span>
                      <span>{cacheStats.user.maxSize}</span>
                    </div>
                    <Progress 
                      value={(cacheStats.user.size / cacheStats.user.maxSize) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Cache Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Entrées:</span>
                      <span>{cacheStats.workspace.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max:</span>
                      <span>{cacheStats.workspace.maxSize}</span>
                    </div>
                    <Progress 
                      value={(cacheStats.workspace.size / cacheStats.workspace.maxSize) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Tâches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>En attente:</span>
                      <span>{systemStats.tasks.pendingTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En cours:</span>
                      <span>{systemStats.tasks.isRunning ? 'Oui' : 'Non'}</span>
                    </div>
                    {systemStats.tasks.currentTask && (
                      <div className="flex justify-between">
                        <span>Tâche actuelle:</span>
                        <span className="text-xs">{systemStats.tasks.currentTask}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Ressources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Chargées:</span>
                      <span>{systemStats.resources.loadedResources}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En cours:</span>
                      <span>{systemStats.resources.loadingResources}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En queue:</span>
                      <span>{systemStats.resources.preloadQueue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Cache LRU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Taille:</span>
                      <span>{systemStats.cache.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max:</span>
                      <span>{systemStats.cache.maxSize}</span>
                    </div>
                    <Progress 
                      value={(systemStats.cache.size / systemStats.cache.maxSize) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.navigation ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.navigation.dns.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">DNS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.navigation.tcp.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">TCP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.navigation.request.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">Request</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.navigation.response.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.navigation.dom.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">DOM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics.navigation.load.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">Load</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Aucune métrique de navigation disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


