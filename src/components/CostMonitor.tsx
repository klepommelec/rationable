
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCacheStats } from '@/services/decisionService';

interface CostStats {
  googleImageCalls: number;
  aiImageCalls: number;
  textApiCalls: number;
  cacheHits: number;
  estimatedSavings: number;
}

export const CostMonitor: React.FC = () => {
  const [stats, setStats] = useState<CostStats>({
    googleImageCalls: 0,
    aiImageCalls: 0,
    textApiCalls: 0,
    cacheHits: 0,
    estimatedSavings: 0
  });
  
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Simuler le tracking des coûts (en production, ces données viendraient du backend)
    const cacheStats = getCacheStats();
    
    setStats(prev => ({
      ...prev,
      cacheHits: cacheStats.size
    }));
  }, []);

  const estimatedCost = {
    googleImage: 0.001, // $0.001 par recherche Google
    aiImage: 0.020,     // $0.020 moyenne DALL-E/FLUX
    textApi: 0.002,     // $0.002 par génération de texte
    cacheHit: 0.000     // Gratuit
  };

  const totalCost = (
    stats.googleImageCalls * estimatedCost.googleImage +
    stats.aiImageCalls * estimatedCost.aiImage +
    stats.textApiCalls * estimatedCost.textApi
  );

  const potentialCost = (
    (stats.googleImageCalls + stats.cacheHits) * estimatedCost.aiImage +
    stats.textApiCalls * estimatedCost.textApi
  );

  const actualSavings = potentialCost - totalCost;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          💰 Optimisation des coûts
          <Badge variant="outline" className="text-xs">
            -{Math.round((actualSavings / potentialCost) * 100 || 0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Google Images:</span>
              <span className="font-medium text-green-600">{stats.googleImageCalls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IA Images:</span>
              <span className="font-medium text-orange-600">{stats.aiImageCalls}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Cache hits:</span>
              <span className="font-medium text-blue-600">{stats.cacheHits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API texte:</span>
              <span className="font-medium text-purple-600">{stats.textApiCalls}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-sm font-medium">
            <span>Coût total:</span>
            <span className="text-green-600">${totalCost.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Économisé:</span>
            <span className="text-green-600">${actualSavings.toFixed(4)}</span>
          </div>
        </div>
        
        {showDetails && (
          <div className="pt-2 border-t text-xs text-gray-600">
            <div>Stratégie: Google → Défaut → IA</div>
            <div>Cache: {Math.round((stats.cacheHits / (stats.cacheHits + stats.textApiCalls + 1)) * 100)}% hit rate</div>
          </div>
        )}
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showDetails ? 'Masquer' : 'Voir'} détails
        </button>
      </CardContent>
    </Card>
  );
};
