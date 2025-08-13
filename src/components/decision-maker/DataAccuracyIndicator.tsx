import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { IResult } from '@/types/decision';

interface DataAccuracyIndicatorProps {
  result: IResult;
  className?: string;
}

export const DataAccuracyIndicator: React.FC<DataAccuracyIndicatorProps> = ({ 
  result, 
  className = '' 
}) => {
  const { realTimeData, dataFreshness } = result;

  if (!realTimeData?.hasRealTimeData) {
    return null;
  }

  const getFreshnessInfo = () => {
    switch (dataFreshness) {
      case 'very-fresh':
        return {
          icon: CheckCircle,
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
          label: 'Données très récentes',
          description: 'Informations vérifiées et actualisées'
        };
      case 'fresh':
        return {
          icon: Clock,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          label: 'Données récentes',
          description: 'Informations fiables et à jour'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
          label: 'Données standard',
          description: 'Informations générales'
        };
    }
  };

  const freshnessInfo = getFreshnessInfo();
  const IconComponent = freshnessInfo.icon;
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-muted/30 border ${className}`}>
      <Badge variant="secondary" className={`gap-1.5 ${freshnessInfo.color}`}>
        <IconComponent className="h-3 w-3" />
        {freshnessInfo.label}
      </Badge>
      
      <div className="flex-1 text-sm text-muted-foreground">
        {freshnessInfo.description}
        {realTimeData.timestamp && (
          <span className="ml-2 opacity-70">
            • Mise à jour: {formatTimestamp(realTimeData.timestamp)}
          </span>
        )}
      </div>
      
      {realTimeData.sourcesCount && realTimeData.sourcesCount > 0 && (
        <Badge variant="outline" className="text-xs">
          {realTimeData.sourcesCount} source{realTimeData.sourcesCount > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};