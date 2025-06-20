
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Award, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';

interface MetricsVisualProps {
  data: IBreakdownItem[];
}

export const MetricsVisual: React.FC<MetricsVisualProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.score - a.score);
  const averageScore = Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length);
  const maxScore = Math.max(...data.map(item => item.score));
  const minScore = Math.min(...data.map(item => item.score));
  const scoreRange = maxScore - minScore;

  const metrics = [
    {
      title: 'Meilleur Score',
      value: maxScore,
      icon: <Award className="h-5 w-5 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-900',
      description: sortedData[0]?.option.replace(/^Option\s+\d+:\s*/i, '').trim()
    },
    {
      title: 'Score Moyen',
      value: averageScore,
      icon: <Target className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900',
      description: 'Moyenne générale'
    },
    {
      title: 'Écart de Scores',
      value: scoreRange,
      icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-900',
      description: `${minScore} - ${maxScore} points`
    },
    {
      title: 'Options Analysées',
      value: data.length,
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-900',
      description: 'Alternatives évaluées'
    }
  ];

  const getScoreQuality = (score: number) => {
    if (score >= 90) return { label: 'Exceptionnel', color: 'bg-yellow-100 text-yellow-800', icon: <Zap className="h-3 w-3" /> };
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> };
    if (score >= 70) return { label: 'Bon', color: 'bg-blue-100 text-blue-800', icon: <TrendingUp className="h-3 w-3" /> };
    if (score >= 60) return { label: 'Moyen', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="h-3 w-3" /> };
    return { label: 'Faible', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> };
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques Clés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div 
                key={metric.title}
                className={`p-4 rounded-lg border-2 ${metric.color} animate-fade-in transition-all hover:scale-105`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  {metric.icon}
                  <span className={`text-2xl font-bold ${metric.textColor}`}>
                    {metric.value}
                  </span>
                </div>
                <div className={`text-sm font-medium ${metric.textColor} mb-1`}>
                  {metric.title}
                </div>
                <div className={`text-xs ${metric.textColor} opacity-75`}>
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse des options */}
      <Card>
        <CardHeader>
          <CardTitle>Qualité des Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedData.map((item, index) => {
              const cleanName = item.option.replace(/^Option\s+\d+:\s*/i, '').trim();
              const quality = getScoreQuality(item.score);
              
              return (
                <div 
                  key={item.option}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border hover:bg-accent/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{cleanName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${quality.color} flex items-center gap-1`}>
                          {quality.icon}
                          {quality.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.pros.length} pros, {item.cons.length} cons
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{item.score}</div>
                    <div className="text-xs text-muted-foreground">/100</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
