import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Paperclip, X, FileText, Image, ArrowRight, Loader2, ExternalLink, ChevronRight } from 'lucide-react';
import { DecisionHistory } from '../DecisionHistory';
import { AnimatedPlaceholder } from '../AnimatedPlaceholder';
import MainActionButton from './MainActionButton';
import { UploadedFile } from '../FileUpload';
import { IDecision } from '@/types/decision';
import { toast } from "sonner";
import { useI18nUI } from '@/contexts/I18nUIContext';
import { Link } from 'react-router-dom';
import { PERSONAL_TEMPLATES, PROFESSIONAL_TEMPLATES } from '@/data/predefinedTemplates';
import { shareTemplateForPreview } from '@/services/templatePreviewService';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import { useContextualContent } from '@/hooks/useContextualContent';
import MonthlyTrendingTemplates from '@/components/MonthlyTrendingTemplates';
import { useRealTimeSearchSettings } from '@/hooks/useRealTimeSearchSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
interface DilemmaSetupProps {
  dilemma: string;
  setDilemma: (dilemma: string) => void;
  analysisStep: 'idle' | 'loading-criteria' | 'criteria-loaded' | 'loading-options' | 'done';
  setAnalysisStep: (step: 'idle' | 'loading-criteria' | 'criteria-loaded' | 'loading-options' | 'done') => void;
  isLoading: boolean;
  isUpdating: boolean;
  applyTemplate: (template: any) => void;
  clearSession: () => void;
  clearAnalyses: () => void;
  history: IDecision[];
  loadDecision: (id: string) => void;
  deleteDecision: (id: string) => void;
  clearHistory: () => void;
  handleStartAnalysis: () => void;
  progress: number;
  progressMessage: string;
  setProgressMessage: (message: string) => void;
  templates: {
    name: string;
    dilemma: string;
  }[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
  onUpdateCategory: (decisionId: string, categoryId: string | undefined) => void;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
  addDecision: (decision: any) => void;
  setCurrentDecisionId: (id: string) => void;
}
const DilemmaSetup: React.FC<DilemmaSetupProps> = ({
  dilemma,
  setDilemma,
  analysisStep,
  setAnalysisStep,
  isLoading,
  isUpdating,
  applyTemplate,
  clearSession,
  clearAnalyses,
  history,
  loadDecision,
  deleteDecision,
  clearHistory,
  handleStartAnalysis,
  progress,
  progressMessage,
  setProgressMessage,
  templates,
  selectedCategory,
  onCategoryChange,
  onUpdateCategory,
  uploadedFiles,
  setUploadedFiles,
  addDecision,
  setCurrentDecisionId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalysisStarting, setIsAnalysisStarting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState(false);
  const {
    t
  } = useI18nUI();
  const {
    user,
    profile
  } = useAuth();
  
  // Get user display name helper
  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (profile?.email) return profile.email;
    return 'Utilisateur';
  };
  const {
    context
  } = useContextualContent();
  const {
    realTimeSearchEnabled,
    setRealTimeSearchEnabled
  } = useRealTimeSearchSettings();

  // Afficher seulement les 3 premiers modèles
  const displayedTemplates = templates.slice(0, 3);
  const handleOpenTemplate = async (template: any) => {
    try {
      // Créer un aperçu temporaire du template dans Supabase
      const previewId = await shareTemplateForPreview(template.decision_data);
      if (!previewId) {
        toast.error('Limite de création de previews atteinte. Veuillez patienter quelques minutes.');
        return;
      }

      // Ouvrir l'aperçu dans un nouvel onglet
      const previewUrl = `/template-preview/${previewId}`;
      window.open(previewUrl, '_blank');
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du template');
    }
  };
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  const processFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      // Validation de la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${t('dilemmaSetup.fileTooLarge').replace('est trop volumineux (max 10MB)', `${file.name} ${t('dilemmaSetup.fileTooLarge')}`)}`);
        return null;
      }
      let fileType: 'pdf' | 'image' | 'other' = 'other';
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        fileType = 'image';
        preview = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        fileType = 'pdf';
      }
      return {
        id: crypto.randomUUID(),
        file,
        preview,
        type: fileType
      };
    }).filter(Boolean) as UploadedFile[];
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} ${t('dilemmaSetup.analysisStarted').replace('Analyse démarrée !', 'fichier(s) ajouté(s)')}`);
    }
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    processFiles(files);

    // Reset l'input pour permettre de sélectionner le même fichier à nouveau
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !isUpdating && analysisStep !== 'done') {
      setIsDragOver(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isLoading || isUpdating || analysisStep === 'done') return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };
  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);

    // Nettoyer les URLs de preview
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const isMainButtonDisabled = dilemma.trim() === '' || isLoading || isAnalysisStarting;
  const handleAnalysisClick = async () => {
    if (!user) {
      setPendingAnalysis(true);
      setAuthModalOpen(true);
      return;
    }

    // Clear previous analyses when starting a new question (not a follow-up)
    clearAnalyses();
    setIsAnalysisStarting(true);
    console.log('🔍 [DEBUG] Toggle state:', realTimeSearchEnabled);
    console.log('🔍 [DEBUG] localStorage value:', localStorage.getItem('realTimeSearchEnabled'));
    
    if (realTimeSearchEnabled) {
      // Mode IA automatique
      console.log('🤖 [DEBUG] AI mode activated');
      toast.success(t('dilemmaSetup.analysisStarted'));
      try {
        await handleStartAnalysis();
      } finally {
        setIsAnalysisStarting(false);
      }
    } else {
      // Mode manuel : créer une décision dès maintenant pour permettre les commentaires
      console.log('📝 [DEBUG] Manual mode activated - creating decision immediately');
      
      // Créer une décision vide pour le mode manuel
      const newId = crypto.randomUUID();
      const newDecision = {
        id: newId,
        timestamp: Date.now(),
        dilemma: dilemma,
        emoji: '🤔',
        criteria: [],
        result: null, // Pas encore de résultat
        category: undefined,
        threadId: newId,
        parentId: undefined,
        createdById: user?.id,
        createdByName: getUserDisplayName(),
        language: 'fr'
      };
      
      // Sauvegarder la décision immédiatement
      addDecision(newDecision);
      setCurrentDecisionId(newId);
      
      toast.success(t('dilemmaSetup.manualModeActivated'));
      setIsAnalysisStarting(false);
      
      // En mode manuel, on passe directement à l'étape de création manuelle
      setAnalysisStep('criteria-loaded');
      setProgressMessage('Mode manuel - Créez vos critères et options');
      
      console.log('🆔 Created decision for manual mode:', newId);
    }
  };
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (pendingAnalysis) {
      setPendingAnalysis(false);
      // Auto-launch analysis after successful auth
      setTimeout(() => {
        handleAnalysisClick();
      }, 100);
    }
  };
  return <div className="mx-auto space-y-6">
            {/* Header principal occupant 72% de la hauteur de l'écran */}
            <div className="h-[72vh] flex items-center justify-center">
                <Card className="backdrop-blur-sm relative w-full max-w-3xl border-none shadow-none bg-transparent">
                    <CardHeader className="text-center pt-12 px-4 sm:px-6">
                        <h2 className="font-bold text-4xl sm:text-4xl md:text-5xl lg:text-6xl">
                            <div className="font-semibold">{t('dilemmaSetup.hero.titleLine1')}</div>
                            <div className="flex items-center justify-center gap-3">
                                <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-16 xl:w-16" />
                                <span className="font-semibold">{t('dilemmaSetup.hero.titleLine2')}</span>
                            </div>
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-6 px-4 sm:px-6">
                        <div className="space-y-2">
                            <div className="relative">
                                <Textarea id="dilemma-input" placeholder="" value={dilemma} onChange={e => setDilemma(e.target.value)} onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey || e.key === 'Enter') {
                  if (!isMainButtonDisabled) {
                    e.preventDefault();
                    handleAnalysisClick();
                  }
                }
              }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`pulsing-glow focus:ring-cyan-500 text-base md:text-sm h-[160px] resize-none pr-20 transition-colors dark:bg-card ${isDragOver ? 'border-primary bg-primary/5 border-2 border-dashed drag-over' : ''}`} disabled={isLoading || isUpdating || analysisStep === 'done'} aria-describedby="dilemma-help" aria-invalid={dilemma.trim() === '' ? 'true' : 'false'} />
                                {dilemma === '' && !isDragOver && <div className="absolute top-2 left-3 pointer-events-none">
                                        <span className="text-muted-foreground text-base md:text-sm">
                                            <AnimatedPlaceholder interval={2500} />
                                        </span>
                                    </div>}
                                {isDragOver && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-primary font-medium">
                                            {t('dilemmaSetup.dropHere')}
                                        </div>
                                    </div>}
                                
                                {/* Toggle IA intégré dans l'input */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-1">
                                    <Switch 
                                      id="ai-analysis" 
                                      checked={realTimeSearchEnabled} 
                                      onCheckedChange={setRealTimeSearchEnabled} 
                                      className="scale-75 hover:scale-75 active:scale-75 [&:hover]:translate-y-0 [&:active]:translate-y-0" 
                                    />
                                    <Label htmlFor="ai-analysis" className="text-xs font-medium cursor-pointer">
                                        {t('dilemmaSetup.aiToggleLabel')}
                                    </Label>
                                </div>
                                
                                {/* Boutons d'action à droite */}
                                <div className="absolute bottom-3 right-3 flex gap-1">
                                    {/* Bouton d'attachement de fichier */}
                                    <button type="button" onClick={handleFileButtonClick} disabled={isLoading || isUpdating || analysisStep === 'done'} aria-label={t('dilemmaSetup.attachFile')} title={t('dilemmaSetup.attachFile')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full">
                                        <Paperclip className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </button>
                                    
                                     {/* Bouton d'analyse avec feedback visuel */}
                                     {analysisStep === 'idle' && <button type="button" onClick={handleAnalysisClick} disabled={isMainButtonDisabled} aria-label={realTimeSearchEnabled ? t('dilemmaSetup.launchAnalysis') : t('dilemmaSetup.createManually')} title={realTimeSearchEnabled ? t('dilemmaSetup.launchAnalysis') : t('dilemmaSetup.createManually')} className="p-2 bg-black hover:bg-black/90 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full hover:scale-105 active:scale-95">
                                             {isAnalysisStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                         </button>}
                                </div>
                                
                                {/* Input file caché */}
                                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" aria-hidden="true" />
                            </div>
                            <p id="dilemma-help" className="sr-only">
                                {t('dilemmaSetup.helpText')}
                            </p>
                        </div>

                        {/* Liste des fichiers uploadés */}
                        {uploadedFiles.length > 0 && <div className="space-y-2">
                                <label className="font-medium text-sm sm:text-base">
                                    {t('dilemmaSetup.attachedDocs')} ({uploadedFiles.length})
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {uploadedFiles.map(uploadedFile => <Card key={uploadedFile.id} className="p-3">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(uploadedFile.type)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(uploadedFile.file.size)}
                                                    </p>
                                                </div>
                                                {uploadedFile.preview && <img src={uploadedFile.preview} alt="Preview" className="h-10 w-10 object-cover rounded" />}
                                                <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)} disabled={isLoading || isUpdating || analysisStep === 'done'} className="text-muted-foreground hover:text-destructive">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>)}
                                </div>
                            </div>}

          {/* Show monthly trending templates */}
          <MonthlyTrendingTemplates onPromptSelect={setDilemma} disabled={isLoading || isUpdating || analysisStep !== 'idle'} />
          {/* Additional predefined templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayedTemplates.map(template => <Button key={template.name} variant="outline" size="sm" onClick={() => handleOpenTemplate({
              name: template.name,
              dilemma: template.dilemma,
              decision_data: PERSONAL_TEMPLATES.find(t => t.title === template.name)?.decision_data || PROFESSIONAL_TEMPLATES.find(t => t.title === template.name)?.decision_data
            })} disabled={isLoading || isUpdating || analysisStep !== 'idle'} aria-label={`Utiliser le modèle: ${template.name}`} className="text-xs sm:text-sm justify-start h-auto whitespace-normal text-left rounded-full py-[8px] px-[8px]">
                <span className="truncate text-sm px-[4px] font-medium text-gray-500">{template.name}</span>
              </Button>)}
          </div>
                    </CardContent>
                     <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
                         <MainActionButton analysisStep={analysisStep} handleStartAnalysis={handleAnalysisClick} isMainButtonDisabled={isMainButtonDisabled} progress={progress} progressMessage={progressMessage} />
                     </CardFooter>
                </Card>
            </div>

            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} onSuccess={handleAuthSuccess} />

            {/* Section Templates */}
            <Card className="backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-semibold text-2xl">{t('navbar.templates')}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {t('dilemmaSetup.templates.description')}
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/templates" className="flex items-center gap-2 hover:no-underline">
                                {t('dilemmaSetup.templates.viewAll')}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {user ?
        // Utilisateurs connectés : templates basés sur le workspace
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(context === 'professional' ? PROFESSIONAL_TEMPLATES : PERSONAL_TEMPLATES).slice(0, 6).map(template => <Button key={template.id} variant="outline" onClick={() => handleOpenTemplate(template)} disabled={isLoading || isUpdating || analysisStep !== 'idle'} className="h-32 p-4 text-left justify-start flex-col items-start gap-2 rounded-lg whitespace-normal">
                                    <div className="flex items-center gap-2 w-full min-w-0">
                                        <span className="text-lg shrink-0">{template.decision_data.emoji}</span>
                                        <span className="text-sm truncate font-semibold">{template.title}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-3 text-left w-full leading-relaxed">
                                        {template.description}
                                    </div>
                                </Button>)}
                        </div> :
        // Utilisateurs non connectés : sections séparées
        <div className="space-y-8">
                            {/* Templates personnels */}
                            <div className="mt-4">
                                <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-3">Templates personnels</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {PERSONAL_TEMPLATES.slice(0, 6).map(template => <Button key={template.id} variant="outline" onClick={() => handleOpenTemplate(template)} disabled={isLoading || isUpdating || analysisStep !== 'idle'} className="h-32 p-4 text-left justify-start flex-col items-start gap-2 rounded-lg whitespace-normal">
                                            <div className="flex items-center gap-2 w-full min-w-0">
                                                <span className="text-lg shrink-0">{template.decision_data.emoji}</span>
                                                <span className="text-sm truncate font-semibold">{template.title}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-3 text-left w-full leading-relaxed">
                                                {template.description}
                                            </div>
                                        </Button>)}
                                </div>
                            </div>
                            
                            {/* Templates professionnels */}
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-3">Templates professionnels</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {PROFESSIONAL_TEMPLATES.slice(0, 6).map(template => <Button key={template.id} variant="outline" onClick={() => handleOpenTemplate(template)} disabled={isLoading || isUpdating || analysisStep !== 'idle'} className="h-32 p-4 text-left justify-start flex-col items-start gap-2 rounded-lg whitespace-normal">
                                            <div className="flex items-center gap-2 w-full min-w-0">
                                                <span className="text-lg shrink-0">{template.decision_data.emoji}</span>
                                                <span className="text-sm truncate font-semibold">{template.title}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-3 text-left w-full leading-relaxed">
                                                {template.description}
                                            </div>
                                        </Button>)}
                                </div>
                            </div>
                            
                        </div>}
                </CardContent>
            </Card>

            {/* Historique intégré directement dans la page - seulement pour les utilisateurs connectés */}
            {user && <Card className="backdrop-blur-sm">
                  <CardHeader className="pb-4">
                      <CardTitle className="font-semibold text-2xl">{t('dilemmaSetup.history.title')}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                          {t('dilemmaSetup.history.description')}
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                      <DecisionHistory history={history} onLoad={loadDecision} onDelete={deleteDecision} onClear={clearHistory} onClose={() => {}} onUpdateCategory={onUpdateCategory} />
                  </CardContent>
              </Card>}
        </div>;
};
export default DilemmaSetup;