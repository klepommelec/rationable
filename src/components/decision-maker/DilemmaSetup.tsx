
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoaderCircle, Sparkles, Clock, History, FileText, Upload } from 'lucide-react';
import { IDecision } from '@/types/decision';
import { CategorySelector } from '@/components/CategorySelector';
import { DecisionHistory } from '@/components/DecisionHistory';
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { AnalysisStep } from '@/hooks/useDecisionState';

interface DilemmaSetupProps {
  dilemma: string;
  setDilemma: (dilemma: string) => void;
  analysisStep: AnalysisStep;
  isLoading: boolean;
  isUpdating: boolean;
  applyTemplate: (template: any) => void;
  clearSession: () => void;
  history: IDecision[];
  loadDecision: (decision: IDecision) => void;
  deleteDecision: (id: string) => void;
  clearHistory: () => void;
  handleStartAnalysis: () => void;
  progress: number;
  progressMessage: string;
  templates: any[];
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
  onUpdateCategory: (category: string | undefined) => void;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
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
  onUpdateCategory,
  uploadedFiles,
  setUploadedFiles
}) => {
  const isMainButtonDisabled = !dilemma.trim() || isLoading || isUpdating;
  const isAnalysisInProgress = analysisStep === 'loading-criteria' || analysisStep === 'loading-options';

  const handleAnalysisClick = () => {
    if (!isMainButtonDisabled) {
      console.log("🚀 Starting analysis with immediate feedback");
      handleStartAnalysis();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête principal */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Assistant de Décision IA
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Décrivez votre dilemme et laissez l'IA analyser vos options avec des données en temps réel
        </p>
      </div>

      {/* Formulaire principal */}
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Décrivez votre dilemme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: Je dois choisir entre plusieurs offres d'emploi, quelle voiture acheter, où partir en vacances..."
            value={dilemma}
            onChange={(e) => setDilemma(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={2000}
            disabled={isAnalysisInProgress}
          />
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{dilemma.length}/2000 caractères</span>
            {uploadedFiles.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Upload de fichiers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4" />
              Documents optionnels (PDF, images, etc.)
            </div>
            <FileUpload
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              disabled={isAnalysisInProgress}
            />
          </div>

          {/* Sélecteur de catégorie */}
          <div className="space-y-2">
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              disabled={isAnalysisInProgress}
            />
          </div>

          {/* Bouton principal avec feedback amélioré */}
          <div className="pt-4">
            {isAnalysisInProgress ? (
              <div className="space-y-3">
                <Button disabled className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg py-6">
                  <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                  {progressMessage || 'Analyse en cours...'}
                </Button>
                <div className="space-y-2">
                  <Progress value={progress || 50} className="w-full h-2" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Optimisation en cours - Performance améliorée</span>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleAnalysisClick}
                disabled={isMainButtonDisabled}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg py-6 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Analyser mon dilemme
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historique des décisions */}
      {history.length > 0 && (
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              Historique des décisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DecisionHistory
              history={history}
              onLoadDecision={loadDecision}
              onDeleteDecision={deleteDecision}
              onClearHistory={clearHistory}
              onUpdateCategory={onUpdateCategory}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DilemmaSetup;
