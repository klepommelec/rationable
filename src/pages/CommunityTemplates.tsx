import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Heart, Search, Filter, User, Briefcase, Eye } from "lucide-react";
import { DEFAULT_CATEGORIES } from '@/types/decision';
import { CommunityTemplate, getCommunityTemplates, copyTemplate } from '@/services/communityTemplateService';
import { shareDecision } from '@/services/sharedDecisionService';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import { useDecisionHistory } from '@/hooks/useDecisionHistory';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

// Templates prédéfinis pour usage personnel avec analyses réelles
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
      ],
      result: {
        recommendation: 'iPhone 15 Pro',
        description: 'Après analyse comparative, l\'iPhone 15 Pro offre le meilleur équilibre entre performance, qualité photo et écosystème intégré pour un usage polyvalent.',
        breakdown: [
          {
            option: 'iPhone 15 Pro',
            score: 9.2,
            pros: ['Excellent appareil photo', 'Performance exceptionnelle', 'Écosystème intégré', 'Finition premium'],
            cons: ['Prix élevé', 'Écosystème fermé']
          },
          {
            option: 'Samsung Galaxy S24 Ultra',
            score: 8.8,
            pros: ['S Pen inclus', 'Écran superbe', 'Autonomie solide', 'Zoom exceptionnel'],
            cons: ['Interface parfois complexe', 'Prix premium']
          },
          {
            option: 'Google Pixel 8 Pro',
            score: 8.5,
            pros: ['IA photographique avancée', 'Android pur', 'Mises à jour garanties', 'Prix plus accessible'],
            cons: ['Disponibilité limitée', 'Autonomie moyenne']
          }
        ],
        infoLinks: [
          { title: 'Comparatif smartphones 2024', url: 'https://www.google.com/search?q=comparatif+smartphones+2024' },
          { title: 'Guide achat smartphone', url: 'https://www.google.com/search?q=guide+achat+smartphone' }
        ],
        shoppingLinks: [
          { title: 'iPhone 15 Pro - Apple Store', url: 'https://www.google.com/search?q=iPhone+15+Pro+prix' },
          { title: 'Galaxy S24 Ultra - Samsung', url: 'https://www.google.com/search?q=Galaxy+S24+Ultra+prix' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Portugal (Lisbonne & Porto)',
        description: 'Le Portugal offre un excellent rapport qualité-prix avec une richesse culturelle, un climat agréable et une gastronomie exceptionnelle, parfait pour des vacances d\'été variées.',
        breakdown: [
          {
            option: 'Portugal (Lisbonne & Porto)',
            score: 9.1,
            pros: ['Excellent rapport qualité-prix', 'Culture riche', 'Gastronomie exceptionnelle', 'Climat parfait'],
            cons: ['Affluence touristique', 'Chaleur en août']
          },
          {
            option: 'Grèce (Îles Cyclades)',
            score: 8.7,
            pros: ['Paysages magnifiques', 'Histoire fascinante', 'Plages paradisiaques', 'Cuisine méditerranéenne'],
            cons: ['Prix élevés en été', 'Très touristique']
          },
          {
            option: 'Croatie (Côte Dalmate)',
            score: 8.4,
            pros: ['Eau cristalline', 'Patrimoine préservé', 'Nature exceptionnelle', 'Moins cher que l\'Italie'],
            cons: ['Foules en été', 'Locations limitées']
          }
        ],
        infoLinks: [
          { title: 'Guide voyage Portugal', url: 'https://www.google.com/search?q=guide+voyage+Portugal+été' },
          { title: 'Destinations Europe été', url: 'https://www.google.com/search?q=meilleures+destinations+Europe+été' }
        ],
        shoppingLinks: [
          { title: 'Vols vers Lisbonne', url: 'https://www.google.com/search?q=vol+Paris+Lisbonne' },
          { title: 'Hôtels Porto', url: 'https://www.google.com/search?q=hôtel+Porto+réservation' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Toyota Corolla Hybrid',
        description: 'La Toyota Corolla Hybrid combine parfaitement fiabilité légendaire, consommation réduite et coût de possession optimal pour un usage quotidien.',
        breakdown: [
          {
            option: 'Toyota Corolla Hybrid',
            score: 9.0,
            pros: ['Fiabilité exceptionnelle', 'Consommation très faible', 'Coût d\'entretien réduit', 'Bonne revente'],
            cons: ['Design conservateur', 'Performances modestes']
          },
          {
            option: 'Volkswagen Golf',
            score: 8.3,
            pros: ['Qualité de finition', 'Conduite agréable', 'Technologie embarquée', 'Polyvalence'],
            cons: ['Prix d\'achat élevé', 'Entretien coûteux']
          },
          {
            option: 'Peugeot 308',
            score: 7.8,
            pros: ['Confort excellent', 'Design moderne', 'Prix attractif', 'Garantie étendue'],
            cons: ['Fiabilité perfectible', 'Revente difficile']
          }
        ],
        infoLinks: [
          { title: 'Comparatif voitures compactes', url: 'https://www.google.com/search?q=comparatif+voitures+compactes+2024' },
          { title: 'Guide achat voiture hybride', url: 'https://www.google.com/search?q=guide+achat+voiture+hybride' }
        ],
        shoppingLinks: [
          { title: 'Toyota Corolla - Configurateur', url: 'https://www.google.com/search?q=Toyota+Corolla+Hybrid+prix+neuf' },
          { title: 'Occasions certifiées', url: 'https://www.google.com/search?q=voiture+occasion+certifiée' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Quartier Montparnasse (Paris 14e)',
        description: 'Montparnasse offre un excellent équilibre entre accessibilité, services et qualité de vie, avec des loyers plus abordables que le centre de Paris.',
        breakdown: [
          {
            option: 'Montparnasse (14e)',
            score: 8.6,
            pros: ['Hub transport majeur', 'Nombreux commerces', 'Quartier vivant', 'Prix raisonnables'],
            cons: ['Affluence gare', 'Travaux fréquents']
          },
          {
            option: 'Belleville (20e)',
            score: 8.2,
            pros: ['Ambiance authentique', 'Prix attractifs', 'Diversité culturelle', 'Vie nocturne'],
            cons: ['Gentrification rapide', 'Nuisances sonores']
          },
          {
            option: 'Neuilly-sur-Seine',
            score: 7.4,
            pros: ['Quartier sécurisé', 'Écoles réputées', 'Espaces verts', 'Prestige'],
            cons: ['Loyers très élevés', 'Manque d\'animation']
          }
        ],
        infoLinks: [
          { title: 'Guide quartiers Paris', url: 'https://www.google.com/search?q=meilleurs+quartiers+Paris+vivre' },
          { title: 'Prix immobilier Paris', url: 'https://www.google.com/search?q=prix+immobilier+Paris+arrondissement' }
        ],
        shoppingLinks: [
          { title: 'Recherche appartement Paris 14', url: 'https://www.google.com/search?q=appartement+location+Paris+14' },
          { title: 'Estimation loyer', url: 'https://www.google.com/search?q=estimation+loyer+Paris' }
        ]
      }
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

// Templates prédéfinis pour usage professionnel avec analyses réelles
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
      ],
      result: {
        recommendation: 'Accepter l\'offre avec négociation',
        description: 'L\'offre présente un potentiel d\'évolution intéressant et une culture d\'entreprise alignée avec vos valeurs. Une négociation salariale permettrait d\'optimiser le package.',
        breakdown: [
          {
            option: 'Accepter l\'offre actuelle',
            score: 7.8,
            pros: ['Évolution claire', 'Bonne culture d\'entreprise', 'Projets stimulants', 'Équipe qualifiée'],
            cons: ['Salaire en dessous du marché', 'Peu de télétravail']
          },
          {
            option: 'Négocier puis accepter',
            score: 9.1,
            pros: ['Meilleur package total', 'Flexibilité horaires', 'Formation incluse', 'Évolution rapide'],
            cons: ['Négociation délicate', 'Attentes élevées']
          },
          {
            option: 'Refuser et continuer recherche',
            score: 6.2,
            pros: ['Autres opportunités', 'Pas de précipitation', 'Meilleur choix possible'],
            cons: ['Incertitude marché', 'Opportunité manquée', 'Recherche prolongée']
          }
        ],
        infoLinks: [
          { title: 'Guide négociation salariale', url: 'https://www.google.com/search?q=guide+négociation+salaire+emploi' },
          { title: 'Évaluer une offre d\'emploi', url: 'https://www.google.com/search?q=comment+évaluer+offre+emploi' }
        ],
        shoppingLinks: [
          { title: 'Salaires par poste', url: 'https://www.google.com/search?q=grille+salaire+développeur+France' },
          { title: 'Avis entreprises', url: 'https://www.google.com/search?q=avis+salariés+entreprise' }
        ]
      }
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
  
  const { setDilemma, setCriteria, setEmoji, clearSession, loadDecision } = useDecisionMaker();
  const { addDecision } = useDecisionHistory();
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
      console.log('🔄 Copying community template:', template.title);
      
      // Copy the template data to the decision maker with full analysis
      clearSession();
      
      // Si le template a déjà un résultat d'analyse, l'utiliser
      if (template.decision_data.result) {
        console.log('📋 Template has analysis, creating decision in history');
        
        // Créer une nouvelle décision dans l'historique
        const newDecision = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          dilemma: template.decision_data.dilemma,
          emoji: template.decision_data.emoji,
          criteria: template.decision_data.criteria,
          result: template.decision_data.result,
          category: template.category
        };
        
        console.log('💾 Adding decision to history:', newDecision.id);
        addDecision(newDecision);
        
        // Naviguer vers la home page
        console.log('🏠 Navigating to home page');
        navigate('/');
        
        // Attendre que l'historique soit sauvegardé puis charger la décision
        setTimeout(() => {
          console.log('🔄 Loading decision after navigation:', newDecision.id);
          // Vérifier que la décision existe dans l'historique avant de la charger
          const decisionExists = history.find(d => d.id === newDecision.id);
          if (decisionExists) {
            loadDecision(newDecision.id);
          } else {
            console.log('⏳ Decision not yet in history, trying again...');
            setTimeout(() => loadDecision(newDecision.id), 100);
          }
        }, 600); // Attendre plus longtemps que le debounce de 500ms
      } else {
        // Si pas de résultat, juste copier les données de base
        console.log('📝 Template has no analysis, copying basic data');
        setDilemma(template.decision_data.dilemma);
        setCriteria(template.decision_data.criteria);
        setEmoji(template.decision_data.emoji);
        navigate('/');
      }
      
      // Increment copy count only for real community templates
      if (!template.id.startsWith('personal-') && !template.id.startsWith('pro-')) {
        await copyTemplate(template.id);
      }
      
      toast.success(`Template "${template.title}" copié avec succès !`);
    } catch (error) {
      console.error('❌ Error copying template:', error);
      toast.error("Erreur lors de la copie du template");
    } finally {
      setCopying(null);
    }
  };

  const handleCopyPredefinedTemplate = (template: any) => {
    setCopying(template.id);
    try {
      console.log('🔄 Copying predefined template:', template.title);
      
      clearSession();
      
      if (template.decision_data.result) {
        console.log('📋 Predefined template has analysis, creating decision in history');
        
        // Créer une nouvelle décision dans l'historique
        const newDecision = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          dilemma: template.decision_data.dilemma,
          emoji: template.decision_data.emoji,
          criteria: template.decision_data.criteria,
          result: template.decision_data.result,
          category: template.category
        };
        
        console.log('💾 Adding predefined decision to history:', newDecision.id);
        addDecision(newDecision);
        
        // Naviguer vers la home page
        console.log('🏠 Navigating to home page');
        navigate('/');
        
        // Attendre que l'historique soit sauvegardé puis charger la décision
        setTimeout(() => {
          console.log('🔄 Loading predefined decision after navigation:', newDecision.id);
          // Vérifier que la décision existe dans l'historique avant de la charger
          const decisionExists = history.find(d => d.id === newDecision.id);
          if (decisionExists) {
            loadDecision(newDecision.id);
          } else {
            console.log('⏳ Predefined decision not yet in history, trying again...');
            setTimeout(() => loadDecision(newDecision.id), 100);
          }
        }, 600); // Attendre plus longtemps que le debounce de 500ms
      } else {
        // Si pas de résultat, juste copier les données de base
        console.log('📝 Predefined template has no analysis, copying basic data');
        setDilemma(template.decision_data.dilemma);
        setCriteria(template.decision_data.criteria);
        setEmoji(template.decision_data.emoji);
        navigate('/');
      }
      
      toast.success(`Template "${template.title}" copié avec succès !`);
    } catch (error) {
      console.error('❌ Error copying predefined template:', error);
      toast.error("Erreur lors de la copie du template");
    } finally {
      setCopying(null);
    }
  };

  const handleOpenTemplate = async (template: any) => {
    try {
      // Utiliser directement les données du template avec l'analyse réelle
      const publicId = await shareDecision(template.decision_data);
      
      // Open the shared decision in a new tab
      window.open(`/shared/${publicId}`, '_blank');
      
    } catch (error) {
      console.error('Error opening template:', error);
      toast.error("Erreur lors de l'ouverture du template");
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

  const TemplatePreviewDialog = ({ template, trigger }: { template: any, trigger: React.ReactNode }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {template.decision_data.emoji} {template.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Dilemme</h4>
              <p className="text-muted-foreground">{template.decision_data.dilemma}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Critères d'évaluation</h4>
              <div className="grid grid-cols-1 gap-2">
                {template.decision_data.criteria.map((criterion: any, index: number) => (
                  <div key={criterion.id || index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>{criterion.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {template.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{template.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

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
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenTemplate(template)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ouvrir
                          </Button>
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
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenTemplate(template)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ouvrir
                          </Button>
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
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ouvrir
                      </Button>
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
