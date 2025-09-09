import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IResult, IFollowUpQuestion } from '@/types/decision';
import { generateFollowUpQuestions } from '@/services/followUpQuestionService';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';

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
  const { t } = useI18nUI();
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


  if (loadingQuestions) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('analysis.followUpSection.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{t('analysis.followUpSection.loading')}</span>
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
          {t('analysis.followUpSection.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('analysis.followUpSection.subtitle')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((question) => (
          <Button
            key={question.id}
            variant="outline"
            className="w-full justify-start text-left p-4 hover:bg-muted/50 transition-colors"
            onClick={() => handleQuestionClick(question.id)}
            disabled={isLoading || loadingQuestions}
            aria-disabled={isLoading || loadingQuestions}
            title={question.text}
          >
            <span className="font-medium text-sm truncate">
              {question.text}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default FollowUpQuestions;