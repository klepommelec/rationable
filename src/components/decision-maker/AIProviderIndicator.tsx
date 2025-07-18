
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, Zap, Search } from 'lucide-react';

interface AIProviderIndicatorProps {
  provider?: string;
  model?: string;
  success?: boolean;
  realTimeProvider?: string;
  className?: string;
}

const getProviderInfo = (provider: string) => {
  switch (provider) {
    case 'openai':
      return {
        name: 'OpenAI',
        icon: Brain,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        description: 'Modèle GPT pour l\'analyse générale'
      };
    case 'claude':
      return {
        name: 'Claude',
        icon: Zap,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        description: 'Modèle Claude pour l\'analyse complexe'
      };
    case 'perplexity':
      return {
        name: 'Perplexity',
        icon: Search,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        description: 'Recherche en temps réel'
      };
    case 'fallback':
      return {
        name: 'Fallback',
        icon: Brain,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        description: 'Mode de secours'
      };
    default:
      return {
        name: provider || 'Unknown',
        icon: Brain,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        description: 'Fournisseur inconnu'
      };
  }
};

export const AIProviderIndicator: React.FC<AIProviderIndicatorProps> = ({
  provider,
  model,
  success = true,
  realTimeProvider,
  className = ''
}) => {
  if (!provider) return null;

  const providerInfo = getProviderInfo(provider);
  const Icon = providerInfo.icon;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`${providerInfo.color} ${!success ? 'opacity-60' : ''}`}
            >
              <Icon className="h-3 w-3 mr-1" />
              {providerInfo.name}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p>{providerInfo.description}</p>
              {model && <p>Modèle: {model}</p>}
              <p>Statut: {success ? 'Succès' : 'Échec'}</p>
            </div>
          </TooltipContent>
        </Tooltip>

        {realTimeProvider && realTimeProvider !== provider && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs">
                <Search className="h-3 w-3 mr-1" />
                {getProviderInfo(realTimeProvider).name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Données temps réel via {getProviderInfo(realTimeProvider).name}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
