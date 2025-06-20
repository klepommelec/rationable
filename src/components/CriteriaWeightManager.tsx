
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Scale, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ICriterion } from '@/types/decision';
import { toast } from 'sonner';

interface CriteriaWeightManagerProps {
  criteria: ICriterion[];
  onWeightChange: (criteriaId: string, weight: number) => void;
  onResetWeights: () => void;
  isDisabled?: boolean;
}

export const CriteriaWeightManager: React.FC<CriteriaWeightManagerProps> = ({
  criteria,
  onWeightChange,
  onResetWeights,
  isDisabled = false
}) => {
  const getWeightLabel = (weight: number) => {
    switch (weight) {
      case 1: return { label: "Très faible", color: "bg-red-100 text-red-800" };
      case 2: return { label: "Faible", color: "bg-orange-100 text-orange-800" };
      case 3: return { label: "Moyen", color: "bg-yellow-100 text-yellow-800" };
      case 4: return { label: "Important", color: "bg-blue-100 text-blue-800" };
      case 5: return { label: "Très important", color: "bg-green-100 text-green-800" };
      default: return { label: "Moyen", color: "bg-yellow-100 text-yellow-800" };
    }
  };

  const hasCustomWeights = criteria.some(c => c.weight !== 3);

  const handleWeightChange = (criteriaId: string, newWeight: number[]) => {
    const weight = newWeight[0];
    onWeightChange(criteriaId, weight);
  };

  const handleResetWeights = () => {
    onResetWeights();
    toast.success("Poids des critères réinitialisés");
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Personnaliser l'importance des critères
          </CardTitle>
          {hasCustomWeights && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetWeights}
              disabled={isDisabled}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <p className="text-sm text-blue-900 flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
            Ajustez l'importance de chaque critère. Les critères plus importants auront plus d'influence sur la recommandation finale.
          </p>
        </div>

        <div className="space-y-4">
          {criteria.map((criterion, index) => {
            const weightInfo = getWeightLabel(criterion.weight);
            return (
              <div key={criterion.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {criterion.name || `Critère ${index + 1}`}
                  </label>
                  <Badge className={weightInfo.color}>
                    {weightInfo.label}
                  </Badge>
                </div>
                <div className="px-2">
                  <Slider
                    value={[criterion.weight]}
                    onValueChange={(value) => handleWeightChange(criterion.id, value)}
                    min={1}
                    max={5}
                    step={1}
                    disabled={isDisabled}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Peu important</span>
                    <span>Très important</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasCustomWeights && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              💡 Vos préférences personnalisées sont appliquées. Les résultats reflètent maintenant l'importance que vous accordez à chaque critère.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
