
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { IBreakdownItem, IResult } from '@/types/decision';
import { useIntelligentConfidence } from '@/hooks/useIntelligentConfidence';

interface ConfidenceIndicatorProps {
  breakdown: IBreakdownItem[];
  topOption: IBreakdownItem;
  result?: IResult;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  breakdown,
  topOption,
  result
}) => {
  // Pour les questions factuelles, ne plus afficher de score
  const isFactual = result?.resultType === 'factual';

  // Ne plus afficher de score du tout
  return null;
};
