
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoaderCircle, Sparkles } from 'lucide-react';
import { AnalysisStep } from '@/types/decision';

interface MainActionButtonProps {
    analysisStep: AnalysisStep;
    handleStartAnalysis: () => void;
    isMainButtonDisabled: boolean;
    progress: number;
    progressMessage: string;
}

const MainActionButton: React.FC<MainActionButtonProps> = ({
    analysisStep,
    handleStartAnalysis,
    isMainButtonDisabled,
    progress,
    progressMessage
}) => {
    switch (analysisStep) {
        case 'generating-criteria':
        case 'validating-criteria':
        case 'final-analysis':
            return (
                <div className="w-full space-y-2">
                    <Button disabled className="w-full bg-cyan-500 text-slate-900 font-bold text-lg py-6">
                        <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                        {progressMessage || 'Analyse en cours...'}
                    </Button>
                    <Progress value={progress} className="w-full h-2" />
                </div>
            );
        case 'done':
            return null;
        case 'idle':
        default:
            return (
                <Button onClick={handleStartAnalysis} disabled={isMainButtonDisabled} className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Lancer l'analyse
                </Button>
            );
    }
};

export default MainActionButton;
