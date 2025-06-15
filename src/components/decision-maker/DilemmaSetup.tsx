import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrainCircuit, BookCopy, Eraser, History } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { DecisionHistory } from '../DecisionHistory';
import MainActionButton from './MainActionButton';
import { IDecision } from '@/types/decision';

interface DilemmaSetupProps {
    dilemma: string;
    setDilemma: (dilemma: string) => void;
    analysisStep: 'idle' | 'analyzing' | 'done';
    isLoading: boolean;
    isUpdating: boolean;
    applyTemplate: (template: any) => void;
    clearSession: () => void;
    history: IDecision[];
    loadDecision: (id: string) => void;
    deleteDecision: (id: string) => void;
    clearHistory: () => void;
    handleStartAnalysis: () => void;
    handleStartConversation: () => void;
    progress: number;
    progressMessage: string;
    templates: { name: string; dilemma: string; }[];
}

const DilemmaSetup: React.FC<DilemmaSetupProps> = ({
  dilemma,
  setDilemma,
  analysisStep,
  isLoading,
  isUpdating,
  applyTemplate,
  clearSession,
  history,
  loadDecision,
  deleteDecision,
  clearHistory,
  handleStartAnalysis,
  handleStartConversation,
  progress,
  progressMessage,
  templates
}) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <Card className="backdrop-blur-sm relative">
                <div className="absolute top-4 right-4 z-10">
                    <ThemeToggle />
                </div>
                <CardHeader className="text-center pt-12">
                    <div className="flex justify-center items-center mb-4">
                        <BrainCircuit className="h-12 w-12 text-cyan-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400">Assistant de Décision IA</CardTitle>
                    <CardDescription className="text-muted-foreground">Posez votre dilemme, et laissez l'IA vous éclairer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="font-medium">Votre dilemme</label>
                        <Textarea
                            placeholder="Ex: Quel framework JS devrais-je apprendre en 2025 ?"
                            value={dilemma}
                            onChange={(e) => setDilemma(e.target.value)}
                            className="focus:ring-cyan-500 text-base md:text-sm"
                            disabled={isLoading || isUpdating || analysisStep === 'done'}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="font-medium">Ou utilisez un modèle</label>
                            <div className="flex items-center gap-1">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <History className="h-4 w-4 mr-2" />
                                            Historique
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="bg-background w-full sm:max-w-lg p-6 flex flex-col">
                                        <SheetHeader className="pr-6">
                                            <SheetTitle>Historique des décisions</SheetTitle>
                                            <SheetDescription className="text-muted-foreground">
                                                Chargez ou supprimez vos analyses passées.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <DecisionHistory 
                                            history={history}
                                            onLoad={loadDecision}
                                            onDelete={deleteDecision}
                                            onClear={clearHistory}
                                            onClose={() => {}}
                                        />
                                    </SheetContent>
                                </Sheet>
                                <Button variant="ghost" size="sm" onClick={clearSession}>
                                    <Eraser className="h-4 w-4 mr-2" />
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {templates.map(template => (
                                <Button key={template.name} variant="outline" size="sm" onClick={() => applyTemplate(template)} disabled={isLoading || isUpdating || analysisStep !== 'idle'}>
                                    <BookCopy className="h-4 w-4 mr-2" />
                                    {template.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <MainActionButton
                        analysisStep={analysisStep}
                        handleStartAnalysis={handleStartAnalysis}
                        handleStartConversation={handleStartConversation}
                        isMainButtonDisabled={dilemma.trim() === '' || isLoading}
                        progress={progress}
                        progressMessage={progressMessage}
                    />
                </CardFooter>
            </Card>
        </div>
    );
};

export default DilemmaSetup;
