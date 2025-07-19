import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIProviderService } from '@/services/aiProviderService';
import { Brain, Zap, Search, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProviderStats {
  provider: string;
  successRate: number;
  totalRequests: number;
  avgResponseTime: number;
  lastUsed: Date;
  costLevel: 'low' | 'medium' | 'high';
  capabilities: string[];
}

interface PerformanceMetric {
  timestamp: string;
  provider: string;
  responseTime: number;
  success: boolean;
}

export const AIProviderDashboard: React.FC = () => {
  const [stats, setStats] = useState<ProviderStats[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetric[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const aiService = AIProviderService.getInstance();

  useEffect(() => {
    loadStats();
    // Simuler des données de performance historique
    generateMockPerformanceData();
  }, []);

  const loadStats = async () => {
    try {
      const providerStats = aiService.getProviderStats();
      
      // Enrichir avec des données simulées
      const enrichedStats: ProviderStats[] = providerStats.map(stat => ({
        provider: stat.provider,
        successRate: stat.successRate,
        totalRequests: Math.floor(Math.random() * 100) + 10,
        avgResponseTime: Math.floor(Math.random() * 2000) + 500,
        lastUsed: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
        costLevel: getCostLevel(stat.provider),
        capabilities: getCapabilities(stat.provider)
      }));
      
      setStats(enrichedStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const generateMockPerformanceData = () => {
    const data: PerformanceMetric[] = [];
    const providers = ['claude', 'openai', 'perplexity'];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      providers.forEach(provider => {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
        data.push({
          timestamp: timestamp.toISOString(),
          provider,
          responseTime: Math.floor(Math.random() * 3000) + 200,
          success: Math.random() > 0.1
        });
      });
    }
    
    setPerformanceHistory(data.reverse());
  };

  const getCostLevel = (provider: string): 'low' | 'medium' | 'high' => {
    switch (provider) {
      case 'claude': return 'high';
      case 'openai': return 'medium';
      case 'perplexity': return 'low';
      default: return 'medium';
    }
  };

  const getCapabilities = (provider: string): string[] => {
    switch (provider) {
      case 'claude': return ['text', 'vision', 'complex-reasoning'];
      case 'openai': return ['text', 'vision', 'json'];
      case 'perplexity': return ['search', 'real-time'];
      default: return ['text'];
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'claude': return Zap;
      case 'openai': return Brain;
      case 'perplexity': return Search;
      default: return Brain;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'claude': return '#8B5CF6';
      case 'openai': return '#10B981';
      case 'perplexity': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getCostColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    generateMockPerformanceData();
    setRefreshing(false);
  };

  const filteredPerformanceData = selectedProvider 
    ? performanceHistory.filter(d => d.provider === selectedProvider)
    : performanceHistory;

  const pieData = stats.map(stat => ({
    name: stat.provider,
    value: stat.totalRequests,
    color: getProviderColor(stat.provider)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard AI Providers</h2>
          <p className="text-muted-foreground">Monitoring des performances et statistiques en temps réel</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.filter(s => s.successRate > 80).length} avec taux de succès &gt; 80%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requêtes Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reduce((sum, stat) => sum + stat.totalRequests, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Depuis le démarrage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Réponse Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.reduce((sum, stat) => sum + stat.avgResponseTime, 0) / stats.length || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Tous providers confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Succès Global</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.reduce((sum, stat) => sum + stat.successRate, 0) / stats.length || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Moyenne pondérée
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détails par provider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par Provider</CardTitle>
            <CardDescription>Performance et fiabilité de chaque fournisseur IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map(stat => {
              const Icon = getProviderIcon(stat.provider);
              return (
                <div key={stat.provider} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: getProviderColor(stat.provider) }} />
                      <span className="font-medium capitalize">{stat.provider}</span>
                      <Badge className={getCostColor(stat.costLevel)} variant="secondary">
                        {stat.costLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.successRate}% · {stat.avgResponseTime}ms
                    </div>
                  </div>
                  
                  <Progress value={stat.successRate} className="h-2" />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stat.totalRequests} requêtes</span>
                    <span>Dernière utilisation: {stat.lastUsed.toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {stat.capabilities.map(cap => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Requêtes</CardTitle>
            <CardDescription>Distribution du trafic entre les providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Temps de Réponse (24h)</CardTitle>
              <CardDescription>Évolution des performances sur les dernières 24 heures</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedProvider === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProvider(null)}
              >
                Tous
              </Button>
              {stats.map(stat => (
                <Button
                  key={stat.provider}
                  variant={selectedProvider === stat.provider ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProvider(stat.provider)}
                >
                  {stat.provider}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number, name: string) => [`${value}ms`, 'Temps de réponse']}
                />
                {selectedProvider ? (
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke={getProviderColor(selectedProvider)}
                    strokeWidth={2}
                    dot={false}
                  />
                ) : (
                  stats.map(stat => (
                    <Line 
                      key={stat.provider}
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke={getProviderColor(stat.provider)}
                      strokeWidth={2}
                      dot={false}
                      data={performanceHistory.filter(d => d.provider === stat.provider)}
                    />
                  ))
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};