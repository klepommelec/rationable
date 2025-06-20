
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Target, PieChart } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';

interface ScoreChartProps {
  data: IBreakdownItem[];
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
  const [chartType, setChartType] = React.useState<'bar' | 'radar' | 'pie'>('bar');
  const [isInteractive, setIsInteractive] = React.useState(false);
  
  const chartData = data.map(item => ({
    name: item.option.replace(/^Option\s+\d+:\s*/i, '').trim(),
    score: item.score,
    fullName: item.option,
  })).sort((a, b) => b.score - a.score);

  // For radar chart, we need to create a different data structure
  const radarData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    // Create categories based on common pros/cons patterns
    const categories = [
      'Performance',
      'Prix',
      'Facilité d\'usage',
      'Qualité',
      'Support'
    ];

    return categories.map(category => {
      const categoryData: any = { category };
      
      data.forEach((item, index) => {
        const cleanName = item.option.replace(/^Option\s+\d+:\s*/i, '').trim();
        // Simulate category scores based on overall score with some variation
        const baseScore = item.score;
        const variation = (Math.sin(index + category.length) * 10);
        categoryData[cleanName] = Math.max(0, Math.min(100, baseScore + variation));
      });
      
      return categoryData;
    });
  }, [data]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg animate-fade-in">
          <p className="font-semibold text-sm mb-1">{label}</p>
          <p className="text-primary">Score: {payload[0].value}/100</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Cliquez pour voir les détails
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Visualisation des Scores</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Barres
            </Button>
            <Button
              variant={chartType === 'radar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('radar')}
            >
              <Target className="h-4 w-4 mr-1" />
              Radar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'bar' ? (
            <BarChart 
              data={chartData} 
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))"
                opacity={0.3}
              />
              <XAxis 
                dataKey="name" 
                tick={{ 
                  fontSize: 12,
                  fill: "hsl(var(--foreground))"
                }} 
                interval={0} 
              />
              <YAxis 
                tick={{ 
                  fontSize: 12,
                  fill: "hsl(var(--foreground))"
                }} 
              />
              <Tooltip
                content={<CustomBarTooltip />}
                cursor={{ 
                  fill: 'hsl(var(--accent))',
                  opacity: 0.1
                }}
              />
              <Bar 
                dataKey="score" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                animationBegin={0}
                animationDuration={1000}
              />
            </BarChart>
          ) : (
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
              />
              {chartData.map((item, index) => (
                <Radar
                  key={item.name}
                  name={item.name}
                  dataKey={item.name}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  animationBegin={index * 200}
                  animationDuration={1000}
                />
              ))}
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
