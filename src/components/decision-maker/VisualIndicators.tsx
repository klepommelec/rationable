import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Star, Award, Medal, CheckCircle, XCircle } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';
interface VisualIndicatorsProps {
  data: IBreakdownItem[];
}
export const VisualIndicators: React.FC<VisualIndicatorsProps> = ({
  data
}) => {
  const sortedData = [...data].sort((a, b) => b.score - a.score);
  const averageScore = data.reduce((acc, item) => acc + item.score, 0) / data.length;

  // Calculer les statistiques des pros/cons
  const totalPros = data.reduce((acc, item) => acc + item.pros.length, 0);
  const totalCons = data.reduce((acc, item) => acc + item.cons.length, 0);
  const avgPros = Math.round(totalPros / data.length);
  const avgCons = Math.round(totalCons / data.length);
  const prosConsMetrics = [{
    title: 'Points Forts',
    value: totalPros,
    avg: avgPros,
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    color: 'text-green-700 bg-gray-100'
  }, {
    title: 'Points Faibles',
    value: totalCons,
    avg: avgCons,
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    color: 'text-red-700 bg-gray-100'
  }];
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-yellow-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };
  const getScoreIcon = (score: number, index: number) => {
    if (index === 0) return <Award className="h-4 w-4 text-yellow-600" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-500" />;
    if (index === 2) return <Star className="h-4 w-4 text-amber-600" />;
    return null;
  };
  const getTrendIcon = (score: number) => {
    if (score > averageScore + 10) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score < averageScore - 10) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };
  return <Card>
      <CardHeader>
        <CardTitle>Pros/Cons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analyse Pros/Cons */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Analyse Pros/Cons</h3>
          <div className="grid grid-cols-2 gap-4">
            {prosConsMetrics.map((metric, index) => <div key={metric.title} className={`p-4 rounded-lg ${metric.color} animate-fade-in`} style={{
            animationDelay: `${index * 200}ms`
          }}>
                <div className="flex items-center gap-2 mb-2">
                  {metric.icon}
                  <span className="font-medium text-sm">{metric.title}</span>
                </div>
                <div className="text-2xl font-medium mb-1 text-black">{metric.value}</div>
                <div className="text-xs opacity-75 text-gray-600 ">
                  Moyenne: {metric.avg} par option
                </div>
              </div>)}
          </div>
        </div>

        {/* Analyse détaillée */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Analyse détaillée</h3>
          <div className="space-y-4">
            {sortedData.map((item, index) => {
            const cleanName = item.option.replace(/^Option\s+\d+:\s*/i, '').trim();
            return <div key={item.option} style={{
              animationDelay: `${index * 100}ms`
            }} className="space-y-2 p-3 rounded-lg border transition-colors animate-fade-in bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getScoreIcon(item.score, index)}
                      <span className="font-medium text-sm">{cleanName}</span>
                      {index < 3 && <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {item.score > averageScore ? '+' : ''}
                        {Math.round(item.score - averageScore)} vs moyenne
                      </span>
                      {getTrendIcon(item.score)}
                      <span className="text-sm font-semibold">{item.score}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={item.score} className="h-2" style={{
                  background: 'hsl(var(--muted))'
                }} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Score: {item.score}/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-700 bg-green-50 p-2 rounded">
                      <div className="font-medium mb-1">Points forts ({item.pros.length})</div>
                      {item.pros.slice(0, 2).map((pro, i) => <div key={i} className="text-xs opacity-80">• {pro}</div>)}
                    </div>
                    <div className="text-red-700 bg-red-50 p-2 rounded">
                      <div className="font-medium mb-1">Points faibles ({item.cons.length})</div>
                      {item.cons.slice(0, 2).map((con, i) => <div key={i} className="text-xs opacity-80">• {con}</div>)}
                    </div>
                  </div>
                </div>;
          })}
          </div>
        </div>
      </CardContent>
    </Card>;
};