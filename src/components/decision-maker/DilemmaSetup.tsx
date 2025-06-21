
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { DecisionHistory } from '../DecisionHistory';
import { AnimatedPlaceholder } from '../AnimatedPlaceholder';
import MainActionButton from './MainActionButton';
import { IDecision } from '@/types/decision';

interface DilemmaSetupProps {
    dilemma: string;
    setDilemma: (dilemma: string) => void;
    analysisStep: 'idle' | 'loading-criteria' | 'criteria-loaded' | 'loading-options' | 'done';
    isLoading: boolean;
    isUpdating: boolean;
    applyTemplate: (template: any) => void;
    clearSession: () => void;
    history: IDecision[];
    loadDecision: (id: string) => void;
    deleteDecision: (id: string) => void;
    clearHistory: () => void;
    handleStartAnalysis: () => void;
    progress: number;
    progressMessage: string;
    templates: { name: string; dilemma: string; }[];
    selectedCategory?: string;
    onCategoryChange: (categoryId: string | undefined) => void;
    onUpdateCategory: (decisionId: string, categoryId: string | undefined) => void;
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
  progress,
  progressMessage,
  templates,
  selectedCategory,
  onCategoryChange,
  onUpdateCategory
}) => {
    // Afficher seulement les 3 premiers modèles
    const displayedTemplates = templates.slice(0, 3);

    // Placeholders animés pour le textarea
    const placeholders = [
        "Ex: Quel framework JS devrais-je apprendre en 2025 ?",
        "Ex: Dois-je changer de carrière professionnelle ?",
        "Ex: Quelle ville choisir pour mes études ?",
        "Ex: Investir en bourse ou dans l'immobilier ?",
        "Ex: Partir en voyage ou économiser de l'argent ?",
        "Ex: Accepter cette offre d'emploi ou continuer à chercher ?"
    ];

    const handleTemplateClick = (template: { name: string; dilemma: string; }) => {
        console.log('Template clicked:', template);
        setDilemma(template.dilemma);
        applyTemplate(template);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card className="backdrop-blur-sm relative">
                <div className="absolute top-4 right-4 z-10">
                    <ThemeToggle />
                </div>
                <CardHeader className="text-center pt-12 px-4 sm:px-6">
                    <div className="flex justify-center items-center mb-4">
                        <BrainCircuit 
                            className="h-10 w-10 sm:h-12 sm:w-12 text-cyan-400" 
                            aria-hidden="true"
                        />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400">
                        Assistant de Décision IA
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm sm:text-base">
                        Posez votre dilemme, et laissez l'IA vous éclairer.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                    <div className="space-y-2">
                        <label 
                            htmlFor="dilemma-input"
                            className="font-medium text-sm sm:text-base"
                        >
                            Votre dilemme
                        </label>
                        <div className="relative">
                            <Textarea
                                id="dilemma-input"
                                placeholder=""
                                value={dilemma}
                                onChange={(e) => setDilemma(e.target.value)}
                                className="focus:ring-cyan-500 text-base md:text-sm min-h-[100px] resize-none"
                                disabled={isLoading || isUpdating || analysisStep === 'done'}
                                rows={3}
                                aria-describedby="dilemma-help"
                                aria-invalid={dilemma.trim() === '' ? 'true' : 'false'}
                            />
                            {dilemma === '' && (
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <span className="text-muted-foreground text-base md:text-sm">
                                        <AnimatedPlaceholder 
                                            placeholders={placeholders}
                                            interval={2500}
                                        />
                                    </span>
                                </div>
                            )}
                        </div>
                        <p id="dilemma-help" className="sr-only">
                            Décrivez le problème ou la décision que vous devez prendre
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="font-medium text-sm sm:text-base">
                            Ou utilisez un modèle
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {displayedTemplates.map(template => (
                                <Button 
                                    key={template.name} 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleTemplateClick(template)} 
                                    disabled={isLoading || isUpdating || analysisStep !== 'idle'}
                                    className="text-xs sm:text-sm justify-start h-auto py-3 px-3 whitespace-normal text-left"
                                    aria-label={`Utiliser le modèle: ${template.name}`}
                                >
                                    <span className="truncate">{template.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
                    <MainActionButton
                        analysisStep={analysisStep}
                        handleStartAnalysis={handleStartAnalysis}
                        isMainButtonDisabled={dilemma.trim() === '' || isLoading}
                        progress={progress}
                        progressMessage={progressMessage}
                    />
                </CardFooter>
            </Card>

            {/* Historique intégré directement dans la page */}
            <Card className="backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold">Historique des décisions</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Chargez ou supprimez vos analyses passées.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <DecisionHistory 
                        history={history}
                        onLoad={loadDecision}
                        onDelete={deleteDecision}
                        onClear={clearHistory}
                        onClose={() => {}}
                        onUpdateCategory={onUpdateCategory}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default DilemmaSetup;
