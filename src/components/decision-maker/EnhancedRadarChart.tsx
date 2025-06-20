
import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';

interface EnhancedRadarChartProps {
  data: IBreakdownItem[];
}

export const EnhancedRadarChart: React.FC<EnhancedRadarChartProps> = ({ data }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [showAll, setShowAll] = React.useState(true);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  // Créer des catégories basées sur les pros/cons communs
  const categories = React.useMemo(() => [
    'Performance',
    'Rapport qualité-prix',
    'Facilité d\'usage',
    'Fiabilité',
    'Innovation'
  ], []);

  const radarData = React.useMemo(() => {
    return categories.map(category => {
      const categoryData: any = { category };
      
      data.forEach((item, index) => {
        const cleanName = item.option.replace(/^Option\s+\d+:\s*/i, '').trim();
        // Simuler des scores par catégorie basés sur le score global avec variations
        const baseScore = item.score;
        const variation = (Math.sin(index + category.length) * 15);
        categoryData[cleanName] = Math.max(20, Math.min(100, baseScore + variation));
      });
      
      return categoryData;
    });
  }, [data, categories]);

  const chartData = data.map((item, index) => ({
    name: item.option.replace(/^Option\s+\d+:\s*/i, '').trim(),
    score: item.score,
    color: colors[index % colors.length],
  }));

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % data.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnimating, data.length]);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetView = () => {
    setIsAnimating(false);
    setCurrentIndex(0);
    setShowAll(true);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">{entry.dataKey}: {entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Analyse Radar Interactive</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleAnimation}
              className="flex items-center gap-1"
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isAnimating ? 'Pause' : 'Animer'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetView}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid 
              stroke="hsl(var(--border))"
              className="opacity-30"
            />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              className="text-xs"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              tickCount={6}
            />
            
            {showAll ? (
              chartData.map((item, index) => (
                <Radar
                  key={item.name}
                  name={item.name}
                  dataKey={item.name}
                  stroke={item.color}
                  fill={item.color}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, fill: item.color }}
                  animationBegin={index * 200}
                  animationDuration={1000}
                />
              ))
            ) : (
              <Radar
                name={chartData[currentIndex]?.name}
                dataKey={chartData[currentIndex]?.name}
                stroke={chartData[currentIndex]?.color}
                fill={chartData[currentIndex]?.color}
                fillOpacity={0.2}
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: chartData[currentIndex]?.color }}
                animationBegin={0}
                animationDuration={800}
              />
            )}
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {isAnimating && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">
                Focus sur: {chartData[currentIndex]?.name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
