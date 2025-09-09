import React from 'react';
import { useDecisionMakerContext } from '@/contexts/DecisionMakerContext';
import { useMultiAnalysis } from '@/hooks/useMultiAnalysis';
import { detectQuestionType } from '@/services/questionClassificationService';
import { EmojiPicker } from './EmojiPicker';
import { CriteriaManager } from './CriteriaManager';
import { OptionsLoadingSkeleton } from './OptionsLoadingSkeleton';
import { CommentSection } from './comments/CommentSection';
import ManualOptionsGenerator from './ManualOptionsGenerator';
import AnalysisNavigation from './decision-maker/AnalysisNavigation';
import DilemmaSetup from './decision-maker/DilemmaSetup';
import AnalysisResult from './decision-maker/AnalysisResult';
import { EditableTitle } from './EditableTitle';
import { toast } from "sonner";
import { useI18nUI } from '@/contexts/I18nUIContext';
// Composant principal pour la prise de décision unifiée
const DecisionMaker = () => {
  const {
    t
  } = useI18nUI();
  const {
    dilemma,
    setDilemma,
    emoji,
    setEmoji,
    analysisStep,
    setAnalysisStep,
    progress,
    progressMessage,
    criteria,
    setCriteria,
    result,
    setResult,
    history,
    isUpdating,
    isLoading,
    handleStartAnalysis,
    applyTemplate,
    clearSession,
    loadDecision,
    deleteDecision,
    clearHistory,
    templates,
    hasChanges,
    handleManualUpdate,
    selectedCategory,
    setSelectedCategory,
    handleCategoryChange,
    handleUpdateCategory,
    getCurrentDecision,
    uploadedFiles,
    setUploadedFiles
  } = useDecisionMakerContext();
  const {
    analyses,
    currentAnalysisIndex,
    getCurrentAnalysis,
    addAnalysis,
    updateCurrentAnalysis,
    updateAnalysisById,
    navigateToAnalysis,
    clearAnalyses,
    setAnalysesWithIndex
  } = useMultiAnalysis();

  // Lock analysis by id for safe writes during follow-ups
  const pendingWriteAnalysisIdRef = React.useRef<string | null>(null);

  // Réinitialiser complètement l'état (analyses + session)
  const clearAll = React.useCallback(() => {
    clearAnalyses();
    clearSession();
    setAnalysisStep('idle');
  }, [clearAnalyses, clearSession, setAnalysisStep]);

  // Charger une décision depuis l'historique ET remplir le fil complet pour le breadcrumb
  const loadDecisionWithThread = (decisionId: string) => {
    try {
      pendingWriteAnalysisIdRef.current = null;
      const selected = history.find(d => d.id === decisionId);
      if (selected) {
        const key = selected.threadId || selected.id;
        const thread = history.filter(d => (d.threadId || d.id) === key).sort((a, b) => a.timestamp - b.timestamp);
        const list = thread.map(d => ({
          id: d.id,
          dilemma: d.dilemma,
          displayTitle: undefined,
          emoji: d.emoji || '🤔',
          result: d.result,
          analysisStep: 'done' as const,
          criteria: d.criteria,
          category: d.category
        }));
        const idx = thread.findIndex(d => d.id === decisionId);
        setAnalysesWithIndex(list, idx === -1 ? list.length - 1 : idx);
        console.log(`🧵 Fil chargé pour breadcrumb: ${key} (${list.length} analyses)`);
      }
    } catch (e) {
      console.error('Erreur lors du préchargement du fil pour breadcrumb:', e);
    }
    // Charger l'état principal comme avant
    loadDecision(decisionId);
  };

  // Fonction DIRECTE pour gérer les questions de suivi - SANS double analyse
  const handleFollowUpQuestion = async (questionDilemma: string, questionText?: string) => {
    console.log('🔄 Follow-up question triggered:', questionText || questionDilemma);

    // Empêcher les multi-clics pendant une analyse en cours
    if (analysisStep === 'loading-options' || isUpdating) {
      toast.info(t('decision.toasts.alreadyRunning'));
      return;
    }
    try {
      // Mettre immédiatement l'état en chargement pour une UX fluide
      setAnalysisStep('loading-options');

      // Créer et ajouter la nouvelle analyse
      const newId = crypto.randomUUID();
      const newAnalysis = {
        id: newId,
        dilemma: questionDilemma,
        displayTitle: questionText,
        emoji: '🤔',
        result: null,
        analysisStep: 'loading-options' as const,
        criteria: [],
        category: undefined
      };
      // Verrouiller les écritures sur cette analyse par ID
      pendingWriteAnalysisIdRef.current = newId;
      console.log('➕ Adding new follow-up analysis', newAnalysis);
      addAnalysis(newAnalysis);

      // Mettre à jour l'état principal
      setResult(null);
      // Ne pas vider les critères immédiatement pour éviter les disparitions visuelles
      setEmoji('🤔');

      // Reset threading ref to prevent new analysis from being incorrectly threaded
      pendingWriteAnalysisIdRef.current = newId;
      setSelectedCategory(undefined);
      setDilemma(questionDilemma);

      // Démarrer DIRECTEMENT l'analyse complète ici (laisser la classification décider)
      console.log('🚀 Starting integrated follow-up analysis...');
      await handleStartAnalysis(undefined, {
        threadFromId: getCurrentDecision()?.id,
        dilemmaOverride: questionDilemma
      });
    } catch (error) {
      console.error('❌ Error in follow-up question:', error);
      toast.error(t('decision.toasts.followup.error'));
      // Libérer le verrou en cas d'erreur
      pendingWriteAnalysisIdRef.current = null;
    }
  };

  // Fonction pour gérer les changements de titre
  const handleTitleChange = (newTitle: string) => {
    if (currentAnalysis) {
      // Mettre à jour le dilemme dans l'état principal
      setDilemma(newTitle);
      
      // Mettre à jour l'analyse courante avec le nouveau titre
      updateAnalysisById(currentAnalysis.id, {
        dilemma: newTitle,
        displayTitle: newTitle !== currentAnalysis.dilemma ? newTitle : undefined
      });
      
      // Si c'est une décision sauvegardée, la mettre à jour
      if (currentDecision) {
        const updatedDecision = {
          ...currentDecision,
          dilemma: newTitle
        };
        // Note: cette mise à jour sera gérée par l'effet de synchronisation existant
      }
      
      toast.success(t('decision.toasts.titleUpdated'));
    }
  };

  // Fonction pour gérer la navigation entre analyses
  const handleAnalysisNavigation = (analysisIndex: number) => {
    navigateToAnalysis(analysisIndex);
    const analysis = analyses[analysisIndex];
    if (analysis) {
      // SYNCHRONISATION BATCH de tous les états pour éviter les incohérences
      // Utiliser React.startTransition pour grouper toutes les mises à jour
      React.startTransition(() => {
        setDilemma(analysis.dilemma);
        setEmoji(analysis.emoji);
        setResult(analysis.result);
        setCriteria(analysis.criteria);
        setSelectedCategory(analysis.category);
        setAnalysisStep(analysis.analysisStep);

        // Plus de reclassification nécessaire - toutes les questions sont comparatives
        console.log('🔄 Navigation - Question type: comparative (unified)');
      });
    }
  };
  const currentDecision = getCurrentDecision();
  const currentAnalysis = getCurrentAnalysis();

  // Etats d'affichage gelés pour éviter les décalages lorsque l'analyse en cours concerne un autre onglet
  const lockId = pendingWriteAnalysisIdRef.current;
  const isLockedToOther = Boolean(lockId && currentAnalysis && lockId !== currentAnalysis.id);
  const displayDilemma = isLockedToOther ? currentAnalysis?.dilemma ?? dilemma : dilemma;
  const displayEmoji = isLockedToOther ? currentAnalysis?.emoji ?? emoji : emoji;
  const displayResult = isLockedToOther ? currentAnalysis?.result ?? result : result;
  const displayStep = isLockedToOther ? currentAnalysis?.analysisStep ?? analysisStep : analysisStep;
  const displayCriteria = isLockedToOther ? currentAnalysis?.criteria ?? criteria : criteria;
  const displayCategory = isLockedToOther ? currentAnalysis?.category ?? selectedCategory : selectedCategory;

  // État unifié : toutes les questions sont traitées de manière comparative
  const questionType = 'comparative';

  // Plus d'effet nécessaire - toutes les questions utilisent l'approche comparative unifiée

  // Ajouter la première analyse dès qu'elle démarre
  React.useEffect(() => {
    if (dilemma && (analysisStep === 'criteria-loaded' || analysisStep === 'loading-options' || analysisStep === 'done') && analyses.length === 0) {
      const initialAnalysis = {
        id: crypto.randomUUID(),
        dilemma,
        emoji,
        result,
        analysisStep,
        criteria,
        category: selectedCategory
      };
      addAnalysis(initialAnalysis);
    }
  }, [dilemma, analysisStep, analyses.length]);

  // Mettre à jour l'analyse actuelle quand les états changent
  React.useEffect(() => {
    if (!currentAnalysis) return;
    const lockId = pendingWriteAnalysisIdRef.current;
    // Si un verrou est actif pour une autre analyse, ne pas synchroniser pour éviter les décalages visuels
    if (lockId && lockId !== currentAnalysis.id) {
      return;
    }

    // Toujours mettre à jour uniquement l'analyse actuellement affichée
    updateAnalysisById(currentAnalysis.id, {
      dilemma,
      emoji,
      result,
      analysisStep,
      criteria,
      category: selectedCategory
    });

    // Libérer le verrou uniquement si la finalisation concerne l'analyse verrouillée
    if (analysisStep === 'done' && lockId === currentAnalysis.id) {
      pendingWriteAnalysisIdRef.current = null;
    }
  }, [dilemma, emoji, result, analysisStep, criteria, selectedCategory, currentAnalysisIndex]);

  // Note: La synchronisation des états lors de la navigation est gérée par handleAnalysisNavigation

  const shouldShowCriteria = true;
  return <div className={`w-full px-4 sm:px-6 lg:px-0 ${displayStep !== 'idle' ? 'max-w-[896px] mx-auto' : ''}`}>
      <section aria-label="Assistant de décision">
        {/* Navigation entre analyses */}
        {displayStep !== 'idle' && <AnalysisNavigation analyses={analyses} currentAnalysisIndex={currentAnalysisIndex} onNavigate={handleAnalysisNavigation} />}

        {(displayStep === 'criteria-loaded' || displayStep === 'loading-options' || displayStep === 'done') && <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 animate-fade-in">
              {/* Layout mobile : emoji au-dessus du titre, aligné à gauche */}
              <div className="sm:hidden space-y-2 w-full px-0">
                <EmojiPicker emoji={displayEmoji} setEmoji={setEmoji} />
                <div className="px-[8px]">
                  <EditableTitle
                    title={getCurrentAnalysis()?.displayTitle || getCurrentAnalysis()?.dilemma || displayDilemma}
                    onTitleChange={handleTitleChange}
                    className="text-4xl font-bold text-left break-words"
                    disabled={displayStep === 'loading-options' || isLoading || isUpdating || Boolean(isLockedToOther)}
                  />
                </div>
              </div>
              
              {/* Layout desktop : emoji et titre côte à côte */}
              <div className="hidden sm:flex items-baseline gap-4 w-full">
                <EmojiPicker emoji={displayEmoji} setEmoji={setEmoji} />
                <EditableTitle
                  title={getCurrentAnalysis()?.displayTitle || getCurrentAnalysis()?.dilemma || displayDilemma}
                  onTitleChange={handleTitleChange}
                  className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-left break-words flex-1 min-w-0 leading-snug"
                  disabled={displayStep === 'loading-options' || isLoading || isUpdating || Boolean(isLockedToOther)}
                />
              </div>
            </div>
            
            
            {/* Afficher les critères uniquement pour les questions comparatives */}
            {shouldShowCriteria && <div className="w-full mb-6 px-0">
                <CriteriaManager criteria={displayCriteria} setCriteria={setCriteria} isInteractionDisabled={displayStep === 'loading-options' || isLoading || isUpdating || Boolean(isLockedToOther)} onUpdateAnalysis={handleManualUpdate} hasChanges={hasChanges} currentDecisionId={currentDecision?.id} isNewDecision={displayStep === 'criteria-loaded' && !currentDecision?.id} />
              </div>}
          </>}

        {displayStep === 'idle' && <DilemmaSetup dilemma={dilemma} setDilemma={setDilemma} analysisStep={analysisStep} isLoading={isLoading} isUpdating={isUpdating} applyTemplate={applyTemplate} clearSession={clearAll} clearAnalyses={clearAnalyses} history={history} loadDecision={loadDecisionWithThread} deleteDecision={deleteDecision} clearHistory={clearHistory} handleStartAnalysis={handleStartAnalysis} progress={progress} progressMessage={progressMessage} templates={templates} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} onUpdateCategory={handleUpdateCategory} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />}
        
        {/* Bouton de génération manuelle uniquement pour les questions comparatives */}
        {displayStep === 'criteria-loaded' && shouldShowCriteria && <div className="mb-6">
            <ManualOptionsGenerator onGenerateOptions={handleManualUpdate} isLoading={isUpdating} hasChanges={hasChanges} />
          </div>}
        
        {displayStep === 'loading-options' && <OptionsLoadingSkeleton />}
        
        {displayStep === 'done' && <AnalysisResult result={displayResult} isUpdating={isUpdating} analysisStep={displayStep} currentDecision={getCurrentDecision()} dilemma={displayDilemma} onUpdateDecision={updatedDecision => {
        // Mettre à jour la décision dans l'état global
        console.log('Decision updated:', updatedDecision);
      }} onFollowUpQuestion={handleFollowUpQuestion} />}

        {/* Section commentaires généraux - uniquement en bas de page */}
        {currentDecision && displayStep !== 'idle' && <div className="mt-12 mb-8 border-t pt-8">
            <CommentSection decisionId={currentDecision.id} commentType="general" title={t('comments.section.titleDefault')} placeholder={t('comments.section.placeholderDefault')} />
          </div>}
      </section>
    </div>;
};
export default DecisionMaker;