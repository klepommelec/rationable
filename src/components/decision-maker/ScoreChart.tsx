
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IBreakdownItem } from '@/types/decision';

interface ScoreChartProps {
  data: IBreakdownItem[];
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.option,
    score: item.score,
  })).sort((a, b) => b.score - a.score);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Visualisation des Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
              cursor={{ fill: 'hsl(var(--accent))' }}
              contentStyle={{
                background: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--popover-foreground))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Bar 
              dataKey="score" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
