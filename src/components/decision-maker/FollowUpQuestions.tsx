import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IResult, IFollowUpQuestion } from '@/types/decision';
import { generateFollowUpQuestions } from '@/services/followUpQuestionService';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FollowUpQuestionsProps {
  dilemma: string;
  result: IResult;
  category?: string;
  onQuestionSelect?: (enrichedDilemma: string, questionText?: string) => void;
  isLoading?: boolean;
}

// Interface simplifiée pour les questions
interface QuestionItem extends IFollowUpQuestion {
  // Plus besoin de answer, isLoadingAnswer, isOpen
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  dilemma,
  result,
  category,
  onQuestionSelect,
  isLoading = false
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (result.followUpQuestions && result.followUpQuestions.length > 0) {
        setQuestions(result.followUpQuestions);
        return;
      }

      setLoadingQuestions(true);
      try {
        const generatedQuestions = await generateFollowUpQuestions({
          dilemma,
          result,
          category
        });
        setQuestions(generatedQuestions);
      } catch (error) {
        console.error('Error loading follow-up questions:', error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [dilemma, result, category]);

  const handleQuestionClick = (questionId: string) => {
    if (isLoading || loadingQuestions) {
      console.log('⏳ Click ignored: analysis in progress');
      return;
    }
    const question = questions.find(q => q.id === questionId);
    if (!question || !onQuestionSelect) return;

    console.log('🔄 Follow-up question clicked:', question.text);
    onQuestionSelect(question.text, question.text);
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      next_steps: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      practical_info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      alternatives: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      optimization: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      preparation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getCategoryLabel = (category: string): string => {
    const labelMap: Record<string, string> = {
      next_steps: 'Étapes suivantes',
      practical_info: 'Infos pratiques',
      alternatives: 'Alternatives',
      optimization: 'Optimisation',
      preparation: 'Préparation'
    };
    return labelMap[category] || 'Autre';
  };

  if (loadingQuestions) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Questions de suivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Génération de questions personnalisées...</span>
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
          Questions de suivi
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Cliquez sur une question pour lancer une nouvelle analyse complète
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((question) => (
          <Button
            key={question.id}
            variant="outline"
            className="w-full justify-start text-left h-auto p-4 hover:bg-muted/50 transition-colors"
            onClick={() => handleQuestionClick(question.id)}
            disabled={isLoading || loadingQuestions}
            aria-disabled={isLoading || loadingQuestions}
          >
            <div className="flex items-center space-x-3 w-full">
              <span className="font-medium text-sm flex-1">
                {question.text}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                {getCategoryLabel(question.category)}
              </span>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default FollowUpQuestions;