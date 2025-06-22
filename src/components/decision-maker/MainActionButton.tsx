
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoaderCircle } from 'lucide-react';

interface MainActionButtonProps {
    analysisStep: 'idle' | 'loading-criteria' | 'criteria-loaded' | 'loading-options' | 'done';
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
        case 'loading-criteria':
        case 'loading-options':
            return (
                <div className="w-full space-y-2">
                    <Button disabled className="w-full bg-cyan-500 text-slate-900 font-bold text-lg py-6">
                        <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                        {progressMessage || 'Analyse en cours...'}
                    </Button>
                    <Progress value={progress} className="w-full h-2" />
                </div>
            );
        case 'criteria-loaded':
        case 'done':
        case 'idle':
        default:
            return null;
    }
};

export default MainActionButton;
