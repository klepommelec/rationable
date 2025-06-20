
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Star, Award, Medal } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';

interface VisualIndicatorsProps {
  data: IBreakdownItem[];
}

export const VisualIndicators: React.FC<VisualIndicatorsProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.score - a.score);
  const averageScore = data.reduce((acc, item) => acc + item.score, 0) / data.length;
  
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Indicateurs Visuels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedData.map((item, index) => {
          const cleanName = item.option.replace(/^Option\s+\d+:\s*/i, '').trim();
          return (
            <div 
              key={item.option}
              className="space-y-2 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getScoreIcon(item.score, index)}
                  <span className="font-medium text-sm">{cleanName}</span>
                  {index < 3 && (
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(item.score)}
                  <span className="text-sm font-semibold">{item.score}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={item.score} 
                  className="h-2"
                  style={{
                    background: 'hsl(var(--muted))'
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Score: {item.score}/100</span>
                  <span>
                    {item.score > averageScore ? '+' : ''}
                    {Math.round(item.score - averageScore)} vs moyenne
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-green-700 bg-green-50 p-2 rounded">
                  <div className="font-medium mb-1">Points forts ({item.pros.length})</div>
                  {item.pros.slice(0, 2).map((pro, i) => (
                    <div key={i} className="text-xs opacity-80">• {pro}</div>
                  ))}
                </div>
                <div className="text-red-700 bg-red-50 p-2 rounded">
                  <div className="font-medium mb-1">Points faibles ({item.cons.length})</div>
                  {item.cons.slice(0, 2).map((con, i) => (
                    <div key={i} className="text-xs opacity-80">• {con}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
