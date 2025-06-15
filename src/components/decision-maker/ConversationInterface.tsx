
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { IConversationQuestion, IConversationAnswer } from '@/types/conversation';

interface ConversationInterfaceProps {
  questions: IConversationQuestion[];
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  questions,
  onComplete,
  onBack,
  isLoading
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (currentQuestion) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim() && currentQuestion.required) return;

    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (isLastQuestion) {
      onComplete(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(answers[questions[currentQuestionIndex - 1].id] || '');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnswerSubmit();
    }
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder || "Votre réponse..."}
            className="min-h-[100px] resize-none"
            onKeyPress={handleKeyPress}
            autoFocus
          />
        );
      
      case 'choice':
        return (
          <div className="space-y-2">
            {currentQuestion.choices?.map((choice, index) => (
              <Button
                key={index}
                variant={currentAnswer === choice ? "default" : "outline"}
                className="w-full justify-start text-left"
                onClick={() => setCurrentAnswer(choice)}
              >
                {choice}
              </Button>
            ))}
          </div>
        );
      
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentQuestion.min}</span>
              <span>{currentQuestion.max}</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: (currentQuestion.max || 5) - (currentQuestion.min || 1) + 1 }, (_, i) => {
                const value = (currentQuestion.min || 1) + i;
                return (
                  <Button
                    key={value}
                    variant={currentAnswer === value.toString() ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setCurrentAnswer(value.toString())}
                  >
                    {value}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      
      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder || "Votre réponse..."}
            onKeyPress={handleKeyPress}
            autoFocus
          />
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Préparation des questions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Questions de clarification
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Messages précédents */}
          {currentQuestionIndex > 0 && (
            <div className="space-y-3 pb-4 border-b">
              {questions.slice(0, currentQuestionIndex).map((q, index) => (
                <div key={q.id} className="space-y-2">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  <div className="bg-secondary p-3 rounded-lg ml-8">
                    <p className="text-sm">{answers[q.id]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Question actuelle */}
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  {isTyping ? (
                    <div className="flex items-center gap-1">
                      <span>L'IA réfléchit</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium">{currentQuestion.question}</p>
                  )}
                </div>
              </div>
            </div>

            {!isTyping && (
              <div className="space-y-4">
                {renderQuestionInput()}
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={currentQuestionIndex === 0 ? onBack : handlePrevious}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {currentQuestionIndex === 0 ? 'Retour' : 'Précédent'}
                  </Button>
                  
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!currentAnswer.trim() && currentQuestion.required}
                    className="flex items-center gap-2"
                  >
                    {isLastQuestion ? 'Analyser' : 'Suivant'}
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationInterface;
