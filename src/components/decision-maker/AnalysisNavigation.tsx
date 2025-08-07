import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Analysis {
  id: string;
  dilemma: string;
  result: any;
  emoji: string;
  analysisStep: string;
}

interface AnalysisNavigationProps {
  analyses: Analysis[];
  currentAnalysisIndex: number;
  onNavigate: (index: number) => void;
}

const AnalysisNavigation: React.FC<AnalysisNavigationProps> = ({
  analyses,
  currentAnalysisIndex,
  onNavigate
}) => {
  if (analyses.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-6 p-3 bg-muted/30 rounded-lg animate-fade-in">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate(Math.max(0, currentAnalysisIndex - 1))}
        disabled={currentAnalysisIndex === 0}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        {analyses.map((analysis, index) => (
          <Button
            key={analysis.id}
            variant={index === currentAnalysisIndex ? "default" : "outline"}
            size="sm"
            onClick={() => onNavigate(index)}
            className="flex items-center gap-2 whitespace-nowrap min-w-fit"
          >
            <span>{analysis.emoji}</span>
            <span className="hidden sm:inline">
              Question {index + 1}
            </span>
            <span className="sm:hidden">
              {index + 1}
            </span>
          </Button>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate(Math.min(analyses.length - 1, currentAnalysisIndex + 1))}
        disabled={currentAnalysisIndex === analyses.length - 1}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Badge variant="secondary" className="ml-2">
        {currentAnalysisIndex + 1} / {analyses.length}
      </Badge>
    </div>
  );
};

export default AnalysisNavigation;