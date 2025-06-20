
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, DollarSign, Clock, Star } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ breakdown }) => {
  const sortedBreakdown = breakdown.sort((a, b) => b.score - a.score);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getBadgeForOption = (option: IBreakdownItem, index: number) => {
    const badges = [];
    
    if (index === 0) {
      badges.push(
        <Badge key="winner" variant="default" className="bg-gold text-white">
          <Trophy className="h-3 w-3 mr-1" />
          Meilleur choix
        </Badge>
      );
    }
    
    // Check for good value (high score, might have cost-related pros)
    const hasValuePros = option.pros.some(pro => 
      pro.toLowerCase().includes('prix') || 
      pro.toLowerCase().includes('abordable') ||
      pro.toLowerCase().includes('économique')
    );
    
    if (hasValuePros && option.score >= 70) {
      badges.push(
        <Badge key="value" variant="secondary" className="bg-blue-100 text-blue-800">
          <DollarSign className="h-3 w-3 mr-1" />
          Bon rapport qualité-prix
        </Badge>
      );
    }

    return badges;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison Détaillée des Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Option</TableHead>
                <TableHead className="text-center w-20">Score</TableHead>
                <TableHead>Avantages</TableHead>
                <TableHead>Inconvénients</TableHead>
                <TableHead>Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBreakdown.map((option, index) => {
                const cleanOptionName = option.option.replace(/^Option\s+\d+:\s*/i, '').trim();
                
                return (
                  <TableRow key={index} className={index === 0 ? "bg-green-50/50" : ""}>
                    <TableCell className="font-medium">
                      {cleanOptionName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getScoreColor(option.score)}>
                        {option.score}/100
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {option.pros.slice(0, 3).map((pro, i) => (
                          <li key={i} className="text-green-700">{pro}</li>
                        ))}
                        {option.pros.length > 3 && (
                          <li className="text-muted-foreground text-xs">
                            +{option.pros.length - 3} autres...
                          </li>
                        )}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {option.cons.slice(0, 3).map((con, i) => (
                          <li key={i} className="text-red-700">{con}</li>
                        ))}
                        {option.cons.length > 3 && (
                          <li className="text-muted-foreground text-xs">
                            +{option.cons.length - 3} autres...
                          </li>
                        )}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getBadgeForOption(option, index)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
