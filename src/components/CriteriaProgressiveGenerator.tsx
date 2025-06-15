
import React, { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ICriterion } from '@/types/decision';

interface CriteriaProgressiveGeneratorProps {
  criteria: string[];
  onValidationComplete: (validatedCriteria: ICriterion[]) => void;
  validationTimeLimit?: number; // en secondes
}

export const CriteriaProgressiveGenerator = ({ 
  criteria, 
  onValidationComplete, 
  validationTimeLimit = 20 
}: CriteriaProgressiveGeneratorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validatedCriteria, setValidatedCriteria] = useState<ICriterion[]>([]);
  const [rejectedCriteria, setRejectedCriteria] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(validationTimeLimit);
  const [phase, setPhase] = useState<'generating' | 'validating' | 'done'>('generating');

  // Animation progressive des critères
  useEffect(() => {
    if (phase === 'generating' && currentIndex < criteria.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (phase === 'generating' && currentIndex >= criteria.length) {
      setPhase('validating');
    }
  }, [currentIndex, criteria.length, phase]);

  // Timer de validation
  useEffect(() => {
    if (phase === 'validating' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'validating' && timeLeft === 0) {
      handleAutoValidation();
    }
  }, [timeLeft, phase]);

  const handleValidate = (criterionName: string) => {
    const newCriterion: ICriterion = {
      id: crypto.randomUUID(),
      name: criterionName
    };
    setValidatedCriteria(prev => [...prev, newCriterion]);
  };

  const handleReject = (criterionName: string) => {
    setRejectedCriteria(prev => [...prev, criterionName]);
  };

  const handleAutoValidation = () => {
    // Auto-valider tous les critères non traités
    const untreatedCriteria = criteria.filter(
      criterion => !validatedCriteria.some(v => v.name === criterion) && 
                   !rejectedCriteria.includes(criterion)
    );
    
    const autoValidated = untreatedCriteria.map(name => ({
      id: crypto.randomUUID(),
      name
    }));

    const finalValidated = [...validatedCriteria, ...autoValidated];
    
    // S'assurer d'avoir au moins 2 critères
    if (finalValidated.length < 2 && rejectedCriteria.length > 0) {
      const rescued = rejectedCriteria.slice(0, 2 - finalValidated.length).map(name => ({
        id: crypto.randomUUID(),
        name
      }));
      finalValidated.push(...rescued);
    }

    setPhase('done');
    onValidationComplete(finalValidated);
  };

  const handleValidateAll = () => {
    const allValidated = criteria.map(name => ({
      id: crypto.randomUUID(),
      name
    }));
    setPhase('done');
    onValidationComplete(allValidated);
  };

  const progressPercentage = ((validationTimeLimit - timeLeft) / validationTimeLimit) * 100;

  if (phase === 'generating') {
    return (
      <div className="space-y-4 p-6 rounded-lg bg-accent border animate-fade-in">
        <h3 className="font-semibold text-lg">🧠 L'IA génère les critères de décision...</h3>
        <div className="space-y-3">
          {criteria.slice(0, currentIndex).map((criterion, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 rounded-md bg-background animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{criterion}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'validating') {
    return (
      <div className="space-y-4 p-6 rounded-lg bg-accent border animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">✋ Validez vos critères</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s restantes</span>
          </div>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
        
        <p className="text-sm text-muted-foreground">
          Validez ou rejetez chaque critère. Les critères non traités seront automatiquement validés.
        </p>

        <div className="space-y-3">
          {criteria.map((criterion, index) => {
            const isValidated = validatedCriteria.some(v => v.name === criterion);
            const isRejected = rejectedCriteria.includes(criterion);
            const isProcessed = isValidated || isRejected;

            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-md transition-all ${
                  isValidated ? 'bg-green-50 border-green-200' :
                  isRejected ? 'bg-red-50 border-red-200' :
                  'bg-background border'
                }`}
              >
                <span className={`font-medium ${
                  isValidated ? 'text-green-700' :
                  isRejected ? 'text-red-700 line-through' :
                  'text-foreground'
                }`}>
                  {criterion}
                </span>
                
                {!isProcessed && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleValidate(criterion)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleReject(criterion)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {isValidated && (
                  <div className="text-green-600">
                    <Check className="h-5 w-5" />
                  </div>
                )}
                
                {isRejected && (
                  <div className="text-red-600">
                    <X className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleValidateAll}>
            Valider tout ({criteria.length})
          </Button>
          <Button onClick={handleAutoValidation}>
            Continuer ({validatedCriteria.length} validés)
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
