import React from 'react';
import { IResult } from '@/types/decision';
import { CheckCircle2, Zap } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';
import { Badge } from '@/components/ui/badge';
import { WorkspaceDocumentIndicator } from './WorkspaceDocumentIndicator';

interface AnalysisResultProps {
  result: IResult;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: string;
  currentDecision: any;
  dilemma: string;
}

const AnalysisResult = ({ result, isUpdating, clearSession, analysisStep, currentDecision, dilemma }: AnalysisResultProps) => {
  const isLoading = isUpdating && analysisStep === 'loading-options';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête avec indicateurs de données */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analyse terminée</h2>
            <p className="text-sm text-gray-600">Recommandation générée avec succès</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <ConfidenceIndicator 
            breakdown={result.breakdown} 
            topOption={result.breakdown[0]} 
            result={result} 
          />
          <DataFreshnessIndicator 
            hasRealTimeData={result.realTimeData?.hasRealTimeData || false}
            timestamp={result.realTimeData?.timestamp}
            sourcesCount={result.realTimeData?.sourcesCount || 0}
            dataFreshness={result.dataFreshness || 'moderate'}
          />
          <WorkspaceDocumentIndicator workspaceData={result.workspaceData} />
          {result.realTimeData?.hasRealTimeData && (
            <Badge variant="outline" className="gap-2 bg-purple-50 text-purple-700 border-purple-200">
              <Zap className="h-3 w-3" />
              Données temps réel
            </Badge>
          )}
        </div>
      </div>

      {/* Recommandation principale */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recommandation: {result.recommendation}
        </h3>
        <p className="text-gray-700">{result.description}</p>
      </div>

      {/* Breakdown des options */}
      {result.breakdown && result.breakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Analyse Détaillée des Options
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Option
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avantages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inconvénients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.breakdown.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.option}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                      {item.pros.map((pro, i) => (
                        <div key={i}>- {pro}</div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                      {item.cons.map((con, i) => (
                        <div key={i}>- {con}</div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.score} / 100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Liens Utiles */}
      {result.infoLinks && result.infoLinks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Liens Utiles
          </h3>
          <ul>
            {result.infoLinks.map((link, index) => (
              <li key={index} className="mb-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Liens d'Achat */}
      {result.shoppingLinks && result.shoppingLinks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Liens d'Achat
          </h3>
          <ul>
            {result.shoppingLinks.map((link, index) => (
              <li key={index} className="mb-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
