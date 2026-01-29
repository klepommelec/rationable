import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import { toast } from "sonner";
import { useI18nUI } from '@/contexts/I18nUIContext';

interface Option {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface ManualOptionsCreatorProps {
  onOptionsCreated: (options: Option[]) => void;
  isLoading: boolean;
  decisionId?: string;
  dilemma?: string;
  onFollowUpQuestion?: (enrichedDilemma: string) => void;
  debugDecisionId?: string; // Debug prop
  existingOptions?: Option[]; // Options existantes pour l'édition
}

const ManualOptionsCreator: React.FC<ManualOptionsCreatorProps> = ({
  onOptionsCreated,
  isLoading,
  decisionId,
  dilemma,
  onFollowUpQuestion,
  debugDecisionId,
  existingOptions
}) => {
  const { t } = useI18nUI();
    // Debug: afficher les IDs reçus
    console.log('🔍 [ManualOptionsCreator] Props reçues:', {
      decisionId,
      debugDecisionId,
      dilemma
    });
    const initialOption = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      pros: [''],
      cons: ['']
    };

    // Utiliser les options existantes si fournies, sinon créer une option vide
    const [options, setOptions] = useState<Option[]>(() => {
      if (existingOptions && existingOptions.length > 0) {
        return existingOptions;
      }
      return [initialOption];
    });
    
    // Utiliser directement le decisionId fourni
    const effectiveDecisionId = decisionId;
    
    const [showGenerateButtons, setShowGenerateButtons] = useState<{[key: string]: boolean}>(() => {
      const initialButtons: {[key: string]: boolean} = {};
      if (existingOptions && existingOptions.length > 0) {
        // Pour les options existantes, activer les boutons si elles ont un titre
        existingOptions.forEach(option => {
          initialButtons[option.id] = option.title.trim() !== '';
        });
      } else {
        // Pour une nouvelle option, désactiver les boutons
        initialButtons[initialOption.id] = false;
      }
      return initialButtons;
    });

  const addOption = () => {
    const newOption = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      pros: [''],
      cons: ['']
    };
    setOptions([...options, newOption]);
    // Initialiser l'état des boutons pour la nouvelle option
    setShowGenerateButtons(prev => ({
      ...prev,
      [newOption.id]: false
    }));
  };

  const removeOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: string, field: keyof Option, value: any) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  const handleTitleBlur = (optionId: string, title: string) => {
    if (title.trim()) {
      setShowGenerateButtons(prev => ({
        ...prev,
        [optionId]: true
      }));
    } else {
      setShowGenerateButtons(prev => ({
        ...prev,
        [optionId]: false
      }));
    }
  };

  const addPro = (optionId: string) => {
    setOptions(options.map(option => 
      option.id === optionId 
        ? { ...option, pros: [...option.pros, ''] }
        : option
    ));
  };

  const removePro = (optionId: string, proIndex: number) => {
    setOptions(options.map(option => 
      option.id === optionId 
        ? { ...option, pros: option.pros.filter((_, index) => index !== proIndex) }
        : option
    ));
  };

  const updatePro = (optionId: string, proIndex: number, value: string) => {
    setOptions(options.map(option => 
      option.id === optionId 
        ? { ...option, pros: option.pros.map((pro, index) => index === proIndex ? value : pro) }
        : option
    ));
  };

  const addCon = (optionId: string) => {
    setOptions(options.map(option => 
      option.id === optionId 
        ? { ...option, cons: [...option.cons, ''] }
        : option
    ));
  };

  const removeCon = (optionId: string, conIndex: number) => {
    setOptions(options.map(option => 
      option.id === optionId 
        ? { ...option, cons: option.cons.filter((_, index) => index !== conIndex) }
        : option
    ));
  };

  const updateCon = (optionId: string, conIndex: number, value: string) => {
    setOptions(options.map(option => 
      option.id === optionId 
        ? { ...option, cons: option.cons.map((con, index) => index === conIndex ? value : con) }
        : option
    ));
  };


  const generateDescription = async (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option || !option.title.trim()) {
      toast.error("Veuillez d'abord saisir un titre pour l'option");
      return;
    }

    try {
      const title = option.title.trim();
      const generatedDescription = `Description détaillée pour "${title}". Cette option mérite d'être considérée dans votre analyse.`;
      
      setOptions(options.map(opt => 
        opt.id === optionId 
          ? { ...opt, description: generatedDescription }
          : opt
      ));

      toast.success(t('decision.toasts.descriptionGenerated'));
    } catch (error) {
      toast.error(t('decision.toasts.descriptionGenerationError'));
    }
  };

  const generatePros = async (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option || !option.title.trim()) {
      toast.error("Veuillez d'abord saisir un titre pour l'option");
      return;
    }

    try {
      const title = option.title.trim();
      const generatedPros = [
        `Avantage principal de ${title}`,
        `Point positif important`,
        `Bénéfice notable`
      ];
      
      setOptions(options.map(opt => 
        opt.id === optionId 
          ? { ...opt, pros: generatedPros }
          : opt
      ));

      toast.success(t('decision.toasts.prosGenerated'));
    } catch (error) {
      toast.error(t('decision.toasts.prosGenerationError'));
    }
  };

  const generateCons = async (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option || !option.title.trim()) {
      toast.error("Veuillez d'abord saisir un titre pour l'option");
      return;
    }

    try {
      const title = option.title.trim();
      const generatedCons = [
        `Inconvénient potentiel de ${title}`,
        `Risque à considérer`,
        `Point d'attention`
      ];
      
      setOptions(options.map(opt => 
        opt.id === optionId 
          ? { ...opt, cons: generatedCons }
          : opt
      ));

      toast.success(t('decision.toasts.consGenerated'));
    } catch (error) {
      toast.error(t('decision.toasts.consGenerationError'));
    }
  };


  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-blue-200">
        <CardHeader>
          <CardDescription>
            {t('decision.manualOptions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

        {options.map((option, optionIndex) => (
          <Card key={option.id} className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Option {optionIndex + 1}</CardTitle>
                {options.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('decision.manualOptions.optionTitle')} *</label>
                <Input
                  value={option.title}
                  onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                  onBlur={(e) => handleTitleBlur(option.id, e.target.value)}
                  placeholder={t('decision.manualOptions.optionTitlePlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t('decision.manualOptions.optionDescription')}</label>
                  {showGenerateButtons[option.id] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateDescription(option.id)}
                      className="text-black hover:text-gray-700"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {t('decision.manualOptions.generateDescription')}
                    </Button>
                  )}
                </div>
                <Textarea
                  value={option.description}
                  onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                  placeholder={t('decision.manualOptions.optionDescriptionPlaceholder')}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section Avantages */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('decision.manualOptions.pros')}</label>
                    {showGenerateButtons[option.id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePros(option.id)}
                        className="text-black hover:text-gray-700"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t('decision.manualOptions.generatePros')}
                      </Button>
                    )}
                  </div>
                  {option.pros.map((pro, proIndex) => (
                    <div key={proIndex} className="flex gap-2 mt-1">
                      <Input
                        value={pro}
                        onChange={(e) => updatePro(option.id, proIndex, e.target.value)}
                        placeholder={t('decision.manualOptions.proPlaceholder')}
                        className="flex-1"
                      />
                      {option.pros.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePro(option.id, proIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPro(option.id)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('decision.manualOptions.addPro')}
                  </Button>
                </div>

                {/* Section Inconvénients */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('decision.manualOptions.cons')}</label>
                    {showGenerateButtons[option.id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateCons(option.id)}
                        className="text-black hover:text-gray-700"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t('decision.manualOptions.generateCons')}
                      </Button>
                    )}
                  </div>
                  {option.cons.map((con, conIndex) => (
                    <div key={conIndex} className="flex gap-2 mt-1">
                      <Input
                        value={con}
                        onChange={(e) => updateCon(option.id, conIndex, e.target.value)}
                        placeholder={t('decision.manualOptions.conPlaceholder')}
                        className="flex-1"
                      />
                      {option.cons.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCon(option.id, conIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCon(option.id)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('decision.manualOptions.addCon')}
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={addOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('decision.manualOptions.addOption')}
          </Button>
          
          <Button
            onClick={() => {
              // Vérifier que toutes les options ont au moins un titre
              const validOptions = options.filter(option => option.title.trim() !== '');
              
              if (validOptions.length === 0) {
                toast.error("Veuillez ajouter au moins une option avec un titre");
                return;
              }

              // Nettoyer les options (supprimer les pros/cons vides)
              const cleanedOptions = validOptions.map(option => ({
                ...option,
                pros: option.pros.filter(pro => pro.trim() !== ''),
                cons: option.cons.filter(con => con.trim() !== '')
              }));

              onOptionsCreated(cleanedOptions);
              toast.success(t('decision.toasts.optionsCreatedSuccessfully'));
            }}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? t('decision.manualOptions.saving') : t('decision.manualOptions.finishAndSave')}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Section Questions de suivi - bloc séparé comme les critères */}
    {onFollowUpQuestion && dilemma && (
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>{t('decision.manualOptions.createFollowUpQuestion')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('decision.manualOptions.followUpDescription')}
            </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => onFollowUpQuestion(dilemma)}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('decision.manualOptions.createFollowUpQuestion')}
          </Button>
        </CardContent>
      </Card>
    )}

  </div>
  );
};

export default ManualOptionsCreator;


