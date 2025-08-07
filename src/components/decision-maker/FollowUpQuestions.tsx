import React, { useState, useEffect } from 'react';
import { IResult, IFollowUpQuestion } from '@/types/decision';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircleQuestion, ArrowRight, Sparkles } from 'lucide-react';
import { generateFollowUpQuestions, handleFollowUpQuestion } from '@/services/followUpQuestionService';

interface FollowUpQuestionsProps {
  dilemma: string;
  result: IResult;
  category?: string;
  onQuestionSelect: (enrichedDilemma: string) => void;
  isLoading?: boolean;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  dilemma,
  result,
  category,
  onQuestionSelect,
  isLoading = false
}) => {
  const [questions, setQuestions] = useState<IFollowUpQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      // Vérifier s'il y a déjà des questions dans le résultat
      if (result.followUpQuestions && result.followUpQuestions.length > 0) {
        setQuestions(result.followUpQuestions);
        return;
      }

      // Générer de nouvelles questions
      setLoadingQuestions(true);
      try {
        const generatedQuestions = await generateFollowUpQuestions({
          dilemma,
          result,
          category
        });
        setQuestions(generatedQuestions);
      } catch (error) {
        console.error('Erreur lors du chargement des questions de suivi:', error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [dilemma, result, category]);

  const handleQuestionClick = async (question: IFollowUpQuestion) => {
    setSelectedQuestionId(question.id);
    
    try {
      const enrichedDilemma = await handleFollowUpQuestion(question, dilemma, result);
      onQuestionSelect(enrichedDilemma);
    } catch (error) {
      console.error('Erreur lors du traitement de la question de suivi:', error);
      setSelectedQuestionId(null);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      budget: 'bg-green-500/10 text-green-700 dark:text-green-300',
      preferences: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
      context: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      requirements: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      timeline: 'bg-red-500/10 text-red-700 dark:text-red-300',
      usage: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
      validation: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      budget: 'Budget',
      preferences: 'Préférences',
      context: 'Contexte',
      requirements: 'Exigences',
      timeline: 'Délais',
      usage: 'Usage',
      validation: 'Validation'
    };
    return labels[category as keyof typeof labels] || 'Général';
  };

  if (loadingQuestions) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5" />
            Questions de suivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-spin" />
            Génération de questions personnalisées...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5" />
          Questions de suivi
          <Badge variant="outline" className="ml-auto">
            {questions.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Cliquez sur une question pour affiner votre analyse
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {questions.map((question, index) => (
            <Button
              key={question.id}
              variant="outline"
              className="h-auto p-4 justify-start text-left hover:bg-muted/50 transition-all duration-200 group"
              onClick={() => handleQuestionClick(question)}
              disabled={isLoading || selectedQuestionId === question.id}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex items-center justify-between w-full">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(question.category)}`}
                  >
                    {getCategoryLabel(question.category)}
                  </Badge>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {question.text}
                </span>
              </div>
            </Button>
          ))}
        </div>
        
        {selectedQuestionId && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-spin" />
            Analyse en cours avec votre question...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowUpQuestions;