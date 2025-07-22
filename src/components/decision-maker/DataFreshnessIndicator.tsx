
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, Database, Wifi, WifiOff } from 'lucide-react';

interface DataFreshnessIndicatorProps {
  hasRealTimeData: boolean;
  timestamp?: string;
  sourcesCount?: number;
  dataFreshness: 'very-fresh' | 'fresh' | 'moderate' | 'stale';
  className?: string;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  hasRealTimeData,
  timestamp,
  sourcesCount = 0,
  dataFreshness,
  className = ""
}) => {
  const getFreshnessConfig = () => {
    switch (dataFreshness) {
      case 'very-fresh':
        return {
          label: "Très récent",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: Wifi,
          description: "Données mises à jour récemment"
        };
      case 'fresh':
        return {
          label: "Récent",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Wifi,
          description: "Données relativement récentes"
        };
      case 'moderate':
        return {
          label: "Modérée",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          description: "Données potentiellement partielles"
        };
      case 'stale':
        return {
          label: "Limitée",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: WifiOff,
          description: "Données potentiellement obsolètes"
        };
    }
  };

  const { label, color, icon: Icon, description } = getFreshnessConfig();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    }
    if (diffInMinutes < 1440) {
      return `il y a ${Math.floor(diffInMinutes / 60)}h`;
    }
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        className={`${color} border text-xs flex items-center gap-1 transition-all duration-200`}
        title={description}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
        {label}
      </Badge>
      
      {hasRealTimeData && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Database className="h-3 w-3" aria-hidden="true" />
          <span title="Sites web et bases de données consultés pour obtenir des informations récentes">
            {sourcesCount > 0 && `${sourcesCount} sources web`}
            {timestamp && sourcesCount > 0 && ' • '}
            {timestamp && formatTimestamp(timestamp)}
          </span>
        </div>
      )}
    </div>
  );
};
