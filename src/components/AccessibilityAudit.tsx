import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Eye, 
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

interface AccessibilityResults {
  violations: AccessibilityIssue[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
  timestamp: number;
  url: string;
}

/**
 * Composant d'audit d'accessibilité avec axe-core
 */
export const AccessibilityAudit: React.FC = () => {
  const [results, setResults] = useState<AccessibilityResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger axe-core en développement
  useEffect(() => {
    if (import.meta.env.DEV) {
      import('@axe-core/react').then(axe => {
        axe.default(React, ReactDOM, 1000);
      }).catch(err => {
        console.warn('Axe-core not available:', err);
      });
    }
  }, []);

  const runAudit = async () => {
    setIsRunning(true);
    setError(null);

    try {
      // Vérifier si axe-core est disponible
      if (typeof window !== 'undefined' && (window as any).axe) {
        const axe = (window as any).axe;
        
        const auditResults = await axe.run();
        setResults(auditResults);
      } else {
        // Fallback: utiliser l'API axe-core si disponible
        const response = await fetch('/api/accessibility/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: window.location.href,
            include: ['violations', 'passes', 'incomplete']
          })
        });

        if (response.ok) {
          const auditResults = await response.json();
          setResults(auditResults);
        } else {
          throw new Error('Audit API not available');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'audit');
    } finally {
      setIsRunning(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'serious': return 'destructive';
      case 'moderate': return 'secondary';
      case 'minor': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical':
      case 'serious':
        return <AlertTriangle className="w-4 h-4" />;
      case 'moderate':
        return <Info className="w-4 h-4" />;
      case 'minor':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const exportResults = () => {
    if (!results) return;

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      summary: {
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length
      },
      violations: results.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.length
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit d'Accessibilité</h1>
          <p className="text-gray-600 mt-2">
            Vérification de l'accessibilité de la page avec axe-core
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={runAudit} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {isRunning ? 'Analyse en cours...' : 'Lancer l\'audit'}
          </Button>
          {results && (
            <Button onClick={exportResults} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-6">
          {/* Résumé */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {results.violations.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tests Réussis</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {results.passes.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incomplets</CardTitle>
                <Info className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {results.incomplete.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((results.passes.length / (results.passes.length + results.violations.length)) * 100)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Violations détaillées */}
          {results.violations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Violations d'Accessibilité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.violations.map((violation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getImpactIcon(violation.impact)}
                          <h3 className="font-semibold">{violation.id}</h3>
                          <Badge variant={getImpactColor(violation.impact)}>
                            {violation.impact}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(violation.helpUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{violation.description}</p>
                      <p className="text-sm text-gray-600 mb-3">{violation.help}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Éléments concernés ({violation.nodes.length}):</h4>
                        {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                          <div key={nodeIndex} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="font-mono text-xs mb-1">
                              {node.target.join(' ')}
                            </div>
                            <div className="text-gray-600">
                              {node.failureSummary}
                            </div>
                          </div>
                        ))}
                        {violation.nodes.length > 3 && (
                          <div className="text-sm text-gray-500">
                            ... et {violation.nodes.length - 3} autres éléments
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tests réussis */}
          {results.passes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tests d'Accessibilité Réussis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {results.passes.map((pass, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{pass.id}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Comment améliorer l'accessibilité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Bonnes pratiques essentielles :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Utiliser des balises sémantiques (header, nav, main, section, article)</li>
                <li>Ajouter des attributs alt aux images</li>
                <li>Assurer un contraste de couleurs suffisant (ratio 4.5:1 minimum)</li>
                <li>Rendre les éléments interactifs accessibles au clavier</li>
                <li>Utiliser des labels appropriés pour les formulaires</li>
                <li>Implémenter une navigation cohérente</li>
                <li>Fournir des alternatives textuelles pour le contenu multimédia</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Ressources utiles :</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
                    WCAG 2.1 Guidelines
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://webaim.org/" target="_blank" rel="noopener noreferrer">
                    WebAIM
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.deque.com/axe/" target="_blank" rel="noopener noreferrer">
                    axe-core Documentation
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


