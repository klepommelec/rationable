import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IBreakdownItem } from '@/types/decision';
import { AdvancedComparisonTable } from './AdvancedComparisonTable';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  breakdown,
  dilemma
}) => {
  // Use the new advanced comparison table
  return <AdvancedComparisonTable breakdown={breakdown} dilemma={dilemma} />;
};
