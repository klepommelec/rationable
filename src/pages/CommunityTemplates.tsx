import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Search, Filter, User, Briefcase, Eye } from "lucide-react";
import { DEFAULT_CATEGORIES } from '@/types/decision';
import { CommunityTemplate, getCommunityTemplates } from '@/services/communityTemplateService';
import { shareDecision } from '@/services/sharedDecisionService';
import { toast } from "sonner";

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
      ],
      result: {
        recommendation: 'ETF World diversifié + Épargne sécurisée',
        description: 'Une approche équilibrée combinant 70% d\'ETF world pour la croissance long terme et 30% d\'épargne sécurisée pour la stabilité et les opportunités.',
        breakdown: [
          {
            option: 'ETF World diversifié + Épargne',
            score: 8.9,
            pros: ['Diversification maximale', 'Frais très faibles', 'Liquidité élevée', 'Croissance long terme'],
            cons: ['Volatilité court terme', 'Pas de capital garanti']
          },
          {
            option: 'Immobilier locatif',
            score: 8.1,
            pros: ['Revenus réguliers', 'Effet de levier', 'Tangible', 'Avantages fiscaux'],
            cons: ['Illiquide', 'Gestion contraignante', 'Risques locataires']
          },
          {
            option: 'Livret A + Assurance vie fonds euros',
            score: 6.8,
            pros: ['Capital garanti', 'Disponibilité immédiate', 'Sécurité maximale', 'Avantages fiscaux AV'],
            cons: ['Rendement très faible', 'Inflation non couverte', 'Opportunité manquée']
          }
        ],
        infoLinks: [
          { title: 'Guide investissement débutant', url: 'https://www.google.com/search?q=guide+investissement+débutant+ETF' },
          { title: 'Comparatif brokers ETF', url: 'https://www.google.com/search?q=meilleur+courtier+ETF+France' }
        ],
        shoppingLinks: [
          { title: 'Boursorama - ETF World', url: 'https://www.google.com/search?q=Boursorama+ETF+World+MSCI' },
          { title: 'Fortuneo - PEA', url: 'https://www.google.com/search?q=Fortuneo+PEA+frais' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Basic-Fit',
        description: 'Basic-Fit offre le meilleur rapport qualité-prix avec des équipements modernes, une accessibilité 24h/7j et de nombreuses salles en réseau.',
        breakdown: [
          {
            option: 'Basic-Fit',
            score: 8.7,
            pros: ['Prix très attractif', 'Réseau étendu', 'Ouvert 24h/7j', 'Équipements récents'],
            cons: ['Affluence aux heures de pointe', 'Pas de cours collectifs premium']
          },
          {
            option: 'L\'Orange Bleue',
            score: 8.3,
            pros: ['Cours collectifs variés', 'Coaching personnalisé', 'Ambiance conviviale', 'Piscine dans certaines salles'],
            cons: ['Prix plus élevé', 'Horaires limités le weekend']
          },
          {
            option: 'Salle municipale',
            score: 7.2,
            pros: ['Tarif très bas', 'Proximité quartier', 'Ambiance familiale', 'Créneaux réservés seniors'],
            cons: ['Équipements vieillissants', 'Horaires restreints', 'Peu d\'innovations']
          }
        ],
        infoLinks: [
          { title: 'Comparatif salles de sport', url: 'https://www.google.com/search?q=comparatif+salles+sport+France+2024' },
          { title: 'Programme musculation débutant', url: 'https://www.google.com/search?q=programme+musculation+débutant' }
        ],
        shoppingLinks: [
          { title: 'Basic-Fit - Abonnement', url: 'https://www.google.com/search?q=Basic+Fit+abonnement+tarif' },
          { title: 'L\'Orange Bleue - Tarifs', url: 'https://www.google.com/search?q=Orange+Bleue+prix+abonnement' }
        ]
      }
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
      ],
      result: {
        recommendation: 'PlayStation 5',
        description: 'La PS5 offre l\'expérience gaming la plus complète avec ses exclusivités remarquables, ses performances exceptionnelles et son catalogue riche.',
        breakdown: [
          {
            option: 'PlayStation 5',
            score: 9.1,
            pros: ['Exclusivités exceptionnelles', 'SSD ultra-rapide', 'Manette DualSense innovante', 'Rétrocompatibilité PS4'],
            cons: ['Prix élevé', 'Taille imposante', 'Stock encore limité']
          },
          {
            option: 'Xbox Series X',
            score: 8.6,
            pros: ['Game Pass excellent', 'Puissance brute supérieure', 'Rétrocompatibilité étendue', 'Quick Resume'],
            cons: ['Moins d\'exclusivités', 'Design imposant']
          },
          {
            option: 'Nintendo Switch OLED',
            score: 8.3,
            pros: ['Polyvalence portable/TV', 'Exclusivités Nintendo', 'Écran OLED magnifique', 'Gaming familial'],
            cons: ['Performances limitées', 'Stockage insuffisant', 'Prix des jeux élevé']
          }
        ],
        infoLinks: [
          { title: 'Comparatif consoles 2024', url: 'https://www.google.com/search?q=comparatif+consoles+2024+PS5+Xbox+Switch' },
          { title: 'Meilleurs jeux PS5', url: 'https://www.google.com/search?q=meilleurs+jeux+PS5+exclusivités' }
        ],
        shoppingLinks: [
          { title: 'PS5 - Stock disponible', url: 'https://www.google.com/search?q=PS5+stock+achat+prix' },
          { title: 'Xbox Series X - Prix', url: 'https://www.google.com/search?q=Xbox+Series+X+prix+disponibilité' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Restaurant italien traditionnel',
        description: 'Un restaurant italien offre l\'équilibre parfait entre qualité culinaire, ambiance chaleureuse et rapport qualité-prix pour une soirée réussie.',
        breakdown: [
          {
            option: 'Restaurant italien traditionnel',
            score: 8.8,
            pros: ['Cuisine familiale authentique', 'Ambiance conviviale', 'Prix raisonnables', 'Plats généreux'],
            cons: ['Peut être bruyant', 'Réservation nécessaire']
          },
          {
            option: 'Bistrot français gastronomique',
            score: 8.5,
            pros: ['Cuisine raffinée', 'Service impeccable', 'Cadre élégant', 'Vins exceptionnels'],
            cons: ['Prix élevé', 'Portions parfois petites', 'Ambiance formelle']
          },
          {
            option: 'Restaurant asiatique fusion',
            score: 7.9,
            pros: ['Cuisine originale', 'Présentation soignée', 'Options végétariennes', 'Service rapide'],
            cons: ['Saveurs parfois déroutantes', 'Ambiance moderne froide']
          }
        ],
        infoLinks: [
          { title: 'Meilleurs restaurants italiens Paris', url: 'https://www.google.com/search?q=meilleurs+restaurants+italiens+Paris' },
          { title: 'Réservation restaurant', url: 'https://www.google.com/search?q=réserver+restaurant+en+ligne' }
        ],
        shoppingLinks: [
          { title: 'LaFourchette - Réservation', url: 'https://www.google.com/search?q=LaFourchette+restaurant+italien' },
          { title: 'OpenTable - Paris', url: 'https://www.google.com/search?q=OpenTable+restaurant+Paris' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Netflix Standard',
        description: 'Netflix reste la référence avec le catalogue le plus riche, des productions originales de qualité et une interface intuitive pour tous les profils.',
        breakdown: [
          {
            option: 'Netflix Standard',
            score: 8.9,
            pros: ['Catalogue très vaste', 'Productions originales excellentes', 'Interface parfaite', 'Disponible partout'],
            cons: ['Prix en hausse', 'Contenu qui disparaît', 'Moins de films récents']
          },
          {
            option: 'Amazon Prime Video',
            score: 8.1,
            pros: ['Inclus avec Prime', 'Films récents disponibles', 'Séries originales réussies', 'Livraison gratuite bonus'],
            cons: ['Interface confuse', 'Contenu payant en plus', 'Catalogue français limité']
          },
          {
            option: 'Disney+',
            score: 7.6,
            pros: ['Contenu familial exceptionnel', 'Marvel, Star Wars inclus', 'Qualité 4K standard', 'Prix attractif'],
            cons: ['Catalogue adulte limité', 'Peu de nouveautés mensuelles', 'Contenu répétitif']
          }
        ],
        infoLinks: [
          { title: 'Comparatif plateformes streaming', url: 'https://www.google.com/search?q=comparatif+Netflix+Prime+Disney+2024' },
          { title: 'Nouveautés streaming ce mois', url: 'https://www.google.com/search?q=nouveautés+streaming+ce+mois' }
        ],
        shoppingLinks: [
          { title: 'Netflix - Abonnement', url: 'https://www.google.com/search?q=Netflix+abonnement+prix+France' },
          { title: 'Amazon Prime - Essai', url: 'https://www.google.com/search?q=Amazon+Prime+Video+essai+gratuit' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Chat d\'appartement',
        description: 'Un chat offre la compagnie idéale avec une autonomie adaptée à la vie moderne, des coûts maîtrisés et une grande affection sans contraintes majeures.',
        breakdown: [
          {
            option: 'Chat d\'appartement',
            score: 8.7,
            pros: ['Très autonome', 'Affectueux sans être envahissant', 'Coûts raisonnables', 'Adapté petit espace'],
            cons: ['Allergie possible', 'Litière à nettoyer', 'Griffures mobilier']
          },
          {
            option: 'Chien de petite taille',
            score: 7.8,
            pros: ['Compagnon très fidèle', 'Encourage les sorties', 'Sécurité du foyer', 'Interactions sociales'],
            cons: ['Sorties obligatoires 3x/jour', 'Coûts vétérinaires élevés', 'Contraintes vacances']
          },
          {
            option: 'Poissons tropicaux',
            score: 7.1,
            pros: ['Très peu contraignant', 'Apaisant à observer', 'Coût très faible', 'Pas d\'allergies'],
            cons: ['Interaction limitée', 'Aquarium à entretenir', 'Fragilité des poissons']
          }
        ],
        infoLinks: [
          { title: 'Guide adoption chat', url: 'https://www.google.com/search?q=guide+adoption+chat+appartement' },
          { title: 'Refuges animaux près de chez vous', url: 'https://www.google.com/search?q=refuge+animaux+adoption+chat' }
        ],
        shoppingLinks: [
          { title: 'Accessoires chat - Zooplus', url: 'https://www.google.com/search?q=accessoires+chat+Zooplus' },
          { title: 'Assurance animaux', url: 'https://www.google.com/search?q=assurance+santé+chat+prix' }
        ]
      }
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
      ],
      result: {
        recommendation: 'React avec Next.js',
        description: 'React reste le framework le plus demandé en 2025, avec Next.js qui apporte les fonctionnalités modernes nécessaires (SSR, optimisations, etc.).',
        breakdown: [
          {
            option: 'React + Next.js',
            score: 9.2,
            pros: ['Demande marché très forte', 'Écosystème mature', 'Meta-framework complet', 'Communauté énorme'],
            cons: ['Évolution rapide', 'Complexité croissante']
          },
          {
            option: 'Vue.js + Nuxt',
            score: 8.4,
            pros: ['Apprentissage plus facile', 'Documentation excellente', 'Performance native', 'Approche progressive'],
            cons: ['Marché plus restreint', 'Écosystème plus petit']
          },
          {
            option: 'Svelte + SvelteKit',
            score: 7.9,
            pros: ['Performance exceptionnelle', 'Syntaxe intuitive', 'Bundle size minimal', 'Développement rapide'],
            cons: ['Écosystème naissant', 'Adoption limitée en entreprise']
          }
        ],
        infoLinks: [
          { title: 'State of JS 2024', url: 'https://www.google.com/search?q=State+of+JS+2024+frameworks' },
          { title: 'Guide React débutant', url: 'https://www.google.com/search?q=apprendre+React+guide+débutant' }
        ],
        shoppingLinks: [
          { title: 'Formation React - Udemy', url: 'https://www.google.com/search?q=formation+React+Udemy' },
          { title: 'Bootcamp développement web', url: 'https://www.google.com/search?q=bootcamp+développement+web+React' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Certification Cloud AWS',
        description: 'La certification AWS Solutions Architect offre une reconnaissance immédiate sur le marché avec des compétences très demandées et un excellent ROI.',
        breakdown: [
          {
            option: 'Certification Cloud AWS',
            score: 9.0,
            pros: ['Très demandé sur le marché', 'Augmentation salariale immédiate', 'Reconnaissance mondiale', 'Compétences transversales'],
            cons: ['Examen technique exigeant', 'Coût de certification élevé']
          },
          {
            option: 'MBA Executive',
            score: 8.2,
            pros: ['Prestige reconnu', 'Réseau professionnel', 'Vision stratégique', 'Évolution management'],
            cons: ['Coût très élevé', 'Durée longue (2 ans)', 'ROI à long terme']
          },
          {
            option: 'Formation Data Science',
            score: 7.6,
            pros: ['Secteur en croissance', 'Salaires attractifs', 'Compétences recherchées', 'Applications variées'],
            cons: ['Prérequis mathématiques', 'Marché saturé junior', 'Évolution technologique rapide']
          }
        ],
        infoLinks: [
          { title: 'Guide certification AWS', url: 'https://www.google.com/search?q=certification+AWS+Solutions+Architect+guide' },
          { title: 'Salaires cloud computing', url: 'https://www.google.com/search?q=salaire+architecte+cloud+AWS+France' }
        ],
        shoppingLinks: [
          { title: 'Formation AWS - A Cloud Guru', url: 'https://www.google.com/search?q=formation+AWS+A+Cloud+Guru' },
          { title: 'CPF formations éligibles', url: 'https://www.google.com/search?q=formation+AWS+CPF+éligible' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Notion',
        description: 'Notion offre la flexibilité ultime pour créer un workspace personnalisé qui s\'adapte parfaitement aux besoins spécifiques de votre équipe.',
        breakdown: [
          {
            option: 'Notion',
            score: 8.8,
            pros: ['Très flexible et personnalisable', 'Tout-en-un (wiki, tâches, docs)', 'Interface moderne', 'Plan gratuit généreux'],
            cons: ['Courbe d\'apprentissage', 'Performance parfois lente']
          },
          {
            option: 'Monday.com',
            score: 8.3,
            pros: ['Interface très intuitive', 'Automatisations puissantes', 'Vues multiples', 'Support client excellent'],
            cons: ['Prix élevé', 'Complexité pour projets simples']
          },
          {
            option: 'Trello',
            score: 7.4,
            pros: ['Simplicité maximale', 'Prise en main immédiate', 'Prix abordable', 'Power-ups utiles'],
            cons: ['Fonctionnalités limitées', 'Pas adapté projets complexes']
          }
        ],
        infoLinks: [
          { title: 'Comparatif outils gestion projet', url: 'https://www.google.com/search?q=comparatif+outils+gestion+projet+2024' },
          { title: 'Guide Notion pour équipes', url: 'https://www.google.com/search?q=Notion+guide+gestion+équipe' }
        ],
        shoppingLinks: [
          { title: 'Notion - Plans tarifs', url: 'https://www.google.com/search?q=Notion+tarifs+équipe+entreprise' },
          { title: 'Monday.com - Essai gratuit', url: 'https://www.google.com/search?q=Monday.com+essai+gratuit' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Marketing digital ciblé + Content marketing',
        description: 'Une approche combinant publicités digitales ciblées et création de contenu de valeur offre le meilleur ROI pour un lancement produit moderne.',
        breakdown: [
          {
            option: 'Marketing digital + Content',
            score: 9.1,
            pros: ['Ciblage précis', 'Mesurable en temps réel', 'Coût maîtrisé', 'Scalable rapidement'],
            cons: ['Concurrence forte', 'Expertise technique requise']
          },
          {
            option: 'Influenceurs + Relations presse',
            score: 8.0,
            pros: ['Crédibilité élevée', 'Reach important', 'Engagement authentique', 'Buzz potentiel'],
            cons: ['Coût imprévisible', 'Contrôle limité du message']
          },
          {
            option: 'Événements + Networking',
            score: 7.2,
            pros: ['Contact direct prospects', 'Démonstration produit', 'Feedback immédiat', 'Relations durables'],
            cons: ['Reach limité', 'Organisation complexe', 'ROI difficile à mesurer']
          }
        ],
        infoLinks: [
          { title: 'Guide marketing digital startup', url: 'https://www.google.com/search?q=guide+marketing+digital+startup+lancement' },
          { title: 'Stratégies content marketing', url: 'https://www.google.com/search?q=stratégie+content+marketing+efficace' }
        ],
        shoppingLinks: [
          { title: 'Google Ads - Démarrer', url: 'https://www.google.com/search?q=Google+Ads+créer+campagne' },
          { title: 'Facebook Business - Publicités', url: 'https://www.google.com/search?q=Facebook+Ads+Manager+création' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Fournisseur établi avec historique prouvé',
        description: 'Privilégier un fournisseur avec un track record solide et un support réactif, même si légèrement plus cher, garantit la continuité d\'activité.',
        breakdown: [
          {
            option: 'Fournisseur établi premium',
            score: 8.6,
            pros: ['Fiabilité éprouvée', 'Support 24/7', 'SLA garantis', 'Références solides'],
            cons: ['Prix plus élevé', 'Moins de flexibilité']
          },
          {
            option: 'Startup innovante',
            score: 7.8,
            pros: ['Prix compétitifs', 'Innovation rapide', 'Flexibilité maximale', 'Attention personnalisée'],
            cons: ['Risque de discontinuité', 'Support limité', 'Processus instables']
          },
          {
            option: 'Solution low-cost',
            score: 6.4,
            pros: ['Prix très attractif', 'Économies importantes', 'Simplicité', 'Pas d\'engagement long'],
            cons: ['Qualité variable', 'Support minimal', 'Risques cachés']
          }
        ],
        infoLinks: [
          { title: 'Évaluer un fournisseur B2B', url: 'https://www.google.com/search?q=évaluer+fournisseur+entreprise+critères' },
          { title: 'Due diligence fournisseurs', url: 'https://www.google.com/search?q=due+diligence+sélection+fournisseur' }
        ],
        shoppingLinks: [
          { title: 'Annuaire fournisseurs B2B', url: 'https://www.google.com/search?q=annuaire+fournisseurs+professionnels' },
          { title: 'Comparateur solutions B2B', url: 'https://www.google.com/search?q=comparateur+solutions+entreprise' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Hybride : Télétravail + Coworking',
        description: 'Un modèle hybride combinant télétravail 3 jours et coworking 2 jours offre flexibilité, économies et opportunités de networking.',
        breakdown: [
          {
            option: 'Hybride télétravail + coworking',
            score: 9.0,
            pros: ['Flexibilité maximale', 'Coûts optimisés', 'Networking opportunités', 'Équilibre parfait'],
            cons: ['Organisation requise', 'Double équipement']
          },
          {
            option: 'Télétravail 100%',
            score: 8.1,
            pros: ['Économies maximales', 'Pas de transport', 'Environnement personnalisé', 'Horaires flexibles'],
            cons: ['Isolement social', 'Distractions domestiques', 'Séparation vie pro/perso']
          },
          {
            option: 'Bureau traditionnel',
            score: 7.3,
            pros: ['Collaboration naturelle', 'Séparation claire', 'Équipement fourni', 'Cadre professionnel'],
            cons: ['Coût élevé', 'Transport quotidien', 'Rigidité horaires']
          }
        ],
        infoLinks: [
          { title: 'Guide télétravail efficace', url: 'https://www.google.com/search?q=guide+télétravail+productivité+organisation' },
          { title: 'Espaces coworking près de chez vous', url: 'https://www.google.com/search?q=espaces+coworking+Paris+tarifs' }
        ],
        shoppingLinks: [
          { title: 'WeWork - Espaces flex', url: 'https://www.google.com/search?q=WeWork+abonnement+coworking' },
          { title: 'Équipement bureau maison', url: 'https://www.google.com/search?q=équipement+bureau+télétravail' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Acquisition clients + Automatisation',
        description: 'Investir simultanément dans l\'acquisition de nouveaux clients et l\'automatisation des processus génère une croissance durable et efficace.',
        breakdown: [
          {
            option: 'Acquisition clients + Automatisation',
            score: 9.2,
            pros: ['ROI mesurable rapidement', 'Croissance scalable', 'Efficacité opérationnelle', 'Avantage concurrentiel'],
            cons: ['Investissement initial important', 'Courbe d\'apprentissage']
          },
          {
            option: 'Recrutement équipe senior',
            score: 8.4,
            pros: ['Expertise immédiate', 'Accélération développement', 'Amélioration qualité', 'Leadership renforcé'],
            cons: ['Coût récurrent élevé', 'Risque de départ', 'Intégration complexe']
          },
          {
            option: 'R&D nouveaux produits',
            score: 7.6,
            pros: ['Innovation competitive', 'Nouveaux marchés', 'Valeur ajoutée', 'Différenciation'],
            cons: ['ROI incertain', 'Délais longs', 'Risque d\'échec élevé']
          }
        ],
        infoLinks: [
          { title: 'Stratégies acquisition clients', url: 'https://www.google.com/search?q=stratégie+acquisition+clients+startup' },
          { title: 'ROI automatisation entreprise', url: 'https://www.google.com/search?q=ROI+automatisation+processus+entreprise' }
        ],
        shoppingLinks: [
          { title: 'Outils marketing automation', url: 'https://www.google.com/search?q=outils+marketing+automation+HubSpot' },
          { title: 'Consultant stratégie croissance', url: 'https://www.google.com/search?q=consultant+stratégie+croissance+entreprise' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Candidat junior avec fort potentiel',
        description: 'Le candidat junior montre une excellente adaptation culturelle et un potentiel d\'évolution exceptionnel, compensant son manque d\'expérience.',
        breakdown: [
          {
            option: 'Candidat junior fort potentiel',
            score: 8.7,
            pros: ['Excellent fit culturel', 'Motivation exceptionnelle', 'Capacité d\'apprentissage', 'Coût modéré'],
            cons: ['Besoin de formation', 'Montée en compétence progressive']
          },
          {
            option: 'Expert technique senior',
            score: 8.1,
            pros: ['Compétences immédiatement opérationnelles', 'Mentoring équipe', 'Résolution problèmes complexes', 'Crédibilité externe'],
            cons: ['Coût élevé', 'Risque de sur-qualification', 'Adaptation culturelle incertaine']
          },
          {
            option: 'Profil expérimenté équilibré',
            score: 7.5,
            pros: ['Bon équilibre compétences/coût', 'Expérience variée', 'Autonomie rapidement', 'Références solides'],
            cons: ['Moins de potentiel disruptif', 'Motivation standard']
          }
        ],
        infoLinks: [
          { title: 'Guide entretien recrutement', url: 'https://www.google.com/search?q=guide+entretien+recrutement+questions' },
          { title: 'Évaluation soft skills', url: 'https://www.google.com/search?q=évaluer+soft+skills+candidat' }
        ],
        shoppingLinks: [
          { title: 'Tests techniques recrutement', url: 'https://www.google.com/search?q=tests+techniques+développeur+recrutement' },
          { title: 'Background check candidats', url: 'https://www.google.com/search?q=vérification+références+candidat' }
        ]
      }
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
      ],
      result: {
        recommendation: 'Pricing par valeur avec freemium',
        description: 'Une stratégie basée sur la valeur perçue avec une offre freemium permet de maximiser l\'adoption tout en capturant la valeur des clients premium.',
        breakdown: [
          {
            option: 'Pricing par valeur + freemium',
            score: 9.0,
            pros: ['Maximise la valeur capturée', 'Adoption large avec freemium', 'Différenciation possible', 'Revenue scalable'],
            cons: ['Complexité de mise en œuvre', 'Éducation marché nécessaire']
          },
          {
            option: 'Prix concurrentiel agressif',
            score: 7.8,
            pros: ['Pénétration marché rapide', 'Volume élevé', 'Barrière à l\'entrée', 'Simplicité'],
            cons: ['Marges réduites', 'Guerre des prix', 'Positionnement low-cost']
          },
          {
            option: 'Premium positioning',
            score: 7.2,
            pros: ['Marges élevées', 'Image de qualité', 'Clients moins sensibles prix', 'Exclusivité'],
            cons: ['Volume limité', 'Concurrence intense', 'Justification valeur difficile']
          }
        ],
        infoLinks: [
          { title: 'Stratégies pricing SaaS', url: 'https://www.google.com/search?q=stratégie+pricing+SaaS+freemium' },
          { title: 'Psychological pricing techniques', url: 'https://www.google.com/search?q=psychological+pricing+techniques+efficaces' }
        ],
        shoppingLinks: [
          { title: 'Outils analyse pricing', url: 'https://www.google.com/search?q=outils+analyse+pricing+produit' },
          { title: 'A/B testing prix', url: 'https://www.google.com/search?q=A/B+testing+stratégie+prix' }
        ]
      }
    }
  }
];

const CommunityTemplates = () => {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_copied'>('newest');
  const [showPredefined, setShowPredefined] = useState(false);

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

  const handleOpenTemplate = async (template: any) => {
    try {
      console.log('🔄 Opening template:', template.title);
      
      // Utiliser directement les données du template avec l'analyse réelle
      const publicId = await shareDecision(template.decision_data);
      
      // Open the shared decision in a new tab
      const sharedUrl = `/shared/${publicId}`;
      console.log('🌐 Opening shared URL:', sharedUrl);
      window.open(sharedUrl, '_blank');
      
    } catch (error) {
      console.error('❌ Error opening template:', error);
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
