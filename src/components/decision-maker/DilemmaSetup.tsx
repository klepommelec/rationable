import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Paperclip, X, FileText, Image, ArrowRight } from 'lucide-react';
import { DecisionHistory } from '../DecisionHistory';
import { AnimatedPlaceholder } from '../AnimatedPlaceholder';
import MainActionButton from './MainActionButton';
import { UploadedFile } from '../FileUpload';
import { IDecision } from '@/types/decision';
import { toast } from "sonner";
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
  templates: {
    name: string;
    dilemma: string;
  }[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
  onUpdateCategory: (decisionId: string, categoryId: string | undefined) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Afficher seulement les 3 premiers modèles
  const displayedTemplates = templates.slice(0, 3);

  // Placeholders animés pour le textarea
  const placeholders = ["Ex: Quel framework JS devrais-je apprendre en 2025 ?", "Ex: Dois-je changer de carrière professionnelle ?", "Ex: Quelle ville choisir pour mes études ?", "Ex: Investir en bourse ou dans l'immobilier ?", "Ex: Partir en voyage ou économiser de l'argent ?", "Ex: Accepter cette offre d'emploi ou continuer à chercher ?"];
  const handleTemplateClick = (template: {
    name: string;
    dilemma: string;
  }) => {
    console.log('Template clicked:', template);
    setDilemma(template.dilemma);
    applyTemplate(template);
  };
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  const processFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      // Validation de la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
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
      toast.success(`${newFiles.length} fichier(s) ajouté(s)`);
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
  const isMainButtonDisabled = dilemma.trim() === '' || isLoading;
  return <div className="mx-auto space-y-6">
            {/* Header principal occupant 72% de la hauteur de l'écran */}
            <div className="h-[72vh] flex items-center justify-center">
                <Card className="relative w-full max-w-3xl border-none shadow-none ">
                    <CardHeader className="text-center pt-12 px-4 sm:px-6">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black dark:text-white">
                            <div className="font-medium ">Vos décisions seront </div>
                            <div className="flex items-center justify-center gap-3">
                                <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12" />
                                <span className="font-medium ">Rationable</span>
                            </div>
                        </h2>
                        <CardDescription className="text-muted-foreground text-sm:text-base">De l'incertitude à la clarté : exploitez la puissance de l'IA</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-4 sm:px-6">
                        <div className="space-y-2">
                            <div className="relative">
                                <Textarea id="dilemma-input" placeholder="" value={dilemma} onChange={e => setDilemma(e.target.value)} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`pulsing-glow focus:ring-cyan-500 text-base md:text-sm h-[160px] resize-none pr-20 transition-colors ${isDragOver ? 'border-primary bg-primary/5 border-2 border-dashed drag-over' : ''}`} disabled={isLoading || isUpdating || analysisStep === 'done'} aria-describedby="dilemma-help" aria-invalid={dilemma.trim() === '' ? 'true' : 'false'} />
                                {dilemma === '' && !isDragOver && <div className="absolute top-2 left-3 pointer-events-none">
                                        <span className="text-muted-foreground text-base md:text-sm">
                                            <AnimatedPlaceholder placeholders={placeholders} interval={2500} />
                                        </span>
                                    </div>}
                                {isDragOver && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-primary font-medium">
                                            Déposez vos fichiers ici
                                        </div>
                                    </div>}
                                {/* Boutons d'action à droite */}
                                <div className="absolute bottom-3 right-3 flex gap-1">
                                    {/* Bouton d'attachement de fichier */}
                                    <button type="button" onClick={handleFileButtonClick} disabled={isLoading || isUpdating || analysisStep === 'done'} aria-label="Joindre un fichier" title="Joindre un fichier" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full">
                                        <Paperclip className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </button>
                                    
                                    {/* Bouton d'analyse */}
                                    {analysisStep === 'idle' && <button type="button" onClick={handleStartAnalysis} disabled={isMainButtonDisabled} aria-label="Lancer l'analyse" title="Lancer l'analyse" className="p-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full">
                                            <ArrowRight className="h-4 w-4" />
                                        </button>}
                                </div>
                                
                                {/* Input file caché */}
                                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" aria-hidden="true" />
                            </div>
                            <p id="dilemma-help" className="sr-only">
                                Décrivez le problème ou la décision que vous devez prendre. Vous pouvez aussi glisser-déposer des documents directement dans cette zone.
                            </p>
                        </div>

                        {/* Liste des fichiers uploadés */}
                        {uploadedFiles.length > 0 && <div className="space-y-2">
                                <label className="font-medium text-sm sm:text-base">
                                    Documents joints ({uploadedFiles.length})
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

                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {displayedTemplates.map(template => <Button key={template.name} variant="outline" size="sm" onClick={() => handleTemplateClick(template)} disabled={isLoading || isUpdating || analysisStep !== 'idle'} aria-label={`Utiliser le modèle: ${template.name}`} className="text-xs sm:text-sm justify-start h-auto whitespace-normal text-left rounded-full py-[8px] px-[8px]">
                                        <span className="truncate text-sm px-[4px] font-normal text-gray-600 dark:text-gray-400">{template.name}</span>
                                    </Button>)}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
                        <MainActionButton analysisStep={analysisStep} handleStartAnalysis={handleStartAnalysis} isMainButtonDisabled={isMainButtonDisabled} progress={progress} progressMessage={progressMessage} />
                    </CardFooter>
                </Card>
            </div>

            {/* Historique intégré directement dans la page */}
            <Card className="backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="font-semibold text-2xl">Historique des décisions</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Chargez ou supprimez vos analyses passées.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <DecisionHistory history={history} onLoad={loadDecision} onDelete={deleteDecision} onClear={clearHistory} onClose={() => {}} onUpdateCategory={onUpdateCategory} />
                </CardContent>
            </Card>
        </div>;
};
export default DilemmaSetup;