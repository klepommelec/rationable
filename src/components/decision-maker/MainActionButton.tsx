
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoaderCircle, Sparkles, MessageCircle } from 'lucide-react';

interface MainActionButtonProps {
    analysisStep: 'idle' | 'analyzing' | 'done';
    handleStartAnalysis: () => void;
    handleStartConversation: () => void;
    isMainButtonDisabled: boolean;
    progress: number;
    progressMessage: string;
}

const MainActionButton: React.FC<MainActionButtonProps> = ({
    analysisStep,
    handleStartAnalysis,
    handleStartConversation,
    isMainButtonDisabled,
    progress,
    progressMessage
}) => {
    switch (analysisStep) {
        case 'analyzing':
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
                <div className="w-full space-y-3">
                    <Button onClick={handleStartConversation} disabled={isMainButtonDisabled} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Mode Conversation
                    </Button>
                    <Button onClick={handleStartAnalysis} disabled={isMainButtonDisabled} className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Analyse Rapide
                    </Button>
                </div>
            );
    }
};

export default MainActionButton;
