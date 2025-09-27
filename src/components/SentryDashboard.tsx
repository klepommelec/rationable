import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Activity, 
  Users, 
  Clock,
  RefreshCw,
  ExternalLink,
  Bug,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { sentryUtils } from '@/lib/sentry';

interface SentryStats {
  errors: {
    total: number;
    resolved: number;
    unresolved: number;
    new: number;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
  };
  releases: {
    version: string;
    date: string;
    errors: number;
  }[];
  topErrors: {
    id: string;
    title: string;
    count: number;
    lastSeen: string;
    level: 'error' | 'warning' | 'info';
  }[];
}

/**
 * Dashboard Sentry pour le monitoring des erreurs
 */
export const SentryDashboard: React.FC = () => {
  const [stats, setStats] = useState<SentryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simuler des données Sentry (en production, ceci viendrait de l'API Sentry)
      const mockStats: SentryStats = {
        errors: {
          total: 42,
          resolved: 28,
          unresolved: 14,
          new: 3
        },
        performance: {
          avgResponseTime: 245,
          p95ResponseTime: 890,
          errorRate: 0.8
        },
        releases: [
          { version: '1.2.3', date: '2024-01-15', errors: 2 },
          { version: '1.2.2', date: '2024-01-10', errors: 5 },
          { version: '1.2.1', date: '2024-01-05', errors: 8 }
        ],
        topErrors: [
          {
            id: 'error-001',
            title: 'TypeError: Cannot read property of undefined',
            count: 15,
            lastSeen: '2024-01-20T10:30:00Z',
            level: 'error'
          },
          {
            id: 'error-002',
            title: 'Network request failed',
            count: 8,
            lastSeen: '2024-01-20T09:15:00Z',
            level: 'error'
          },
          {
            id: 'error-003',
            title: 'Component render error',
            count: 5,
            lastSeen: '2024-01-20T08:45:00Z',
            level: 'warning'
          }
        ]
      };

      setStats(mockStats);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Actualiser toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const testError = () => {
    try {
      // Générer une erreur de test
      throw new Error('Test error from Sentry Dashboard');
    } catch (error) {
      sentryUtils.captureError(error as Error, {
        component: 'SentryDashboard',
        action: 'testError'
      });
    }
  };

  const testMessage = () => {
    sentryUtils.captureMessage('Test message from Sentry Dashboard', 'info');
  };

  const testPerformance = () => {
    const transaction = sentryUtils.startTransaction('test-performance', 'test');
    
    setTimeout(() => {
      transaction.setStatus('ok');
      sentryUtils.captureTransaction(transaction);
    }, 1000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Sentry</h1>
          <p className="text-gray-600 mt-2">
            Monitoring des erreurs et performances en temps réel
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1">
              Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchStats} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualiser
          </Button>
          <Button onClick={testError} variant="outline">
            <Bug className="w-4 h-4 mr-2" />
            Test Erreur
          </Button>
          <Button onClick={testMessage} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Test Message
          </Button>
          <Button onClick={testPerformance} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Test Performance
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <div className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Erreurs Total</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.errors.total}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="destructive">{stats.errors.unresolved} non résolues</Badge>
                  {stats.errors.new > 0 && (
                    <Badge variant="secondary">{stats.errors.new} nouvelles</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'Erreur</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.performance.errorRate}%</div>
                <div className="flex items-center mt-2">
                  {stats.performance.errorRate < 1 ? (
                    <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm text-gray-600">
                    {stats.performance.errorRate < 1 ? 'En baisse' : 'En hausse'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.performance.avgResponseTime}ms</div>
                <div className="text-sm text-gray-600 mt-2">
                  P95: {stats.performance.p95ResponseTime}ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-gray-600">+12% cette semaine</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top erreurs */}
          <Card>
            <CardHeader>
              <CardTitle>Erreurs les Plus Fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topErrors.map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{error.title}</h3>
                        <Badge variant={getLevelColor(error.level)}>
                          {error.level}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Dernière occurrence: {formatDate(error.lastSeen)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{error.count}</div>
                        <div className="text-sm text-gray-600">occurrences</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Versions et releases */}
          <Card>
            <CardHeader>
              <CardTitle>Versions et Releases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.releases.map((release) => (
                  <div key={release.version} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">v{release.version}</div>
                        <div className="text-sm text-gray-600">
                          Déployé le {new Date(release.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{release.errors}</div>
                      <div className="text-sm text-gray-600">erreurs</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <ExternalLink className="w-6 h-6 mb-2" />
                  <span>Voir dans Sentry</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Activity className="w-6 h-6 mb-2" />
                  <span>Rapport de Performance</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Users className="w-6 h-6 mb-2" />
                  <span>Analytics Utilisateurs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Sentry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Variables d'environnement requises :</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                VITE_SENTRY_DSN=your_sentry_dsn_here
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Fonctionnalités activées :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Capture automatique des erreurs JavaScript</li>
                <li>Monitoring des performances</li>
                <li>Session replay</li>
                <li>Breadcrumbs de navigation</li>
                <li>Context utilisateur</li>
                <li>Filtrage des erreurs de développement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


