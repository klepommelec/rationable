import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IResult, IFollowUpQuestion } from '@/types/decision';
import { generateFollowUpQuestions } from '@/services/followUpQuestionService';
import { generateQuickAnswer } from '@/services/quickAnswerService';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FollowUpQuestionsProps {
  dilemma: string;
  result: IResult;
  category?: string;
  onQuestionSelect?: (enrichedDilemma: string) => void;
  isLoading?: boolean;
}

interface QuestionWithAnswer extends IFollowUpQuestion {
  answer?: string;
  isLoadingAnswer?: boolean;
  isOpen?: boolean;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  dilemma,
  result,
  category,
  onQuestionSelect,
  isLoading = false
}) => {
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (result.followUpQuestions && result.followUpQuestions.length > 0) {
        setQuestions(result.followUpQuestions.map(q => ({ ...q, isOpen: false })));
        return;
      }

      setLoadingQuestions(true);
      try {
        const generatedQuestions = await generateFollowUpQuestions({
          dilemma,
          result,
          category
        });
        setQuestions(generatedQuestions.map(q => ({ ...q, isOpen: false })));
      } catch (error) {
        console.error('Error loading follow-up questions:', error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [dilemma, result, category]);

  const handleQuestionClick = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Toggle open state
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, isOpen: !q.isOpen, isLoadingAnswer: !q.isOpen && !q.answer }
        : q
    ));

    // Generate answer if not already available and opening
    if (!question.answer && !question.isOpen) {
      try {
        const answer = await generateQuickAnswer({
          question,
          originalDilemma: dilemma,
          result
        });
        
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, answer, isLoadingAnswer: false }
            : q
        ));
      } catch (error) {
        console.error('Error generating quick answer:', error);
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, isLoadingAnswer: false, answer: "Désolé, impossible de générer une réponse pour cette question." }
            : q
        ));
      }
    }
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
          Cliquez sur une question pour obtenir des conseils pratiques
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((question) => (
          <Collapsible key={question.id} open={question.isOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left h-auto p-4 hover:bg-muted/50"
                onClick={() => handleQuestionClick(question.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-sm">
                      {question.text}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                      {getCategoryLabel(question.category)}
                    </span>
                  </div>
                  {question.isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-accordion-down">
              <div className="px-4 py-3 bg-muted/30 rounded-lg mt-2">
                {question.isLoadingAnswer ? (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Génération de la réponse...</span>
                  </div>
                ) : question.answer ? (
                  <p className="text-sm text-muted-foreground">
                    {question.answer}
                  </p>
                ) : null}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default FollowUpQuestions;