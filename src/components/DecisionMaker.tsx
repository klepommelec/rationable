import React, { useMemo } from 'react';
import { useDecisionMakerContext } from '@/contexts/DecisionMakerContext';
import { useMultiAnalysis } from '@/hooks/useMultiAnalysis';
import { detectQuestionType } from '@/services/questionClassificationService';
import { EmojiPicker } from './EmojiPicker';
import { CriteriaManager } from './CriteriaManager';
import { OptionsLoadingSkeleton } from './OptionsLoadingSkeleton';
import ManualOptionsGenerator from './ManualOptionsGenerator';
import ManualOptionsCreator from './ManualOptionsCreator';
import AnalysisNavigation from './decision-maker/AnalysisNavigation';
import DilemmaSetup from './decision-maker/DilemmaSetup';
import AnalysisResult from './decision-maker/AnalysisResult';
import { DataAccuracyIndicator } from './decision-maker/DataAccuracyIndicator';
import { EditableTitle } from './EditableTitle';
import { toast } from "sonner";
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useRealTimeSearchSettings } from '@/hooks/useRealTimeSearchSettings';
import { useAuth } from '@/hooks/useAuth';
import { CommentsPanel, type CommentsSummary } from './comments/CommentsPanel';
// Composant principal pour la prise de décision unifiée
const DecisionMaker = () => {
  const {
    t
  } = useI18nUI();
  
  const { realTimeSearchEnabled } = useRealTimeSearchSettings();
  
  // Destructuration du hook useDecisionMaker
  const {
    dilemma,
    setDilemma,
    emoji,
    setEmoji,
    analysisStep,
    setAnalysisStep,
    progress,
    progressMessage,
    setProgressMessage,
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
    updateDecision,
    addDecision,
    currentDecisionId,
    setCurrentDecisionId,
    uploadedFiles,
    setUploadedFiles
  } = useDecisionMakerContext();
  
  const { user, profile } = useAuth();
  
  // Get user display name helper
  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (profile?.email) return profile.email;
    return 'Utilisateur';
  };
  
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
  
  // État pour le compteur de commentaires
  const [commentsCount, setCommentsCount] = React.useState(0);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [commentsSummary, setCommentsSummary] = React.useState<CommentsSummary | null>(null);
  
  // Fonction pour gérer la création manuelle des options
  const handleManualOptionsCreated = (options: any[]) => {
    console.log('🔧 [DEBUG] handleManualOptionsCreated appelé avec:', {
      options,
      currentDecisionId: currentDecision?.id,
      dilemma,
      criteria
    });
    
    // Convertir les options manuelles au format attendu par l'application
    const breakdown = options.map(option => ({
      option: option.title || 'Option sans titre',
      description: option.description || '', // Ajouter la description
      pros: option.pros || [],
      cons: option.cons || [],
      score: 0 // Score neutre pour les options manuelles
    }));
    
    const formattedResult = {
      recommendation: t('decision.manualOptions.manualAnalysisDescription'),
      description: `Analyse manuelle de votre décision : "${dilemma}". ${options.length} option(s) créée(s) manuellement.`,
      breakdown: breakdown,
      realTimeData: null,
      workspaceData: null
    };
    
    console.log('🔧 [DEBUG] formattedResult créé:', formattedResult);
    
    // Si on n'a pas encore de décision, en créer une
    if (!currentDecision?.id) {
      const newId = crypto.randomUUID();
      const newDecision = {
        id: newId,
        timestamp: Date.now(),
        dilemma: dilemma,
        emoji: emoji || '🤔',
        criteria: criteria,
        result: formattedResult,
        category: selectedCategory,
        threadId: newId,
        parentId: undefined,
        createdById: user?.id,
        createdByName: getUserDisplayName(),
        language: 'fr'
      };
      
      console.log('🔧 [DEBUG] Création nouvelle décision:', newDecision);
      
      // Sauvegarder la décision
      addDecision(newDecision);
      setCurrentDecisionId(newId);
      
      // Ajouter automatiquement l'utilisateur comme participant pour permettre les votes
      // IMPORTANT: Attendre que l'ajout soit terminé pour que les votes fonctionnent immédiatement
      if (user?.id) {
        import('@/services/votingService').then(async ({ votingService }) => {
          try {
            const participant = await votingService.addParticipant(newId, user.id, 'contributor');
            if (participant) {
              console.log('✅ User added as participant (manual mode):', participant);
            } else {
              console.warn('⚠️ Failed to add user as participant (manual mode, may already exist)');
            }
          } catch (err) {
            console.error('Error adding user as participant (manual mode):', err);
          }
        });
      }
    } else {
      // Mettre à jour la décision existante
      const currentDecision = getCurrentDecision();
      if (currentDecision) {
        const updatedDecision = {
          ...currentDecision,
          criteria: criteria, // Sauvegarder les critères
          result: formattedResult
        };
        console.log('🔧 [DEBUG] Mise à jour décision existante:', updatedDecision);
        updateDecision(updatedDecision);
      }
    }
    
    setResult(formattedResult);
    setAnalysisStep('done');
    toast.success(t('decision.toasts.optionsCreatedSuccessfully'));
  };

  // Fonction pour ajouter une option manuelle
  const handleAddManualOption = () => {
    // Créer une option vide et passer à l'étape de création manuelle
    const emptyOption = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      pros: [''],
      cons: ['']
    };
    
    handleManualOptionsCreated([emptyOption]);
  };

  // Fonction pour revenir au mode édition des options
  const handleEditOptions = () => {
    // Revenir à l'étape de création des options
    setAnalysisStep('criteria-loaded');
  };

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

  // Fonction pour gérer les changements de titre avec relancement d'analyse
  const handleTitleEdit = async (newTitle: string) => {
    try {
      // Réinitialiser l'état pour la nouvelle analyse
      setResult(null);
      setAnalysisStep('loading-options');
      
      // Démarrer une nouvelle analyse avec le nouveau titre
      await handleStartAnalysis(undefined, {
        dilemmaOverride: newTitle
      });
      
      toast.success(t('decision.toasts.titleUpdated'));
    } catch (error) {
      console.error('Erreur lors du relancement de l\'analyse:', error);
      toast.error('Erreur lors du relancement de l\'analyse');
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
  
  // Utiliser useMemo pour recalculer currentDecision quand history ou currentDecisionId change
  // Cela garantit que currentDecision est toujours à jour même après addDecision
  // Le problème était que getCurrentDecision() était appelé une seule fois au rendu,
  // mais history était mis à jour de manière asynchrone via setState
  const currentDecision = useMemo(() => {
    if (!currentDecisionId) {
      return null;
    }
    
    // Chercher directement dans history (qui est mis à jour de manière synchrone par setHistory)
    // Cela garantit que même si React n'a pas encore re-rendu, on trouve la décision
    const found = history.find(d => d.id === currentDecisionId);
    if (found) {
      return found;
    }
    
    // Si pas trouvé, essayer getCurrentDecision() comme fallback
    // (mais normalement on ne devrait jamais arriver ici)
    return getCurrentDecision();
  }, [currentDecisionId, history]);
  
  const currentAnalysis = getCurrentAnalysis();

  // Etats d'affichage gelés pour éviter les décalages lorsque l'analyse en cours concerne un autre onglet
  const lockId = pendingWriteAnalysisIdRef.current;
  const isLockedToOther = Boolean(lockId && currentAnalysis && lockId !== currentAnalysis.id);
  const displayDilemma = isLockedToOther ? currentAnalysis?.dilemma ?? dilemma : dilemma;
  const displayEmoji = isLockedToOther ? currentAnalysis?.emoji ?? emoji : emoji;
  const displayResult = isLockedToOther ? currentAnalysis?.result ?? result : result;
  // Logique d'affichage : si on a un résultat, afficher le résultat, sinon afficher la création
  const baseStep = isLockedToOther ? currentAnalysis?.analysisStep ?? analysisStep : analysisStep;
  
  // Pour les décisions manuelles chargées depuis l'historique, vérifier si elles ont des critères et options
  const hasManualContent = currentDecision && 
    currentDecision.criteria && 
    currentDecision.criteria.length > 0 && 
    currentDecision.result && 
    currentDecision.result.breakdown && 
    currentDecision.result.breakdown.length > 0;
  
  // Si on a du contenu manuel, forcer le mode 'done' pour afficher le tableau comparatif
  const displayStep = hasManualContent ? 'done' : baseStep;
  const displayCriteria = isLockedToOther ? currentAnalysis?.criteria ?? criteria : criteria;
  const displayCategory = isLockedToOther ? currentAnalysis?.category ?? selectedCategory : selectedCategory;
  
  // Debug: afficher l'état de la décision courante
  console.log('🔍 [DEBUG] Current decision state:');
  console.log('  - currentDecision:', currentDecision ? {
    id: currentDecision.id,
    dilemma: currentDecision.dilemma,
    hasResult: !!currentDecision.result,
    criteria: currentDecision.criteria?.length || 0,
    criteriaDetails: currentDecision.criteria,
    resultBreakdown: currentDecision.result?.breakdown?.length || 0
  } : null);
  console.log('  - currentAnalysis:', currentAnalysis ? {
    id: currentAnalysis.id,
    dilemma: currentAnalysis.dilemma,
    hasResult: !!currentAnalysis.result,
    analysisStep: currentAnalysis.analysisStep
  } : null);
  console.log('  - displayStep:', displayStep);
  console.log('  - displayResult:', !!displayResult);
  console.log('  - hasManualContent:', hasManualContent);
  console.log('  - baseStep:', baseStep);

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
  return <div className={`w-full ${displayStep !== 'idle' ? 'max-w-[896px] mx-auto px-4 sm:px-0' : 'px-4 sm:px-6 lg:px-0'}`}>
      <section aria-label="Assistant de décision">
        {/* Navigation entre analyses */}
        {displayStep !== 'idle' && <AnalysisNavigation analyses={analyses} currentAnalysisIndex={currentAnalysisIndex} onNavigate={handleAnalysisNavigation} />}

        {(displayStep === 'criteria-loaded' || displayStep === 'loading-options' || displayStep === 'done') && <>
            {/* Titre (emoji + dilemme) en premier */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in pt-[72px] sm:pt-[72px] pb-0 h-fit">
              {/* Layout mobile : emoji au-dessus du titre, aligné à gauche */}
              <div className="sm:hidden space-y-2 w-full px-0">
                <EmojiPicker emoji={displayEmoji} setEmoji={setEmoji} />
                <div className="px-[8px]">
                  <EditableTitle
                    title={getCurrentAnalysis()?.displayTitle || getCurrentAnalysis()?.dilemma || displayDilemma}
                    onTitleChange={handleTitleChange}
                    onTitleEdit={handleTitleEdit}
                    className="text-4xl font-bold text-left break-words"
                    disabled={displayStep === 'loading-options' || isLoading || isUpdating || Boolean(isLockedToOther)}
                  />
                </div>
              </div>
              {/* Layout desktop : emoji et titre côte à côte */}
              <div className="hidden sm:flex flex-col items-start gap-2 w-full pt-0 pb-0">
                <div className="flex-shrink-0 leading-none text-center" style={{ verticalAlign: 'middle' }}>
                  <EmojiPicker emoji={displayEmoji} setEmoji={setEmoji} />
                </div>
                <EditableTitle
                  title={getCurrentAnalysis()?.displayTitle || getCurrentAnalysis()?.dilemma || displayDilemma}
                  onTitleChange={handleTitleChange}
                  onTitleEdit={handleTitleEdit}
                  className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-left break-words flex-1 min-w-0 leading-snug"
                  disabled={displayStep === 'loading-options' || isLoading || isUpdating || Boolean(isLockedToOther)}
                />
              </div>
            </div>

            {/* Bloc "Created on... by..." (uniquement quand le résultat est affiché) */}
            {displayStep === 'done' && displayResult && (
              <DataAccuracyIndicator
                result={displayResult}
                currentDecision={getCurrentDecision()}
              />
            )}

            {/* Boutons Criteria et Comments sous le bloc Created on */}
            {shouldShowCriteria && (
              <div className="flex items-center gap-2 pt-4 pb-6">
                <CriteriaManager
                  criteria={displayCriteria}
                  setCriteria={setCriteria}
                  isInteractionDisabled={displayStep === 'loading-options' || isLoading || isUpdating || Boolean(isLockedToOther)}
                  onUpdateAnalysis={handleManualUpdate}
                  hasChanges={hasChanges}
                  currentDecisionId={currentDecision?.id}
                  isNewDecision={displayStep === 'criteria-loaded' && !currentDecision?.id}
                  isManualDecision={!realTimeSearchEnabled}
                  result={displayStep === 'done' ? displayResult : null}
                  currentDecision={displayStep === 'done' ? getCurrentDecision() : null}
                />
                <CommentsPanel
                  decisionId={currentDecision?.id}
                  commentsCount={commentsCount}
                  onCommentsCountChange={setCommentsCount}
                  open={commentsOpen}
                  onOpenChange={setCommentsOpen}
                  onCommentsDataChange={setCommentsSummary}
                  variant="inline"
                  inlineTargetId="comments-inline-root"
                />
              </div>
            )}
          </>}

        {displayStep === 'idle' && <DilemmaSetup dilemma={dilemma} setDilemma={setDilemma} analysisStep={analysisStep} setAnalysisStep={setAnalysisStep} isLoading={isLoading} isUpdating={isUpdating} applyTemplate={applyTemplate} clearSession={clearAll} clearAnalyses={clearAnalyses} history={history} loadDecision={loadDecisionWithThread} deleteDecision={deleteDecision} clearHistory={clearHistory} handleStartAnalysis={handleStartAnalysis} progress={progress} progressMessage={progressMessage} setProgressMessage={setProgressMessage} templates={templates} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} onUpdateCategory={handleUpdateCategory} uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} addDecision={addDecision} setCurrentDecisionId={setCurrentDecisionId} />}
        
        {/* Générateur d'options selon le mode */}
        {displayStep === 'criteria-loaded' && shouldShowCriteria && (
          <div className="mb-6">
            {realTimeSearchEnabled ? (
              <ManualOptionsGenerator 
                onGenerateOptions={handleManualUpdate} 
                onAddManualOption={handleAddManualOption}
                isLoading={isUpdating} 
                hasChanges={hasChanges} 
              />
            ) : (
              <ManualOptionsCreator 
                onOptionsCreated={handleManualOptionsCreated} 
                isLoading={isUpdating}
                decisionId={currentDecision?.id}
                // Debug: afficher l'ID de la décision
                debugDecisionId={currentDecision?.id}
                dilemma={dilemma}
                onFollowUpQuestion={handleFollowUpQuestion}
                existingOptions={currentDecision?.result?.breakdown?.map((item: any) => ({
                  id: crypto.randomUUID(), // Générer un nouvel ID pour chaque option
                  title: item.option || '',
                  description: item.description || '',
                  pros: item.pros || [],
                  cons: item.cons || []
                }))}
              />
            )}
          </div>
        )}
        
        {/* Même wrapper pour chargement et résultat : même largeur / padding */}
        <div className="w-full min-w-0">
          {displayStep === 'loading-options' && <OptionsLoadingSkeleton />}
          {displayStep === 'done' && <AnalysisResult result={displayResult} isUpdating={isUpdating} analysisStep={displayStep} currentDecision={getCurrentDecision()} dilemma={displayDilemma} showDataAccuracyIndicator={false} onUpdateDecision={(updatedDecision) => {
        // Actually update the decision in history (local + cloud)
        console.log('Decision updated with cached data:', updatedDecision);
        updateDecision(updatedDecision);
      }} onFollowUpQuestion={handleFollowUpQuestion} onEditOptions={handleEditOptions} onOpenComments={() => setCommentsOpen(true)} commentsOpen={commentsOpen} commentsCount={commentsCount} lastCommenters={commentsSummary?.lastCommenters ?? []} />}
        </div>

        {/* Ancrage pour afficher les commentaires en bas de page (mode inline) */}
        <div id="comments-inline-root" className="w-full" />

      </section>
    </div>;
};
export default DecisionMaker;