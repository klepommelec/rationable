
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IBreakdownItem } from '@/types/decision';
import { DecisionImage } from './DecisionImage';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ breakdown, dilemma }) => {
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Option</TableHead>
            <TableHead className="font-semibold">Image</TableHead>
            <TableHead className="font-semibold">Score</TableHead>
            <TableHead className="font-semibold">Points forts</TableHead>
            <TableHead className="font-semibold">Points faibles</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdown.map((item, index) => (
            <TableRow key={index} className="border-b">
              <TableCell className="font-medium max-w-xs">
                <div className="break-words">
                  {item.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                </div>
              </TableCell>
              <TableCell>
                <DecisionImage 
                  imageQuery={`${item.option} product`}
                  alt={`Image pour ${item.option}`}
                  size="small"
                  option={item.option}
                  dilemma={dilemma}
                  index={index}
                />
              </TableCell>
              <TableCell>
                <Badge className={getScoreBadgeColor(item.score)}>
                  {item.score}/100
                </Badge>
              </TableCell>
              <TableCell className="max-w-sm">
                <ul className="text-sm space-y-1">
                  {item.pros.slice(0, 3).map((pro, i) => (
                    <li key={i} className="text-green-700">• {pro}</li>
                  ))}
                  {item.pros.length > 3 && (
                    <li className="text-xs text-muted-foreground">+{item.pros.length - 3} autre(s)</li>
                  )}
                </ul>
              </TableCell>
              <TableCell className="max-w-sm">
                <ul className="text-sm space-y-1">
                  {item.cons.slice(0, 3).map((con, i) => (
                    <li key={i} className="text-red-700">• {con}</li>
                  ))}
                  {item.cons.length > 3 && (
                    <li className="text-xs text-muted-foreground">+{item.cons.length - 3} autre(s)</li>
                  )}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
