
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Users } from 'lucide-react';
import DilemmaSetup from './decision-maker/DilemmaSetup';
import { CriteriaManager } from './CriteriaManager';
import MainActionButton from './decision-maker/MainActionButton';
import AnalysisResult from './decision-maker/AnalysisResult';
import { DecisionHistory } from './DecisionHistory';
import CommunityTemplatesTab from './CommunityTemplatesTab';
import { ExportMenu } from './ExportMenu';
import ShareAsTemplateDialog from './ShareAsTemplateDialog';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import { useDecisionHistory } from '@/hooks/useDecisionHistory';
import { generateOptions } from '@/services/decisionService';
import ManualOptionsGenerator from './ManualOptionsGenerator';
import { OptionsLoadingSkeleton } from './OptionsLoadingSkeleton';
import { IDecision, ICriterion } from '@/types/decision';

const DecisionMaker = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [showManualOptions, setShowManualOptions] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  
  const {
    dilemma,
    setDilemma,
    criteria,
    setCriteria,
    result,
    emoji,
    setEmoji,
    clearSession,
    getCurrentDecision,
    loadDecision,
    analysisStep,
    isLoading,
    handleStartAnalysis,
    progress,
    progressMessage,
    templates,
    applyTemplate,
    isUpdating
  } = useDecisionMaker();

  const { history, addDecision, updateDecision, updateDecisionCategory, deleteDecision, clearHistory } = useDecisionHistory();

  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);

  // Auto-save current decision to history when result is available
  useEffect(() => {
    if (result && dilemma && emoji) {
      const decisionId = `decision_${Date.now()}`;
      const decision: IDecision = {
        id: decisionId,
        timestamp: Date.now(),
        dilemma,
        emoji,
        criteria,
        result,
        tags: [],
        category: undefined
      };
      addDecision(decision);
    }
  }, [result, dilemma, emoji, criteria, addDecision]);

  const handleDilemmaSubmit = async () => {
    if (!dilemma.trim() || criteria.length === 0) return;

    try {
      setIsGeneratingOptions(true);
      const analysisResult = await generateOptions(dilemma, criteria);
      // Extract options from the breakdown in the result
      const extractedOptions = analysisResult.breakdown?.map(item => item.option) || [];
      setOptions(extractedOptions);
      setIsGeneratingOptions(false);
    } catch (error) {
      setIsGeneratingOptions(false);
      console.error('Error generating options:', error);
      setShowManualOptions(true);
    }
  };

  const handleAnalysis = async () => {
    if (!dilemma.trim() || criteria.length === 0 || options.length === 0) return;
    await handleStartAnalysis();
  };

  const addCriterion = (newCriterion: ICriterion) => {
    setCriteria([...criteria, newCriterion]);
  };

  const deleteCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<ICriterion>) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleLoadDecision = (decisionId: string) => {
    console.log('DecisionMaker - handleLoadDecision called with:', decisionId);
    const decision = history.find(d => d.id === decisionId);
    if (decision) {
      console.log('DecisionMaker - Loading decision:', decision);
      loadDecision(decisionId);
      setShowHistory(false);
    } else {
      console.error('DecisionMaker - Decision not found:', decisionId);
    }
  };

  const canProceed = dilemma.trim() && criteria.length > 0;
  const hasOptions = options.length > 0;
  const canAnalyze = hasOptions && !isLoading;

  // Current state detection
  const currentDecision = getCurrentDecision();
  const showingResult = !!result;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Assistant de Décision IA
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Analysez vos dilemmes avec l'intelligence artificielle pour prendre des décisions éclairées
        </p>
      </div>

      {/* Main Decision Making Interface */}
      {!showingResult && (
        <>
          <DilemmaSetup
            dilemma={dilemma}
            setDilemma={setDilemma}
            analysisStep={analysisStep}
            isLoading={isLoading}
            isUpdating={isUpdating}
            applyTemplate={applyTemplate}
            clearSession={clearSession}
            history={history}
            loadDecision={handleLoadDecision}
            deleteDecision={deleteDecision}
            clearHistory={clearHistory}
            handleStartAnalysis={handleDilemmaSubmit}
            progress={progress}
            progressMessage={progressMessage}
            templates={templates}
            selectedCategory={undefined}
            onCategoryChange={() => {}}
            onUpdateCategory={updateDecisionCategory}
          />

          {dilemma.trim() && (
            <CriteriaManager
              criteria={criteria}
              setCriteria={setCriteria}
              isInteractionDisabled={isLoading}
            />
          )}

          {canProceed && !hasOptions && !isGeneratingOptions && (
            <div className="flex justify-center">
              <MainActionButton
                analysisStep={analysisStep}
                handleStartAnalysis={handleDilemmaSubmit}
                isMainButtonDisabled={!canProceed}
                progress={progress}
                progressMessage={progressMessage}
              />
            </div>
          )}

          {isGeneratingOptions && <OptionsLoadingSkeleton />}

          {hasOptions && !showingResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Options générées
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowManualOptions(true)}
                    >
                      Modifier les options
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {options.map((option, index) => (
                    <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                      <span className="font-medium">Option {index + 1}:</span> {option}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <MainActionButton
                    analysisStep={analysisStep}
                    handleStartAnalysis={handleAnalysis}
                    isMainButtonDisabled={!canAnalyze}
                    progress={progress}
                    progressMessage={progressMessage}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Analysis Result */}
      {showingResult && result && (
        <AnalysisResult
          result={result}
          isUpdating={isLoading}
          clearSession={clearSession}
          analysisStep={analysisStep}
          currentDecision={currentDecision}
          dilemma={dilemma}
        />
      )}

      {/* History and Templates Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Ressources</h2>
          <div className="flex gap-2">
            {history.length > 0 && (
              <ExportMenu decisions={history} />
            )}
            {currentDecision && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
              >
                Partager comme template
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="history" className="w-full">
              <div className="border-b px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historique des décisions
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Templates communautaires
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="history" className="px-6 pb-6">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
                    <p className="text-muted-foreground">
                      Vos décisions analysées apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <DecisionHistory
                    history={history}
                    onLoad={handleLoadDecision}
                    onDelete={deleteDecision}
                    onClear={clearHistory}
                    onClose={() => setShowHistory(false)}
                    onUpdateCategory={updateDecisionCategory}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="templates" className="px-6 pb-6">
                <CommunityTemplatesTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Manual Options Dialog */}
      <Dialog open={showManualOptions} onOpenChange={setShowManualOptions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier les options</DialogTitle>
          </DialogHeader>
          <ManualOptionsGenerator
            onGenerateOptions={handleDilemmaSubmit}
            isLoading={isGeneratingOptions}
            hasChanges={false}
          />
        </DialogContent>
      </Dialog>

      {/* Share as Template Dialog */}
      <ShareAsTemplateDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        decision={currentDecision}
      />
    </div>
  );
};

export default DecisionMaker;
