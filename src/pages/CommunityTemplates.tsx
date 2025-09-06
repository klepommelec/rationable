
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { getCommunityTemplates } from '@/services/communityTemplateService';
import { shareTemplateForPreview } from '@/services/templatePreviewService';
import { PERSONAL_TEMPLATES, PROFESSIONAL_TEMPLATES } from '@/data/predefinedTemplates';
import { useContextualContent } from '@/hooks/useContextualContent';
import TemplateFilters from '@/components/templates/TemplateFilters';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';

const CommunityTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_copied'>('newest');
  const [showPredefined, setShowPredefined] = useState(false);
  const { context } = useContextualContent();
  const { t } = useI18nUI();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getCommunityTemplates({
        search: search || undefined,
        category: categoryFilter || undefined,
        sortBy,
        limit: 50,
      });
      setTemplates(data);
      // Si aucun template communautaire, afficher les prédéfinis
      setShowPredefined(data.length === 0);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error(t('templates.errors.loadError'));
      // En cas d'erreur, afficher les templates prédéfinis
      setShowPredefined(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [search, categoryFilter, sortBy]);

  const handleOpenTemplate = async (template: any) => {
    try {
      console.log('🔄 Opening template:', template.title);
      
      // Créer un aperçu temporaire du template dans Supabase
      const previewId = await shareTemplateForPreview(template.decision_data);
      
      if (!previewId) {
        toast.error(t('templates.errors.rateLimitError') || 'Limite de création de previews atteinte. Veuillez patienter quelques minutes.');
        return;
      }
      
      // Ouvrir l'aperçu dans un nouvel onglet
      const previewUrl = `/template-preview/${previewId}`;
      console.log('🌐 Opening template preview URL:', previewUrl);
      window.open(previewUrl, '_blank');
      
    } catch (error) {
      console.error('❌ Error opening template:', error);
      toast.error(t('templates.errors.openError'));
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('');
  };

  const filteredPersonalTemplates = PERSONAL_TEMPLATES.filter(template => {
    const matchesSearch = !search || 
      template.title.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredProfessionalTemplates = PROFESSIONAL_TEMPLATES.filter(template => {
    const matchesSearch = !search || 
      template.title.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('templates.page.title')}</h1>
        <p className="text-muted-foreground">
          {t('templates.page.description')}
        </p>
      </div>

      <TemplateFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      ) : (
        <TemplateGrid
          templates={templates}
          showPredefined={showPredefined}
          filteredPersonalTemplates={filteredPersonalTemplates}
          filteredProfessionalTemplates={filteredProfessionalTemplates}
          onOpenTemplate={handleOpenTemplate}
          onResetFilters={handleResetFilters}
          userContext={context}
        />
      )}

      {/* Plus besoin de AuthModal */}
    </div>
  );
};

export default CommunityTemplates;
