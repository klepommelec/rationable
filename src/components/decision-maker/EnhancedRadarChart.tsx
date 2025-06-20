
import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IBreakdownItem } from '@/types/decision';

interface EnhancedRadarChartProps {
  data: IBreakdownItem[];
}

export const EnhancedRadarChart: React.FC<EnhancedRadarChartProps> = ({ data }) => {
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
        <CardTitle>Analyse Radar</CardTitle>
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
            
            {chartData.map((item, index) => (
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
            ))}
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
