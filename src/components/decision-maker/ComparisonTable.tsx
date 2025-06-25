
import React from 'react';
import { IBreakdownItem } from '@/types/decision';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  breakdown,
  dilemma
}) => {
  // This component is no longer needed as we removed the detailed comparison
  return null;
};
