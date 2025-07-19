import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIProviderService } from '@/services/aiProviderService';
import { Brain, Zap, Search, AlertTriangle, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

interface ProviderStatus {
  provider: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  lastCheck: Date;
  errorMessage?: string;
  uptime: number;
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  provider?: string;
}

export const AIProviderMonitor: React.FC = () => {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const aiService = AIProviderService.getInstance();

  useEffect(() => {
    startMonitoring();
    generateInitialAlerts();
    
    return () => {
      setIsMonitoring(false);
    };
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    checkProviderHealth();
    
    // Vérification périodique toutes les 30 secondes
    const interval = setInterval(() => {
      if (isMonitoring) {
        checkProviderHealth();
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const checkProviderHealth = async () => {
    const providers = ['claude', 'openai', 'perplexity'];
    const statusChecks: ProviderStatus[] = [];

    for (const provider of providers) {
      try {
        const startTime = Date.now();
        
        // Simuler une vérification de santé
        const isHealthy = Math.random() > 0.1; // 90% de chance d'être sain
        const responseTime = Math.floor(Math.random() * 1000) + 100;
        
        // Attendre le temps de réponse simulé
        await new Promise(resolve => setTimeout(resolve, Math.min(responseTime, 100)));
        
        const status: ProviderStatus = {
          provider,
          status: isHealthy ? 'healthy' : 'warning',
          responseTime: Date.now() - startTime,
          lastCheck: new Date(),
          uptime: Math.random() * 100, // Simuler l'uptime
          errorMessage: isHealthy ? undefined : 'Latence élevée détectée'
        };

        // Déterminer le statut basé sur les métriques
        if (status.responseTime > 3000) {
          status.status = 'error';
          status.errorMessage = 'Timeout de réponse';
        } else if (status.responseTime > 2000) {
          status.status = 'warning';
          status.errorMessage = 'Réponse lente';
        }

        statusChecks.push(status);

        // Générer des alertes si nécessaire
        if (status.status !== 'healthy') {
          addAlert({
            id: `${provider}-${Date.now()}`,
            severity: status.status === 'error' ? 'error' : 'warning',
            message: `Provider ${provider}: ${status.errorMessage}`,
            timestamp: new Date(),
            provider
          });
        }

      } catch (error) {
        statusChecks.push({
          provider,
          status: 'error',
          responseTime: 0,
          lastCheck: new Date(),
          uptime: 0,
          errorMessage: 'Échec de connexion'
        });

        addAlert({
          id: `${provider}-error-${Date.now()}`,
          severity: 'error',
          message: `Provider ${provider} inaccessible`,
          timestamp: new Date(),
          provider
        });
      }
    }

    setProviderStatus(statusChecks);
    setLastUpdate(new Date());
  };

  const generateInitialAlerts = () => {
    const alerts: SystemAlert[] = [
      {
        id: '1',
        severity: 'info',
        message: 'Système de monitoring AI initialisé',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '2',
        severity: 'warning',
        message: 'Claude: Taux de succès en baisse (85%)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        provider: 'claude'
      }
    ];

    setSystemAlerts(alerts);
  };

  const addAlert = (alert: SystemAlert) => {
    setSystemAlerts(prev => {
      // Éviter les doublons récents
      const isDuplicate = prev.some(a => 
        a.provider === alert.provider && 
        a.message === alert.message &&
        Date.now() - a.timestamp.getTime() < 60000 // 1 minute
      );

      if (isDuplicate) return prev;

      // Garder seulement les 10 dernières alertes
      const newAlerts = [alert, ...prev].slice(0, 10);
      return newAlerts;
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'claude': return Zap;
      case 'openai': return Brain;
      case 'perplexity': return Search;
      default: return Brain;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'border-blue-200 dark:border-blue-800';
      case 'warning': return 'border-yellow-200 dark:border-yellow-800';
      case 'error': return 'border-red-200 dark:border-red-800';
      default: return 'border-gray-200 dark:border-gray-800';
    }
  };

  const clearAlerts = () => {
    setSystemAlerts([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring AI Providers</h2>
          <p className="text-muted-foreground">
            État en temps réel • Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Activity className={`h-4 w-4 ${isMonitoring ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <Button size="sm" onClick={checkProviderHealth}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statut des providers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providerStatus.map(status => {
          const ProviderIcon = getProviderIcon(status.provider);
          const StatusIcon = getStatusIcon(status.status);
          
          return (
            <Card key={status.provider}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <ProviderIcon className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium capitalize">
                    {status.provider}
                  </CardTitle>
                </div>
                <StatusIcon className={`h-4 w-4 ${getStatusColor(status.status)}`} />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Statut:</span>
                    <Badge 
                      variant={status.status === 'healthy' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {status.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temps de réponse:</span>
                    <span className="text-sm font-mono">{status.responseTime}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime:</span>
                    <span className="text-sm font-mono">{status.uptime.toFixed(1)}%</span>
                  </div>

                  {status.errorMessage && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                      {status.errorMessage}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Dernière vérification: {status.lastCheck.toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertes système */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alertes Système</CardTitle>
              <CardDescription>
                Événements et problèmes détectés ({systemAlerts.length})
              </CardDescription>
            </div>
            {systemAlerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAlerts}>
                Effacer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {systemAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Aucune alerte active</p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemAlerts.map(alert => (
                <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {alert.severity === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                      {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                      {alert.severity === 'info' && <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />}
                      
                      <div>
                        <AlertDescription className="text-sm">
                          {alert.message}
                        </AlertDescription>
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleString()}
                          {alert.provider && ` • Provider: ${alert.provider}`}
                        </div>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        alert.severity === 'error' ? 'text-red-600 border-red-200' :
                        alert.severity === 'warning' ? 'text-yellow-600 border-yellow-200' :
                        'text-blue-600 border-blue-200'
                      }`}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};