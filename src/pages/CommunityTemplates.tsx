
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, Search, Filter, User, Briefcase } from "lucide-react";
import { DEFAULT_CATEGORIES } from '@/types/decision';
import { CommunityTemplate, getCommunityTemplates, copyTemplate } from '@/services/communityTemplateService';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

// Templates prédéfinis pour usage personnel
const PERSONAL_TEMPLATES = [
  {
    id: 'personal-1',
    title: 'Choisir un smartphone',
    description: 'Comparaison de différents smartphones selon le budget, les performances et les besoins',
    category: 'tech',
    tags: ['smartphone', 'technologie', 'budget'],
    decision_data: {
      dilemma: 'Quel smartphone devrais-je acheter pour remplacer mon ancien téléphone ?',
      emoji: '📱',
      criteria: [
        { id: '1', name: 'Prix' },
        { id: '2', name: 'Qualité photo' },
        { id: '3', name: 'Autonomie' },
        { id: '4', name: 'Performance' }
      ]
    }
  },
  {
    id: 'personal-2',
    title: 'Destination de vacances',
    description: 'Choisir la destination idéale selon le budget, les activités et la période',
    category: 'travel',
    tags: ['voyage', 'vacances', 'destination'],
    decision_data: {
      dilemma: 'Où devrais-je partir pour mes prochaines vacances d\'été ?',
      emoji: '✈️',
      criteria: [
        { id: '1', name: 'Budget' },
        { id: '2', name: 'Activités disponibles' },
        { id: '3', name: 'Climat' },
        { id: '4', name: 'Culture locale' }
      ]
    }
  },
  {
    id: 'personal-3',
    title: 'Achat de voiture',
    description: 'Sélection d\'un véhicule selon les besoins, le budget et les préférences',
    category: 'lifestyle',
    tags: ['voiture', 'transport', 'budget'],
    decision_data: {
      dilemma: 'Quelle voiture devrais-je acheter selon mon budget et mes besoins ?',
      emoji: '🚗',
      criteria: [
        { id: '1', name: 'Prix d\'achat' },
        { id: '2', name: 'Consommation' },
        { id: '3', name: 'Fiabilité' },
        { id: '4', name: 'Espace' }
      ]
    }
  },
  {
    id: 'personal-4',
    title: 'Choix de logement',
    description: 'Sélectionner un appartement ou une maison selon les critères importants',
    category: 'lifestyle',
    tags: ['logement', 'immobilier', 'location'],
    decision_data: {
      dilemma: 'Dans quel quartier devrais-je déménager ?',
      emoji: '🏠',
      criteria: [
        { id: '1', name: 'Prix du loyer' },
        { id: '2', name: 'Proximité transports' },
        { id: '3', name: 'Sécurité' },
        { id: '4', name: 'Commerces' }
      ]
    }
  },
  {
    id: 'personal-5',
    title: 'Investissement financier',
    description: 'Décider comment investir ses économies de manière optimale',
    category: 'finance',
    tags: ['investissement', 'épargne', 'finance'],
    decision_data: {
      dilemma: 'Comment devrais-je investir mes économies cette année ?',
      emoji: '💰',
      criteria: [
        { id: '1', name: 'Rendement attendu' },
        { id: '2', name: 'Niveau de risque' },
        { id: '3', name: 'Liquidité' },
        { id: '4', name: 'Horizon d\'investissement' }
      ]
    }
  },
  {
    id: 'personal-6',
    title: 'Salle de sport',
    description: 'Choisir la meilleure salle de sport selon ses objectifs et contraintes',
    category: 'health',
    tags: ['sport', 'fitness', 'santé'],
    decision_data: {
      dilemma: 'Dans quelle salle de sport devrais-je m\'inscrire ?',
      emoji: '🏋️',
      criteria: [
        { id: '1', name: 'Prix mensuel' },
        { id: '2', name: 'Équipements' },
        { id: '3', name: 'Proximité' },
        { id: '4', name: 'Horaires d\'ouverture' }
      ]
    }
  },
  {
    id: 'personal-7',
    title: 'Console de jeux',
    description: 'Sélectionner la console de jeux vidéo la plus adaptée',
    category: 'tech',
    tags: ['gaming', 'console', 'divertissement'],
    decision_data: {
      dilemma: 'Quelle console de jeux vidéo devrais-je acheter ?',
      emoji: '🎮',
      criteria: [
        { id: '1', name: 'Catalogue de jeux' },
        { id: '2', name: 'Prix' },
        { id: '3', name: 'Performance' },
        { id: '4', name: 'Exclusivités' }
      ]
    }
  },
  {
    id: 'personal-8',
    title: 'Choix de restaurant',
    description: 'Sélectionner un restaurant pour une occasion spéciale',
    category: 'lifestyle',
    tags: ['restaurant', 'cuisine', 'sortie'],
    decision_data: {
      dilemma: 'Dans quel restaurant devrions-nous aller ce soir ?',
      emoji: '🍽️',
      criteria: [
        { id: '1', name: 'Type de cuisine' },
        { id: '2', name: 'Prix' },
        { id: '3', name: 'Ambiance' },
        { id: '4', name: 'Localisation' }
      ]
    }
  },
  {
    id: 'personal-9',
    title: 'Abonnement streaming',
    description: 'Choisir la meilleure plateforme de streaming selon ses goûts',
    category: 'tech',
    tags: ['streaming', 'divertissement', 'abonnement'],
    decision_data: {
      dilemma: 'À quelle plateforme de streaming devrais-je m\'abonner ?',
      emoji: '📺',
      criteria: [
        { id: '1', name: 'Contenu disponible' },
        { id: '2', name: 'Prix mensuel' },
        { id: '3', name: 'Qualité vidéo' },
        { id: '4', name: 'Interface' }
      ]
    }
  },
  {
    id: 'personal-10',
    title: 'Animal de compagnie',
    description: 'Décider quel animal adopter selon son mode de vie',
    category: 'lifestyle',
    tags: ['animal', 'adoption', 'responsabilité'],
    decision_data: {
      dilemma: 'Quel animal de compagnie devrais-je adopter ?',
      emoji: '🐕',
      criteria: [
        { id: '1', name: 'Temps disponible' },
        { id: '2', name: 'Espace logement' },
        { id: '3', name: 'Coût d\'entretien' },
        { id: '4', name: 'Affinités' }
      ]
    }
  }
];

// Templates prédéfinis pour usage professionnel
const PROFESSIONAL_TEMPLATES = [
  {
    id: 'pro-1',
    title: 'Opportunité de carrière',
    description: 'Évaluer une offre d\'emploi selon différents critères professionnels',
    category: 'career',
    tags: ['emploi', 'carrière', 'opportunité'],
    decision_data: {
      dilemma: 'Devrais-je accepter cette nouvelle offre d\'emploi ?',
      emoji: '💼',
      criteria: [
        { id: '1', name: 'Salaire proposé' },
        { id: '2', name: 'Évolution possible' },
        { id: '3', name: 'Équilibre vie pro/perso' },
        { id: '4', name: 'Culture d\'entreprise' }
      ]
    }
  },
  {
    id: 'pro-2',
    title: 'Framework de développement',
    description: 'Choisir la meilleure technologie pour un nouveau projet',
    category: 'tech',
    tags: ['développement', 'framework', 'technologie'],
    decision_data: {
      dilemma: 'Quel framework JavaScript devrais-je apprendre en 2025 ?',
      emoji: '💻',
      criteria: [
        { id: '1', name: 'Popularité du marché' },
        { id: '2', name: 'Courbe d\'apprentissage' },
        { id: '3', name: 'Performance' },
        { id: '4', name: 'Écosystème' }
      ]
    }
  },
  {
    id: 'pro-3',
    title: 'Formation professionnelle',
    description: 'Sélectionner une formation pour développer ses compétences',
    category: 'education',
    tags: ['formation', 'compétences', 'développement'],
    decision_data: {
      dilemma: 'Quelle formation devrais-je suivre pour évoluer dans ma carrière ?',
      emoji: '🎓',
      criteria: [
        { id: '1', name: 'Pertinence métier' },
        { id: '2', name: 'Reconnaissance' },
        { id: '3', name: 'Durée' },
        { id: '4', name: 'Coût' }
      ]
    }
  },
  {
    id: 'pro-4',
    title: 'Outil de gestion de projet',
    description: 'Choisir la meilleure solution pour organiser le travail d\'équipe',
    category: 'tech',
    tags: ['gestion', 'productivité', 'équipe'],
    decision_data: {
      dilemma: 'Quel outil de gestion de projet adopter pour mon équipe ?',
      emoji: '📊',
      criteria: [
        { id: '1', name: 'Facilité d\'utilisation' },
        { id: '2', name: 'Fonctionnalités' },
        { id: '3', name: 'Intégrations' },
        { id: '4', name: 'Prix' }
      ]
    }
  },
  {
    id: 'pro-5',
    title: 'Stratégie marketing',
    description: 'Définir la meilleure approche marketing pour un nouveau produit',
    category: 'career',
    tags: ['marketing', 'stratégie', 'lancement'],
    decision_data: {
      dilemma: 'Quelle stratégie marketing adopter pour lancer mon produit ?',
      emoji: '📢',
      criteria: [
        { id: '1', name: 'Budget disponible' },
        { id: '2', name: 'Audience cible' },
        { id: '3', name: 'Canaux efficaces' },
        { id: '4', name: 'Mesurabilité' }
      ]
    }
  },
  {
    id: 'pro-6',
    title: 'Fournisseur professionnel',
    description: 'Sélectionner le meilleur partenaire pour ses besoins business',
    category: 'career',
    tags: ['fournisseur', 'partenariat', 'business'],
    decision_data: {
      dilemma: 'Quel fournisseur choisir pour nos besoins en entreprise ?',
      emoji: '🤝',
      criteria: [
        { id: '1', name: 'Qualité service' },
        { id: '2', name: 'Prix' },
        { id: '3', name: 'Fiabilité' },
        { id: '4', name: 'Support client' }
      ]
    }
  },
  {
    id: 'pro-7',
    title: 'Espace de travail',
    description: 'Choisir entre télétravail, bureau ou espace de coworking',
    category: 'career',
    tags: ['bureau', 'télétravail', 'productivité'],
    decision_data: {
      dilemma: 'Où devrais-je travailler pour être le plus productif ?',
      emoji: '🏢',
      criteria: [
        { id: '1', name: 'Productivité' },
        { id: '2', name: 'Coût' },
        { id: '3', name: 'Collaboration' },
        { id: '4', name: 'Équilibre vie privée' }
      ]
    }
  },
  {
    id: 'pro-8',
    title: 'Investissement entreprise',
    description: 'Décider dans quoi investir pour développer son business',
    category: 'finance',
    tags: ['investissement', 'croissance', 'business'],
    decision_data: {
      dilemma: 'Dans quoi investir en priorité pour développer mon entreprise ?',
      emoji: '💼',
      criteria: [
        { id: '1', name: 'ROI attendu' },
        { id: '2', name: 'Impact sur la croissance' },
        { id: '3', name: 'Risque' },
        { id: '4', name: 'Urgence' }
      ]
    }
  },
  {
    id: 'pro-9',
    title: 'Recrutement candidat',
    description: 'Évaluer et sélectionner le meilleur candidat pour un poste',
    category: 'career',
    tags: ['recrutement', 'équipe', 'compétences'],
    decision_data: {
      dilemma: 'Quel candidat recruter pour ce poste stratégique ?',
      emoji: '👥',
      criteria: [
        { id: '1', name: 'Compétences techniques' },
        { id: '2', name: 'Fit culturel' },
        { id: '3', name: 'Expérience' },
        { id: '4', name: 'Potentiel d\'évolution' }
      ]
    }
  },
  {
    id: 'pro-10',
    title: 'Pricing produit',
    description: 'Définir la stratégie de prix optimale pour un produit ou service',
    category: 'finance',
    tags: ['prix', 'stratégie', 'revenus'],
    decision_data: {
      dilemma: 'Quelle stratégie de prix adopter pour maximiser les revenus ?',
      emoji: '💲',
      criteria: [
        { id: '1', name: 'Coûts de production' },
        { id: '2', name: 'Prix concurrence' },
        { id: '3', name: 'Valeur perçue' },
        { id: '4', name: 'Volume de ventes' }
      ]
    }
  }
];

const CommunityTemplates = () => {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_copied'>('newest');
  const [copying, setCopying] = useState<string | null>(null);
  const [showPredefined, setShowPredefined] = useState(false);
  
  const { setDilemma, setCriteria, setEmoji, clearSession } = useDecisionMaker();
  const navigate = useNavigate();

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
      toast.error("Erreur lors du chargement des templates");
      // En cas d'erreur, afficher les templates prédéfinis
      setShowPredefined(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [search, categoryFilter, sortBy]);

  const handleCopyTemplate = async (template: CommunityTemplate) => {
    setCopying(template.id);
    try {
      // Copy the template data to the decision maker
      clearSession();
      setDilemma(template.decision_data.dilemma);
      setCriteria(template.decision_data.criteria);
      setEmoji(template.decision_data.emoji);
      
      // Increment copy count only for real community templates
      if (!template.id.startsWith('personal-') && !template.id.startsWith('pro-')) {
        await copyTemplate(template.id);
      }
      
      toast.success(`Template "${template.title}" copié ! Vous pouvez maintenant le personnaliser.`);
      navigate('/');
    } catch (error) {
      console.error('Error copying template:', error);
      toast.error("Erreur lors de la copie du template");
    } finally {
      setCopying(null);
    }
  };

  const handleCopyPredefinedTemplate = (template: any) => {
    setCopying(template.id);
    try {
      clearSession();
      setDilemma(template.decision_data.dilemma);
      setCriteria(template.decision_data.criteria);
      setEmoji(template.decision_data.emoji);
      
      toast.success(`Template "${template.title}" copié ! Vous pouvez maintenant le personnaliser.`);
      navigate('/');
    } catch (error) {
      console.error('Error copying template:', error);
      toast.error("Erreur lors de la copie du template");
    } finally {
      setCopying(null);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId) || { name: categoryId, emoji: '🤔' };
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
        <h1 className="text-3xl font-bold mb-2">Templates Communautaires</h1>
        <p className="text-muted-foreground">
          Découvrez et utilisez des templates créés par la communauté pour vous aider dans vos décisions.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {DEFAULT_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Plus récents</SelectItem>
            <SelectItem value="popular">Plus populaires</SelectItem>
            <SelectItem value="most_copied">Plus copiés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : showPredefined ? (
        <div className="space-y-8">
          {/* Templates personnels */}
          {filteredPersonalTemplates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Usage Personnel</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPersonalTemplates.map((template) => {
                  const categoryInfo = getCategoryInfo(template.category);
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {categoryInfo.emoji} {categoryInfo.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {template.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleCopyPredefinedTemplate(template)}
                            disabled={copying === template.id}
                          >
                            {copying === template.id ? (
                              <>Copie...</>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Utiliser
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Templates professionnels */}
          {filteredProfessionalTemplates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold">Usage Professionnel</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessionalTemplates.map((template) => {
                  const categoryInfo = getCategoryInfo(template.category);
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {categoryInfo.emoji} {categoryInfo.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {template.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleCopyPredefinedTemplate(template)}
                            disabled={copying === template.id}
                          >
                            {copying === template.id ? (
                              <>Copie...</>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Utiliser
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {filteredPersonalTemplates.length === 0 && filteredProfessionalTemplates.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg mb-4">
                  Aucun template trouvé pour vos critères de recherche.
                </p>
                <Button onClick={() => { setSearch(''); setCategoryFilter(''); }}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : templates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground text-lg mb-4">
              Aucun template trouvé pour vos critères de recherche.
            </p>
            <Button onClick={() => { setSearch(''); setCategoryFilter(''); }}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category || 'other');
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {categoryInfo.emoji} {categoryInfo.name}
                        </Badge>
                        {template.author_name && (
                          <span className="text-sm text-muted-foreground">
                            par {template.author_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {template.description}
                    </p>
                  )}
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        {template.copy_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {template.like_count}
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleCopyTemplate(template)}
                      disabled={copying === template.id}
                    >
                      {copying === template.id ? (
                        <>Copie...</>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copier
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityTemplates;
