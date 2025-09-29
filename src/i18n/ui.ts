// UI translations interface and implementations
import type { SupportedLanguage } from '../services/i18nService';

export type { SupportedLanguage } from '../services/i18nService';

export interface UITranslations {
  common: {
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    search: string;
  };
  profile: {
    avatar: {
      title: string;
      description: string;
      change: string;
      formatSupport: string;
    };
    info: {
        title: string;
        description: string;
      email: string;
      fullName: string;
      fullNamePlaceholder: string;
      save: string;
      saving: string;
      savedError: string;
      savedSuccess: string;
    };
    language: {
        title: string;
        description: string;
      label: string;
      placeholder: string;
      helpText: string;
      toastTitle: string;
      toastDesc: string;
      };
    googleAccount: {
      title: string;
      description: string;
      lastActivity: string;
      connected: string;
      disconnectAccount: string;
    toasts: {
        connectError: string;
        connectSuccess: string;
        disconnectError: string;
      };
    };
  };
  navbar: {
    home: string;
    history: string;
    settings: string;
    logout: string;
    login: string;
    templates: string;
    signOut: string;
    signIn: string;
    getStarted: string;
  };
  dilemmaSetup: {
    title: string;
    placeholder: string;
    analyzeButton: string;
    launchAnalysis: string;
    manualModeButton: string;
    aiToggleLabel: string;
    toast: {
      decisionCreated: string;
    };
    fileTooLarge: string;
    analysisStarted: string;
    manualModeActivated: string;
    dropHere: string;
    attachFile: string;
    hero: {
      titleLine1: string;
      titleLine2: string;
      brand: string;
    subtitle: string;
  };
    templates: {
      description: string;
      viewAll: string;
    };
    history: {
      title: string;
      description: string;
      toasts: {
        templateApplied: string;
        templateError: string;
        decisionDeleted: string;
        historyCleared: string;
    };
    };
  };
  auth: {
    signOut: string;
    actions: {
      signIn: string;
      createAccount: string;
      continueWithGoogle: string;
    };
    toggleText: {
      signUpPrompt: string;
      signUpLink: string;
      signInPrompt: string;
      signInLink: string;
    };
    separator: {
      or: string;
    };
    fields: {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
  };
  decision: {
    search: string;
    disadvantages: string;
    learnMore: string;
    seeMoreOptions: string;
    seeMore: string;
    seeLess: string;
    manualOptions: {
      title: string;
      description: string;
      addOption: string;
      optionTitle: string;
      optionDescription: string;
      generateDescription: string;
      generatePros: string;
      generateCons: string;
      pros: string;
      cons: string;
      addPro: string;
      addCon: string;
      finishAndSave: string;
      saving: string;
      createFollowUpQuestion: string;
      comments: string;
      commentsPlaceholder: string;
      commentsUnavailable: string;
      optionTitlePlaceholder: string;
      optionDescriptionPlaceholder: string;
      proPlaceholder: string;
      conPlaceholder: string;
      followUpDescription: string;
      manualAnalysisDescription: string;
      editOptions: string;
      modify: string;
    };
    toasts: {
      optionsCreatedSuccessfully: string;
      optionGenerationError: string;
      descriptionGenerationError: string;
      prosGenerationError: string;
      consGenerationError: string;
      criteriaMinError: string;
      descriptionGenerated: string;
      prosGenerated: string;
      consGenerated: string;
    };
    analysisResult: {
      recommendation: string;
      followUpQuestions: string;
      comments: string;
      noAdvantages: string;
      noDisadvantages: string;
      advantages: string;
      disadvantages: string;
      searchButton: string;
    };
    history: {
      manualDecisionInProgress: string;
      manualDecisionTitle: string;
      authorUnknown: string;
      item: {
        followUp: {
          singular: string;
          plural: string;
        };
        more: {
          singular: string;
          plural: string;
        };
      };
    };
    recommended: string;
    advantages: string;
    pointsOfAttention: string;
    usefulLinks: string;
    popularVideos: string;
    seeMore: string;
    comparisonTable: string;
  };
  settings: {
    sidebar: {
      profile: string;
          accounts: string;
      workspaces: string;
      documents: string;
          members: string;
          realTimeSearch: string;
          monthlyTemplates: string;
          preferences: string;
      admin: string;
          personal: string;
          organization: string;
          system: string;
    };
    header: {
      subtitle: string;
    };
    profile: {
      title: string;
      subtitle: string;
      name: string;
      email: string;
      theme: string;
      light: string;
      dark: string;
      system: string;
    avatar: {
      title: string;
      description: string;
      change: string;
      formatSupport: string;
    };
    info: {
      title: string;
      description: string;
      email: string;
      fullName: string;
      fullNamePlaceholder: string;
      save: string;
      saving: string;
      savedError: string;
        savedSuccess: string;
    };
    language: {
      title: string;
      description: string;
      label: string;
        placeholder: string;
      helpText: string;
      toastTitle: string;
      toastDesc: string;
    };
    googleAccount: {
      title: string;
      description: string;
      lastActivity: string;
        connected: string;
      disconnectAccount: string;
      toasts: {
        connectError: string;
          connectSuccess: string;
        disconnectError: string;
      };
    };
  };
    workspaces: {
    title: string;
    subtitle: string;
      defaultWorkspace: string;
      name: string;
      namePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      color: string;
      usageContext: string;
      deleteTitle: string;
      deleteDescription: string;
      delete: string;
      save: string;
      cancel: string;
    };
    documents: {
      title: string;
      subtitle: string;
      addDocuments: string;
      searchDocuments: string;
      noDocuments: string;
      addFirstDocument: string;
      upload: string;
      dragDrop: string;
      supported: string;
      maxSize: string;
      processing: string;
      processed: string;
      error: string;
      view: string;
      delete: string;
      deleteConfirmTitle: string;
      deleteConfirmDescription: string;
      deleteConfirmButton: string;
      uploadSuccess: string;
      uploadError: string;
      management: string;
      managementDescription: string;
      noWorkspaceSelected: string;
      noWorkspaceSelectedError: string;
      uploading: string;
      searchPlaceholder: string;
      documents: string;
      noResult: string;
      addDocumentsDescription: string;
      deleteSuccess: string;
      noDocument: string;
    };
    members: {
    title: string;
    subtitle: string;
      invite: string;
      inviteEmailPlaceholder: string;
      inviteRoleLabel: string;
      contributorRole: string;
      viewerRole: string;
      inviteButton: string;
      inviteEmailSent: string;
      membersListTitle: string;
      noWorkspaceSelected: string;
      selectWorkspaceMessage: string;
      pendingInvitations: string;
      invitedOn: string;
      expiresOn: string;
      resendInvitation: string;
      cancelInvitation: string;
      removeMember: string;
      removeMemberConfirmTitle: string;
      removeMemberConfirmDescription: string;
      removeMemberConfirmButton: string;
      roleUpdated: string;
      invitationSent: string;
      invitationError: string;
      invitationCanceled: string;
      memberRemoved: string;
      management: string;
      managementDescription: string;
      contributor: string;
      observer: string;
      workspaceMembers: string;
      pending: string;
      admin: string;
      noMembers: string;
    };
    appearance: {
      title: string;
      description: string;
      themeLabel: string;
      light: string;
      dark: string;
      system: string;
    };
    data: {
      title: string;
      description: string;
      history: {
        title: string;
        desc: string;
      };
      clearHistory: string;
      toast: {
        cleared: string;
        clearedDesc: string;
      };
    };
  };
  criteriaManager: {
    title: string;
    addCriterion: string;
    criterionPlaceholder: string;
    updateAnalysis: string;
    edit: string;
  };
  criteria: {
    title: string;
    addButton: string;
    tooltip: string;
  };
  comments: {
    section: {
      empty: string;
      addButton: string;
      add: string;
      cancel: string;
      toasts: {
        addSuccess: string;
        updateSuccess: string;
        deleteSuccess: string;
      };
    };
    item: {
      types: {
        general: string;
      };
      createdOn: string;
      modifiedOn: string;
      reply: string;
      replies: string;
      showReplies: string;
      hideReplies: string;
      addReply: string;
      replyPlaceholder: string;
      reactions: string;
      addReaction: string;
      removeReaction: string;
    };
    mentions: {
      searchPlaceholder: string;
      noMembersFound: string;
      loading: string;
      owner: string;
      contributor: string;
      viewer: string;
    };
  };
  analysis: {
    followUpSection: {
      title: string;
      subtitle: string;
      loading: string;
    };
  };
  optionsLoading: {
    title: string;
    subtitle: string;
  };
  dataAccuracy: {
    sources: {
      one: string;
      other: string;
    };
    createdOn: string;
    by: string;
    updatedOn: string;
    viewSources: string;
  };
  notifications: {
    previousDecisionLoaded: string;
    sourceVerification: string;
  };
  share: {
    button: {
      share: string;
      simpleShare: string;
      collaborate: string;
      shareAsTemplate: string;
    };
    toasts: {
      linkCopied: string;
    };
  };
  collaboration: {
    title: string;
    description: string;
    inviteByEmail: string;
    inviteDescription: string;
    emailPlaceholder: string;
    sendInvitation: string;
  };
  history: {
    searchBar: {
      filter: string;
      more: string;
      categoryLabel: string;
      allCategori: string;
      allCategories: string;
      uncategorized: string;
      searchPlaceholder: string;
      sortBy: string;
      sort: {
        date: string;
        category: string;
      };
      exportPdf: string;
      exportJson: string;
      copyText: string;
      export: string;
      clearAll: string;
      toasts: {
        export: {
          success: string;
        };
        json: {
          success: string;
        };
      };
      confirm: {
        title: string;
        desc: string;
        cancel: string;
        ok: string;
      };
    };
    list: {
      seeMore: string;
    };
    item: {
      share: string;
      delete: string;
    };
  };
  templates: {
    page: {
    title: string;
    description: string;
    };
    filters: {
      searchPlaceholder: string;
      categoryAll: string;
      sort: {
        newest: string;
        popular: string;
        mostCopied: string;
      };
    };
    grid: {
      personalTitle: string;
      professionalTitle: string;
      recommendedBadge: string;
    };
    card: {
      question: string;
      open: string;
    };
  };
  footer: {
    privacyPolicy: string;
    templates: string;
  };
  workspaces: {
    newWorkspace: string;
    title: string;
    subtitle: string;
    yourWorkspaces: string;
    createNew: string;
    current: string;
    owner: string;
    select: string;
    defaultPersonalWorkspace: string;
    createdOn: string;
    noWorkspaces: string;
    createFirstWorkspace: string;
    createWorkspace: string;
    deleting: string;
    delete: string;
    createSuccess: string;
    createError: string;
    deleteSuccess: string;
    deleteError: string;
    selectSuccess: string;
      createDialog: {
        title: string;
        description: string;
        nameLabel: string;
        namePlaceholder: string;
        descriptionLabel: string;
        descriptionPlaceholder: string;
        colorLabel: string;
        cancel: string;
        create: string;
        creating: string;
      };
      image: {
        title: string;
        subtitle: string;
        tooBig: string;
        uploadSuccess: string;
        uploadError: string;
        deleteSuccess: string;
        deleteError: string;
        uploading: string;
        changeImage: string;
        supportedFormats: string;
      };
      edit: {
    title: string;
        description: string;
        nameLabel: string;
        namePlaceholder: string;
        descriptionLabel: string;
        descriptionPlaceholder: string;
        save: string;
        saving: string;
        savedSuccess: string;
        savedError: string;
        manageCurrent: string;
      };
      information: {
        title: string;
        subtitle: string;
        nameLabel: string;
        namePlaceholder: string;
        descriptionLabel: string;
        descriptionPlaceholder: string;
        save: string;
        saving: string;
        savedSuccess: string;
        savedError: string;
      };
    };
  privacy: {
    title: string;
    lastUpdated: string;
    sections: {
      dataCollection: {
        title: string;
        description: string;
        item1: string;
        item2: string;
        item3: string;
        item4: string;
      };
      dataUsage: {
        title: string;
        description: string;
        item1: string;
        item2: string;
        item3: string;
        item4: string;
      };
      dataSharing: {
        title: string;
        description: string;
        item1: string;
        item2: string;
        item3: string;
      };
      security: {
        title: string;
        description: string;
        item1: string;
        item2: string;
        item3: string;
        item4: string;
      };
      rights: {
        title: string;
        description: string;
        item1: string;
        item2: string;
        item3: string;
        item4: string;
      };
      cookies: {
        title: string;
        description: string;
      };
      retention: {
        title: string;
        description: string;
      };
      contact: {
        title: string;
        description: string;
        email: string;
      };
      changes: {
        title: string;
        description: string;
      };
    };
  };
}

// French translations
const fr: UITranslations = {
  common: {
    cancel: "Annuler",
    save: "Sauvegarder",
    edit: "Modifier",
    delete: "Supprimer",
    confirm: "Confirmer",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    search: "Rechercher",
  },
  profile: {
    avatar: {
      title: "Photo de profil",
      description: "Gérez votre photo de profil",
      change: "Changer la photo",
      formatSupport: "Formats supportés : JPG, PNG, GIF",
    },
    info: {
      title: "Informations personnelles",
      description: "Gérez vos informations personnelles",
      email: "Adresse email",
      fullName: "Nom complet",
      fullNamePlaceholder: "Entrez votre nom complet",
      save: "Sauvegarder",
      saving: "Sauvegarde...",
      savedError: "Erreur lors de la sauvegarde",
      savedSuccess: "Informations sauvegardées avec succès",
    },
    language: {
      title: "Langue",
      description: "Choisissez votre langue préférée",
      label: "Langue d'affichage",
      placeholder: "Sélectionnez une langue",
      helpText: "La langue sera appliquée à toute l'interface",
      toastTitle: "Langue mise à jour",
      toastDesc: "La langue a été changée avec succès",
    },
    googleAccount: {
      title: "Compte Google",
      description: "Connectez votre compte Google pour synchroniser vos données",
      lastActivity: "Dernière activité",
      connected: "Connecté",
      disconnectAccount: "Déconnecter le compte",
      toasts: {
        connectError: "Erreur lors de la connexion",
        connectSuccess: "Compte Google connecté avec succès",
        disconnectError: "Erreur lors de la déconnexion",
      },
    },
  },
  navbar: {
    home: "Accueil",
    history: "Historique",
    settings: "Paramètres",
    logout: "Déconnexion",
    login: "Connexion",
    templates: "Modèles",
    signOut: "Déconnexion",
    signIn: "Se connecter",
    getStarted: "Commencer",
  },
  dilemmaSetup: {
    title: "Quel est votre dilemme ?",
    placeholder: "Ex: Acheter une maison ou louer un appartement",
    analyzeButton: "Analyser",
    launchAnalysis: "Lancer l'analyse",
    manualModeButton: "Mode manuel",
    aiToggleLabel: "Analyse intelligente par IA",
    toast: {
      decisionCreated: "Décision manuelle créée avec succès !",
    },
    fileTooLarge: "est trop volumineux (max 10MB)",
    analysisStarted: "Analyse démarrée !",
    manualModeActivated: "Mode manuel activé !",
    dropHere: "Déposez vos fichiers ici",
    attachFile: "Joindre un fichier",
    hero: {
      titleLine1: "Tout devient",
      titleLine2: "Rationable",
      brand: "Rationable",
      subtitle: "Transformez vos dilemmes en décisions claires grâce à l'analyse intelligente",
    },
    templates: {
      description: "Découvrez nos modèles de décision populaires",
      viewAll: "Voir tous les modèles",
    },
    history: {
      title: "Historique des décisions",
      description: "Consultez et gérez vos décisions précédentes",
      toasts: {
        templateApplied: "Template appliqué avec succès !",
        templateError: "Erreur lors de l'application du template",
        decisionDeleted: "Décision supprimée de l'historique",
        historyCleared: "L'historique des décisions a été effacé",
      },
    },
  },
  auth: {
    signOut: "Déconnexion",
    actions: {
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      continueWithGoogle: "Continuer avec Google",
    },
    toggleText: {
      signUpPrompt: "Pas encore de compte ?",
      signUpLink: "S'inscrire",
      signInPrompt: "Déjà un compte ?",
      signInLink: "Se connecter",
    },
    separator: {
      or: "ou",
    },
    fields: {
      fullName: "Nom complet",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
    },
  },
  decision: {
    search: "Rechercher",
    disadvantages: "Points d'attention",
    moreDisadvantages: "points d'attention supplémentaires",
    moreAdvantages: "avantages supplémentaires",
    learnMore: "En savoir plus",
    seeMoreOptions: "Voir plus d'options",
    seeMore: "Voir plus",
    seeLess: "Voir moins",
    manualOptions: {
      title: "Options manuelles",
      description: "Créez vos propres options manuellement ou générez des options automatiquement. En mode manuel, vous gardez le contrôle total sur le contenu.",
      addOption: "Ajouter une option",
      optionTitle: "Titre de l'option",
      optionDescription: "Description de l'option",
      generateDescription: "Générer la description",
      generatePros: "Générer les avantages",
      generateCons: "Générer les inconvénients",
      pros: "Avantages",
      cons: "Inconvénients",
      addPro: "Ajouter un avantage",
      addCon: "Ajouter un inconvénient",
      finishAndSave: "Terminer et sauvegarder",
      saving: "Sauvegarde en cours...",
      createFollowUpQuestion: "Créer une question de suivi",
      comments: "Commentaires",
      commentsPlaceholder: "Ajouter un commentaire...",
      commentsUnavailable: "Les commentaires seront disponibles une fois la décision créée.",
      optionTitlePlaceholder: "Ex: Acheter une maison",
      optionDescriptionPlaceholder: "Ex: Une maison offre plus d'espace et de stabilité.",
      proPlaceholder: "Ex: Plus d'espace",
      conPlaceholder: "Ex: Coût initial élevé",
      followUpDescription: "Créez une question de suivi pour approfondir votre analyse.",
      manualAnalysisDescription: "Options créées manuellement",
      editOptions: "Modifier options",
      modify: "Modifier",
    },
    toasts: {
      optionsCreatedSuccessfully: "Options créées avec succès !",
      optionGenerationError: "Erreur lors de la génération de l'option.",
      descriptionGenerationError: "Erreur lors de la génération de la description.",
      prosGenerationError: "Erreur lors de la génération des avantages.",
      consGenerationError: "Erreur lors de la génération des inconvénients.",
      criteriaMinError: "Vous devez avoir au moins deux critères.",
      descriptionGenerated: "Description générée avec succès !",
      prosGenerated: "Avantages générés avec succès !",
      consGenerated: "Inconvénients générés avec succès !",
    },
    analysisResult: {
      recommendation: "Recommandé",
      followUpQuestions: "Questions de suivi",
      comments: "Commentaires",
      noAdvantages: "Aucun avantage spécifié pour cette option",
      noDisadvantages: "Aucun point d'attention spécifié pour cette option",
      advantages: "Avantages",
      disadvantages: "Points d'attention",
      searchButton: "Rechercher",
    },
    history: {
      manualDecisionInProgress: "Décision en cours",
      manualDecisionTitle: "Décision manuelle",
      authorUnknown: "Auteur inconnu",
      item: {
        followUp: {
          singular: "question de suivi",
          plural: "questions de suivi",
        },
        more: {
          singular: "autre",
          plural: "autres",
        },
      },
    },
    recommended: "Recommandé",
    advantages: "Avantages",
    pointsOfAttention: "Points d'attention",
    usefulLinks: "Liens utiles",
    popularVideos: "Vidéos populaires",
    comparisonTable: "Tableau de comparaison",
    },
    settings: {
      sidebar: {
          profile: "Profil",
          accounts: "Comptes",
          workspaces: "Espaces de travail",
          documents: "Documents",
          members: "Membres",
          realTimeSearch: "Recherche en temps réel",
          monthlyTemplates: "Modèles mensuels",
          preferences: "Préférences",
          admin: "Administration",
          personal: "Personnel",
          organization: "Organisation",
          system: "Système",
      },
      header: {
      subtitle: "Gérez vos paramètres et préférences",
      },
      profile: {
      title: "Paramètres du profil",
      subtitle: "Gérez les informations de votre profil.",
      name: "Nom",
      email: "Email",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
      system: "Système",
      avatar: {
        title: "Photo de profil",
        description: "Gérez votre photo de profil",
        change: "Changer la photo",
        formatSupport: "Formats supportés : JPG, PNG, GIF",
      },
      info: {
        title: "Informations personnelles",
        description: "Gérez vos informations personnelles",
        email: "Adresse email",
        fullName: "Nom complet",
        fullNamePlaceholder: "Entrez votre nom complet",
        save: "Sauvegarder",
        saving: "Sauvegarde...",
        savedError: "Erreur lors de la sauvegarde",
        savedSuccess: "Informations sauvegardées avec succès",
      },
      language: {
        title: "Langue",
        description: "Choisissez votre langue préférée",
        label: "Langue d'affichage",
        placeholder: "Sélectionnez une langue",
        helpText: "La langue sera appliquée à toute l'interface",
        toastTitle: "Langue mise à jour",
        toastDesc: "La langue a été changée avec succès",
      },
      googleAccount: {
        title: "Compte Google",
        description: "Connectez votre compte Google pour synchroniser vos données",
        lastActivity: "Dernière activité",
        connected: "Connecté",
        disconnectAccount: "Déconnecter le compte",
        toasts: {
          connectError: "Erreur lors de la connexion",
          connectSuccess: "Compte Google connecté avec succès",
          disconnectError: "Erreur lors de la déconnexion",
        },
      },
    },
    workspaces: {
      title: "Gestion des espaces de travail",
      subtitle: "Gérez vos espaces de travail.",
      defaultWorkspace: "Espace de travail par défaut",
      name: "Nom de l'espace de travail",
      namePlaceholder: "Ex: Mon espace de travail personnel",
      description: "Description",
      descriptionPlaceholder: "Ex: Espace pour mes projets personnels",
      color: "Couleur",
      usageContext: "Contexte d'utilisation",
      deleteTitle: "Supprimer l'espace de travail",
      deleteDescription: "Êtes-vous sûr de vouloir supprimer cet espace de travail ? Cette action est irréversible.",
      delete: "Supprimer",
      save: "Sauvegarder",
      cancel: "Annuler",
    },
    documents: {
      title: "Gestion des documents",
      subtitle: "Gérez les documents de votre espace de travail.",
      addDocuments: "Ajouter des documents",
      searchDocuments: "Rechercher des documents...",
      noDocuments: "Aucun document",
      addFirstDocument: "Ajouter le premier document",
      upload: "Télécharger",
      dragDrop: "Glissez et déposez vos fichiers ici, ou cliquez pour sélectionner",
      supported: "Fichiers supportés : PDF, DOCX, TXT",
      maxSize: "Taille maximale : 10 Mo",
      processing: "Traitement du document...",
      processed: "Document traité",
      error: "Erreur lors du traitement du document",
      view: "Voir",
      delete: "Supprimer",
      deleteConfirmTitle: "Supprimer le document",
      deleteConfirmDescription: "Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.",
      deleteConfirmButton: "Supprimer",
      uploadSuccess: "Document téléchargé avec succès !",
      uploadError: "Erreur lors du téléchargement du document.",
      management: "Gestion des documents",
      managementDescription: "Gérez les documents de votre espace de travail",
      noWorkspaceSelected: "Aucun espace de travail sélectionné",
      noWorkspaceSelectedError: "Veuillez sélectionner un espace de travail",
      uploading: "Téléchargement en cours...",
      searchPlaceholder: "Rechercher des documents...",
      documents: "Documents",
      noResult: "Aucun résultat",
      addDocumentsDescription: "Ajoutez des documents pour enrichir vos analyses",
      deleteSuccess: "Document supprimé avec succès !",
      noDocument: "Aucun document",
    },
    members: {
      title: "Gestion des membres",
      subtitle: "Gérez les membres de votre espace de travail.",
      invite: "Inviter",
      inviteEmailPlaceholder: "Email du membre",
      inviteRoleLabel: "Rôle",
      contributorRole: "Contributeur",
      viewerRole: "Lecteur",
      inviteButton: "Envoyer l'invitation",
      inviteEmailSent: "Un email d'invitation sera envoyé à cette adresse avec le rôle sélectionné.",
      membersListTitle: "Membres de l'espace de travail",
      noWorkspaceSelected: "Aucun workspace sélectionné",
      selectWorkspaceMessage: "Veuillez sélectionner un workspace pour gérer ses membres",
      pendingInvitations: "Invitations en attente",
      invitedOn: "Invité le",
      expiresOn: "Expire le",
      resendInvitation: "Renvoyer l'invitation",
      cancelInvitation: "Annuler l'invitation",
      removeMember: "Supprimer le membre",
      removeMemberConfirmTitle: "Supprimer le membre",
      removeMemberConfirmDescription: "Êtes-vous sûr de vouloir supprimer ce membre de l'espace de travail ? Cette action est irréversible.",
      removeMemberConfirmButton: "Supprimer",
      roleUpdated: "Rôle mis à jour avec succès !",
      invitationSent: "Invitation envoyée avec succès !",
      invitationError: "Erreur lors de l'envoi de l'invitation.",
      invitationCanceled: "Invitation annulée avec succès !",
      memberRemoved: "Membre supprimé avec succès !",
      management: "Gestion des membres",
      managementDescription: "Gérez les membres de votre espace de travail",
      contributor: "Contributeur",
      observer: "Observateur",
      workspaceMembers: "Membres du workspace",
      pending: "En attente",
      admin: "Administrateur",
      noMembers: "Aucun membre dans ce workspace",
    },
    appearance: {
      title: "Apparence",
      description: "Personnalisez l'apparence de l'application",
      themeLabel: "Thème",
      light: "Clair",
      dark: "Sombre",
      system: "Système",
    },
    data: {
      title: "Données",
      description: "Gérez vos données et votre historique",
      history: {
        title: "Historique",
        desc: "Effacez votre historique de décisions",
      },
      clearHistory: "Effacer l'historique",
      toast: {
        cleared: "Historique effacé",
        clearedDesc: "Votre historique a été effacé avec succès",
      },
    },
  },
  criteriaManager: {
    title: "Critères",
    addCriterion: "Ajouter un critère",
    criterionPlaceholder: "Ex: Coût",
    updateAnalysis: "Mettre à jour l'analyse",
    edit: "Modifier",
    },
    criteria: {
    title: "Critères",
    addButton: "Ajouter un critère",
    tooltip: "Les critères vous aident à évaluer vos options de manière objective",
  },
  comments: {
    section: {
      empty: "Aucun commentaire pour le moment",
      addButton: "Ajouter un commentaire",
      add: "Ajouter",
      cancel: "Annuler",
      toasts: {
        addSuccess: "Commentaire ajouté avec succès",
        updateSuccess: "Commentaire mis à jour",
        deleteSuccess: "Commentaire supprimé",
      },
    },
    item: {
      types: {
        general: "Général",
      },
      createdOn: "Créé le",
      modifiedOn: "Modifié le",
      reply: "Répondre",
      replies: "réponses",
      showReplies: "Voir les réponses",
      hideReplies: "Masquer les réponses",
      addReply: "Ajouter une réponse",
      replyPlaceholder: "Écrire une réponse...",
      reactions: "Réactions",
      addReaction: "Ajouter une réaction",
      removeReaction: "Retirer la réaction",
    },
    mentions: {
      searchPlaceholder: "Rechercher un membre...",
      noMembersFound: "Aucun membre trouvé",
      loading: "Chargement...",
      owner: "Propriétaire",
      contributor: "Contributeur",
      viewer: "Observateur",
    },
  },
  analysis: {
    followUpSection: {
      title: "Questions de suivi",
      subtitle: "Explorez des aspects supplémentaires de votre décision",
      loading: "Génération des questions de suivi...",
    },
  },
  optionsLoading: {
    title: "Génération des options...",
    subtitle: "Analyse en cours, veuillez patienter",
  },
  dataAccuracy: {
    sources: {
      one: "Source",
      other: "Autres sources",
    },
    createdOn: "Créé le",
    by: "par",
    updatedOn: "Mis à jour le",
    viewSources: "Voir les sources",
  },
  notifications: {
    previousDecisionLoaded: "Décision précédente chargée.",
    sourceVerification: "Vérification des sources...",
  },
  share: {
    button: {
      share: "Partager",
      simpleShare: "Partage simple",
      collaborate: "Collaborer",
      shareAsTemplate: "Partager comme template",
    },
    toasts: {
      linkCopied: "Lien copié dans le presse-papiers",
    },
  },
  collaboration: {
    title: "Inviter des collaborateurs",
    description: "Partagez cette décision avec d'autres personnes pour obtenir leurs avis et suggestions.",
    inviteByEmail: "Inviter par email",
    inviteDescription: "Envoyez un lien d'invitation par email à vos collaborateurs.",
    emailPlaceholder: "Adresse email du collaborateur",
    sendInvitation: "Envoyer l'invitation",
  },
  history: {
      searchBar: {
      filter: "Filtrer",
      more: "Plus",
      categoryLabel: "Catégorie",
      allCategori: "Toutes les catégories",
      allCategories: "Toutes les catégories",
      uncategorized: "Non catégorisé",
      searchPlaceholder: "Rechercher dans l'historique...",
      sortBy: "Trier par",
        sort: {
        date: "Date",
        category: "Catégorie",
      },
      exportPdf: "Exporter en PDF",
      exportJson: "Exporter en JSON",
      copyText: "Copier le texte",
      export: "Exporter",
      clearAll: "Tout effacer",
        toasts: {
          export: {
          success: "Export réussi",
          },
          json: {
          success: "Export JSON réussi",
        },
      },
      confirm: {
        title: "Confirmer l'action",
        desc: "Êtes-vous sûr de vouloir effectuer cette action ?",
        cancel: "Annuler",
        ok: "Confirmer",
      },
    },
    list: {
      seeMore: "Voir plus",
      },
      item: {
      share: "Partager",
      delete: "Supprimer",
    },
  },
  templates: {
    page: {
      title: "Modèles de décision",
      description: "Découvrez et utilisez nos modèles de décision populaires",
    },
    filters: {
      searchPlaceholder: "Rechercher des modèles...",
      categoryAll: "Toutes les catégories",
      sort: {
        newest: "Plus récents",
        popular: "Populaires",
        mostCopied: "Plus copiés",
      },
    },
    grid: {
      personalTitle: "Vos modèles personnels",
      professionalTitle: "Modèles professionnels",
      recommendedBadge: "Recommandé",
    },
    card: {
      question: "Question",
      open: "Ouvrir",
    },
  },
  footer: {
    privacyPolicy: "Politique de confidentialité",
    templates: "Modèles",
  },
  workspaces: {
    newWorkspace: "Nouveau workspace",
    title: "Gestion des Workspaces",
    subtitle: "Créez et gérez vos espaces de travail",
    yourWorkspaces: "Vos Workspaces",
    createNew: "Nouveau workspace",
    current: "Actuel",
    owner: "Propriétaire",
    select: "Sélectionner",
    defaultPersonalWorkspace: "Votre workspace personnel par défaut",
    createdOn: "Créé le",
    noWorkspaces: "Aucun workspace",
    createFirstWorkspace: "Créez votre premier workspace pour organiser vos décisions",
    createWorkspace: "Créer un workspace",
    deleting: "Suppression...",
    delete: "Supprimer",
    createSuccess: "Workspace créé avec succès",
    createError: "Impossible de créer le workspace",
    deleteSuccess: "Workspace supprimé avec succès",
    deleteError: "Impossible de supprimer le workspace",
    selectSuccess: "Workspace sélectionné",
    createDialog: {
      title: "Créer un nouveau workspace",
      description: "Organisez vos décisions dans des espaces séparés pour différents projets ou contextes.",
      nameLabel: "Nom du workspace",
      namePlaceholder: "ex: Projet X, Personnel, Équipe...",
      descriptionLabel: "Description (optionnel)",
      descriptionPlaceholder: "Décrivez l'objectif de ce workspace...",
      colorLabel: "Couleur",
      cancel: "Annuler",
        create: "Créer",
        creating: "Création...",
      },
      image: {
        title: "Image du workspace",
        subtitle: "Gérez l'image de votre workspace",
        tooBig: "L'image est trop volumineuse (max 5MB)",
        uploadSuccess: "Image du workspace mise à jour avec succès !",
        uploadError: "Erreur lors de l'upload de l'image",
        deleteSuccess: "Image du workspace supprimée avec succès !",
        deleteError: "Erreur lors de la suppression de l'image",
        uploading: "Upload en cours...",
        changeImage: "Changer l'image",
        supportedFormats: "Formats supportés : JPG, PNG, GIF, WebP",
      },
      edit: {
        title: "Modifier le workspace",
        description: "Modifiez les informations de votre workspace",
        nameLabel: "Nom du workspace",
        namePlaceholder: "ex: Projet X, Personnel, Équipe...",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Décrivez l'objectif de ce workspace...",
        save: "Enregistrer",
        saving: "Enregistrement...",
        savedSuccess: "Workspace mis à jour avec succès !",
        savedError: "Erreur lors de la mise à jour du workspace",
        manageCurrent: "Gérez votre workspace actuel",
      },
      information: {
        title: "Informations du workspace",
        subtitle: "Gérez les informations de votre workspace",
        nameLabel: "Nom du workspace",
        namePlaceholder: "ex: Projet X, Personnel, Équipe...",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Décrivez l'objectif de ce workspace...",
        save: "Enregistrer",
        saving: "Enregistrement...",
        savedSuccess: "Workspace mis à jour avec succès !",
        savedError: "Erreur lors de la mise à jour du workspace",
      },
    },
    privacy: {
    title: "Politique de confidentialité",
    lastUpdated: "Dernière mise à jour",
      sections: {
        dataCollection: {
        title: "Collecte de données",
        description: "Nous collectons les données suivantes",
        item1: "Informations de profil",
        item2: "Décisions et analyses",
        item3: "Données d'utilisation",
        item4: "Cookies et technologies similaires",
        },
        dataUsage: {
        title: "Utilisation des données",
        description: "Vos données sont utilisées pour",
        item1: "Fournir nos services",
        item2: "Améliorer l'expérience utilisateur",
        item3: "Analyser les tendances",
        item4: "Personnaliser le contenu",
        },
        dataSharing: {
        title: "Partage des données",
        description: "Nous ne partageons vos données qu'avec",
        item1: "Votre consentement explicite",
        item2: "Les services tiers nécessaires",
        item3: "Les autorités légales si requis",
        },
        security: {
        title: "Sécurité",
        description: "Nous protégeons vos données avec",
        item1: "Chiffrement des données sensibles",
        item2: "Accès sécurisé et authentifié",
        item3: "Surveillance continue des systèmes",
        item4: "Formation du personnel à la sécurité",
        },
        rights: {
        title: "Vos droits",
        description: "Vous disposez des droits suivants",
        item1: "Accès à vos données personnelles",
        item2: "Rectification des données inexactes",
        item3: "Suppression de vos données",
        item4: "Portabilité de vos données",
      },
      cookies: {
        title: "Cookies",
        description: "Nous utilisons des cookies pour améliorer votre expérience",
        },
        retention: {
        title: "Conservation des données",
        description: "Vos données sont conservées selon nos politiques de rétention",
        },
        contact: {
        title: "Contact",
        description: "Pour toute question concernant cette politique",
        email: "Email",
        },
        changes: {
        title: "Modifications",
        description: "Cette politique peut être modifiée à tout moment",
        },
      },
    },
};

// English translations
const en: UITranslations = {
  common: {
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    search: "Search",
  },
  profile: {
    avatar: {
      title: "Profile picture",
      description: "Manage your profile picture",
      change: "Change picture",
      formatSupport: "Supported formats: JPG, PNG, GIF",
    },
    info: {
      title: "Personal information",
      description: "Manage your personal information",
      email: "Email address",
      fullName: "Full name",
      fullNamePlaceholder: "Enter your full name",
      save: "Save",
      saving: "Saving...",
      savedError: "Error saving information",
      savedSuccess: "Information saved successfully",
    },
    language: {
      title: "Language",
      description: "Choose your preferred language",
      label: "Display language",
      placeholder: "Select a language",
      helpText: "The language will be applied to the entire interface",
      toastTitle: "Language updated",
      toastDesc: "Language changed successfully",
    },
    googleAccount: {
      title: "Google Account",
      description: "Connect your Google account to sync your data",
      lastActivity: "Last activity",
      connected: "Connected",
      disconnectAccount: "Disconnect account",
      toasts: {
        connectError: "Error connecting account",
        connectSuccess: "Google account connected successfully",
        disconnectError: "Error disconnecting account",
      },
    },
  },
  navbar: {
    home: "Home",
    history: "History",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    templates: "Templates",
    signOut: "Sign out",
    signIn: "Sign in",
    getStarted: "Get started",
  },
  dilemmaSetup: {
    title: "What is your dilemma?",
    placeholder: "Ex: Buy a house or rent an apartment",
    analyzeButton: "Analyze",
    launchAnalysis: "Launch analysis",
    manualModeButton: "Manual mode",
    aiToggleLabel: "AI intelligent analysis",
    toast: {
      decisionCreated: "Manual decision created successfully!",
    },
    fileTooLarge: "is too large (max 10MB)",
    analysisStarted: "Analysis started!",
    manualModeActivated: "Manual mode activated!",
    dropHere: "Drop your files here",
    attachFile: "Attach file",
    hero: {
      titleLine1: "Make everything",
      titleLine2: "Rationable",
      brand: "Rationable",
      subtitle: "Transform your dilemmas into clear decisions through intelligent analysis",
    },
    templates: {
      description: "Discover our popular decision templates",
      viewAll: "View all templates",
    },
    history: {
      title: "Decision history",
      description: "View and manage your previous decisions",
      toasts: {
        templateApplied: "Template applied successfully!",
        templateError: "Error applying template",
        decisionDeleted: "Decision deleted from history",
        historyCleared: "Decision history has been cleared",
      },
    },
  },
  auth: {
    signOut: "Sign out",
    actions: {
      signIn: "Sign in",
      createAccount: "Create account",
      continueWithGoogle: "Continue with Google",
    },
    toggleText: {
      signUpPrompt: "Don't have an account?",
      signUpLink: "Sign up",
      signInPrompt: "Already have an account?",
      signInLink: "Sign in",
    },
    separator: {
      or: "or",
    },
    fields: {
      fullName: "Full name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
    },
  },
  decision: {
    search: "Search",
    disadvantages: "Points of attention",
    moreDisadvantages: "more points of attention",
    moreAdvantages: "more advantages",
    learnMore: "Learn more",
    seeMoreOptions: "See more options",
    seeMore: "See more",
    seeLess: "See less",
    manualOptions: {
      title: "Manual Options",
      description: "Create your own options manually or generate options automatically. In manual mode, you retain full control over the content.",
      addOption: "Add option",
      optionTitle: "Option title",
      optionDescription: "Option description",
      generateDescription: "Generate description",
      generatePros: "Generate pros",
      generateCons: "Generate cons",
      pros: "Pros",
      cons: "Cons",
      addPro: "Add pro",
      addCon: "Add con",
      finishAndSave: "Finish and save",
      saving: "Saving...",
      createFollowUpQuestion: "Create follow-up question",
      comments: "Comments",
      commentsPlaceholder: "Add a comment...",
      commentsUnavailable: "Comments will be available once the decision is created.",
      optionTitlePlaceholder: "Ex: Buy a house",
      optionDescriptionPlaceholder: "Ex: A house offers more space and stability.",
      proPlaceholder: "Ex: More space",
      conPlaceholder: "Ex: High initial cost",
      followUpDescription: "Create a follow-up question to deepen your analysis.",
      manualAnalysisDescription: "Manually created options",
      editOptions: "Edit options",
      modify: "Modify",
    },
    toasts: {
      optionsCreatedSuccessfully: "Options created successfully!",
      optionGenerationError: "Error generating option.",
      descriptionGenerationError: "Error generating description.",
      prosGenerationError: "Error generating pros.",
      consGenerationError: "Error generating cons.",
      criteriaMinError: "You must have at least two criteria.",
      descriptionGenerated: "Description generated successfully!",
      prosGenerated: "Pros generated successfully!",
      consGenerated: "Cons generated successfully!",
    },
    analysisResult: {
      recommendation: "Recommended",
      followUpQuestions: "Follow-up questions",
      comments: "Comments",
      noAdvantages: "No advantages specified for this option",
      noDisadvantages: "No points of attention specified for this option",
      advantages: "Advantages",
      disadvantages: "Points of attention",
      searchButton: "Search",
    },
    history: {
      manualDecisionInProgress: "Decision in progress",
      manualDecisionTitle: "Manual decision",
      authorUnknown: "Unknown author",
      item: {
        followUp: {
          singular: "follow-up question",
          plural: "follow-up questions",
        },
        more: {
          singular: "other",
          plural: "others",
        },
      },
    },
    recommended: "Recommended",
    advantages: "Advantages",
    pointsOfAttention: "Points of attention",
      usefulLinks: "Useful links",
      popularVideos: "Popular videos",
      comparisonTable: "Comparison table",
  },
  settings: {
        sidebar: {
          profile: "Profile",
          accounts: "Accounts",
          workspaces: "Workspaces",
          documents: "Documents",
          members: "Members",
          realTimeSearch: "Real-time search",
          monthlyTemplates: "Monthly templates",
          preferences: "Preferences",
          admin: "Administration",
          personal: "Personal",
          organization: "Organization",
          system: "System",
        },
    header: {
      subtitle: "Manage your settings and preferences",
    },
    profile: {
      title: "Profile settings",
      subtitle: "Manage your profile information.",
      name: "Name",
      email: "Email",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      avatar: {
        title: "Profile picture",
        description: "Manage your profile picture",
        change: "Change picture",
        formatSupport: "Supported formats: JPG, PNG, GIF",
      },
      info: {
        title: "Personal information",
        description: "Manage your personal information",
        email: "Email address",
        fullName: "Full name",
        fullNamePlaceholder: "Enter your full name",
        save: "Save",
        saving: "Saving...",
        savedError: "Error saving information",
        savedSuccess: "Information saved successfully",
      },
      language: {
        title: "Language",
        description: "Choose your preferred language",
        label: "Display language",
        placeholder: "Select a language",
        helpText: "The language will be applied to the entire interface",
        toastTitle: "Language updated",
        toastDesc: "Language changed successfully",
      },
      googleAccount: {
        title: "Google Account",
        description: "Connect your Google account to sync your data",
        lastActivity: "Last activity",
        connected: "Connected",
        disconnectAccount: "Disconnect account",
      toasts: {
          connectError: "Error connecting account",
          connectSuccess: "Google account connected successfully",
          disconnectError: "Error disconnecting account",
        },
      },
    },
    workspaces: {
      title: "Workspace management",
      subtitle: "Manage your workspaces.",
      defaultWorkspace: "Default workspace",
      name: "Workspace name",
      namePlaceholder: "Ex: My personal workspace",
      description: "Description",
      descriptionPlaceholder: "Ex: Space for my personal projects",
      color: "Color",
      usageContext: "Usage context",
      deleteTitle: "Delete workspace",
      deleteDescription: "Are you sure you want to delete this workspace? This action is irreversible.",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
    },
    documents: {
      title: "Document management",
      subtitle: "Manage your workspace documents.",
      addDocuments: "Add documents",
      searchDocuments: "Search documents...",
      noDocuments: "No documents",
      addFirstDocument: "Add the first document",
      upload: "Upload",
      dragDrop: "Drag and drop your files here, or click to select",
      supported: "Supported files: PDF, DOCX, TXT",
      maxSize: "Max size: 10 MB",
      processing: "Processing document...",
      processed: "Document processed",
      error: "Error processing document",
      view: "View",
      delete: "Delete",
      deleteConfirmTitle: "Delete document",
      deleteConfirmDescription: "Are you sure you want to delete this document? This action is irreversible.",
      deleteConfirmButton: "Delete",
      uploadSuccess: "Document uploaded successfully!",
      uploadError: "Error uploading document.",
      management: "Document management",
      managementDescription: "Manage your workspace documents",
      noWorkspaceSelected: "No workspace selected",
      noWorkspaceSelectedError: "Please select a workspace",
      uploading: "Uploading...",
      searchPlaceholder: "Search documents...",
      documents: "Documents",
      noResult: "No results",
      addDocumentsDescription: "Add documents to enrich your analyses",
      deleteSuccess: "Document deleted successfully!",
      noDocument: "No document",
    },
    members: {
      title: "Member management",
      subtitle: "Manage your workspace members.",
      invite: "Invite",
      inviteEmailPlaceholder: "Member email",
      inviteRoleLabel: "Role",
      contributorRole: "Contributor",
      viewerRole: "Viewer",
      inviteButton: "Send invitation",
      inviteEmailSent: "An invitation email will be sent to this address with the selected role.",
      membersListTitle: "Workspace members",
      noWorkspaceSelected: "No workspace selected",
      selectWorkspaceMessage: "Please select a workspace to manage its members",
      pendingInvitations: "Pending invitations",
      invitedOn: "Invited on",
      expiresOn: "Expires on",
      resendInvitation: "Resend invitation",
      cancelInvitation: "Cancel invitation",
      removeMember: "Remove member",
      removeMemberConfirmTitle: "Remove member",
      removeMemberConfirmDescription: "Are you sure you want to remove this member from the workspace? This action is irreversible.",
      removeMemberConfirmButton: "Remove",
      roleUpdated: "Role updated successfully!",
      invitationSent: "Invitation sent successfully!",
      invitationError: "Error sending invitation.",
      invitationCanceled: "Invitation canceled successfully!",
      memberRemoved: "Member removed successfully!",
      management: "Member management",
      managementDescription: "Manage your workspace members",
      contributor: "Contributor",
      observer: "Observer",
      workspaceMembers: "Workspace members",
      pending: "Pending",
      admin: "Administrator",
      noMembers: "No members in this workspace",
      },
      appearance: {
      title: "Appearance",
      description: "Customize the application appearance",
      themeLabel: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      },
      data: {
      title: "Data",
      description: "Manage your data and history",
        history: {
        title: "History",
        desc: "Clear your decision history",
      },
      clearHistory: "Clear history",
      toast: {
        cleared: "History cleared",
        clearedDesc: "Your history has been cleared successfully",
      },
    },
  },
  criteriaManager: {
    title: "Criteria",
    addCriterion: "Add criterion",
    criterionPlaceholder: "Ex: Cost",
    updateAnalysis: "Update analysis",
    edit: "Edit",
  },
  criteria: {
    title: "Criteria",
    addButton: "Add a criterion",
    tooltip: "Criteria help you evaluate your options objectively",
  },
  comments: {
    section: {
      empty: "No comments yet",
      addButton: "Add a comment",
      add: "Add",
      cancel: "Cancel",
      toasts: {
        addSuccess: "Comment added successfully",
        updateSuccess: "Comment updated",
        deleteSuccess: "Comment deleted",
      },
    },
    item: {
      types: {
        general: "General",
      },
      createdOn: "Created on",
      modifiedOn: "Modified on",
      reply: "Reply",
      replies: "replies",
      showReplies: "Show replies",
      hideReplies: "Hide replies",
      addReply: "Add a reply",
      replyPlaceholder: "Write a reply...",
      reactions: "Reactions",
      addReaction: "Add reaction",
      removeReaction: "Remove reaction",
    },
    mentions: {
      searchPlaceholder: "Search for a member...",
      noMembersFound: "No members found",
      loading: "Loading...",
      owner: "Owner",
      contributor: "Contributor",
      viewer: "Viewer",
    },
  },
  analysis: {
    followUpSection: {
      title: "Follow-up questions",
      subtitle: "Explore additional aspects of your decision",
      loading: "Generating follow-up questions...",
    },
  },
  optionsLoading: {
    title: "Generating options...",
    subtitle: "Analysis in progress, please wait",
  },
  dataAccuracy: {
    sources: {
      one: "Source",
      other: "Other sources",
    },
    createdOn: "Created on",
    by: "by",
    updatedOn: "Updated on",
    viewSources: "View sources",
  },
  notifications: {
    previousDecisionLoaded: "Previous decision loaded.",
    sourceVerification: "Source verification...",
  },
  share: {
    button: {
      share: "Share",
      simpleShare: "Simple share",
      collaborate: "Collaborate",
      shareAsTemplate: "Share as template",
    },
        toasts: {
      linkCopied: "Link copied to clipboard",
    },
  },
  collaboration: {
    title: "Invite collaborators",
    description: "Share this decision with others to get their opinions and suggestions.",
    inviteByEmail: "Invite by email",
    inviteDescription: "Send an invitation link by email to your collaborators.",
    emailPlaceholder: "Collaborator's email address",
    sendInvitation: "Send invitation",
    },
    history: {
      searchBar: {
      filter: "Filter",
      more: "More",
      categoryLabel: "Category",
      allCategori: "All categories",
      allCategories: "All categories",
      uncategorized: "Uncategorized",
      searchPlaceholder: "Search history...",
      sortBy: "Sort by",
        sort: {
        date: "Date",
        category: "Category",
      },
      exportPdf: "Export to PDF",
      exportJson: "Export to JSON",
      copyText: "Copy text",
      export: "Export",
      clearAll: "Clear all",
        toasts: {
          export: {
          success: "Export successful",
          },
          json: {
          success: "JSON export successful",
        },
      },
      confirm: {
        title: "Confirm action",
        desc: "Are you sure you want to perform this action?",
        cancel: "Cancel",
        ok: "Confirm",
      },
    },
    list: {
      seeMore: "See more",
      },
      item: {
      share: "Share",
      delete: "Delete",
    },
  },
  templates: {
    page: {
      title: "Decision templates",
      description: "Discover and use our popular decision templates",
    },
    filters: {
      searchPlaceholder: "Search templates...",
      categoryAll: "All categories",
      sort: {
        newest: "Newest",
        popular: "Popular",
        mostCopied: "Most copied",
      },
    },
    grid: {
      personalTitle: "Your personal templates",
      professionalTitle: "Professional templates",
      recommendedBadge: "Recommended",
    },
    card: {
      question: "Question",
      open: "Open",
    },
  },
  footer: {
    privacyPolicy: "Privacy policy",
    templates: "Templates",
  },
  workspaces: {
    newWorkspace: "New workspace",
    title: "Workspace Management",
    subtitle: "Create and manage your workspaces",
    yourWorkspaces: "Your Workspaces",
    createNew: "New workspace",
    current: "Current",
    owner: "Owner",
    select: "Select",
    defaultPersonalWorkspace: "Your default personal workspace",
    createdOn: "Created on",
    noWorkspaces: "No workspaces",
    createFirstWorkspace: "Create your first workspace to organize your decisions",
    createWorkspace: "Create workspace",
    deleting: "Deleting...",
    delete: "Delete",
    createSuccess: "Workspace created successfully",
    createError: "Unable to create workspace",
    deleteSuccess: "Workspace deleted successfully",
    deleteError: "Unable to delete workspace",
    selectSuccess: "Workspace selected",
    createDialog: {
      title: "Create a new workspace",
      description: "Organize your decisions in separate spaces for different projects or contexts.",
      nameLabel: "Workspace name",
      namePlaceholder: "e.g.: Project X, Personal, Team...",
      descriptionLabel: "Description (optional)",
      descriptionPlaceholder: "Describe the objective of this workspace...",
      colorLabel: "Color",
      cancel: "Cancel",
        create: "Create",
        creating: "Creating...",
      },
      image: {
        title: "Workspace picture",
        subtitle: "Manage your workspace picture",
        tooBig: "Image is too large (max 5MB)",
        uploadSuccess: "Workspace image updated successfully!",
        uploadError: "Error uploading image",
        deleteSuccess: "Workspace image deleted successfully!",
        deleteError: "Error deleting image",
        uploading: "Uploading...",
        changeImage: "Change image",
        supportedFormats: "Supported formats: JPG, PNG, GIF, WebP",
      },
      edit: {
        title: "Edit workspace",
        description: "Edit your workspace information",
        nameLabel: "Workspace name",
        namePlaceholder: "e.g.: Project X, Personal, Team...",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Describe the objective of this workspace...",
        save: "Save",
        saving: "Saving...",
        savedSuccess: "Workspace updated successfully!",
        savedError: "Error updating workspace",
        manageCurrent: "Manage your current workspace",
      },
      information: {
        title: "Workspace information",
        subtitle: "Manage your workspace information",
        nameLabel: "Workspace name",
        namePlaceholder: "e.g.: Project X, Personal, Team...",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Describe the objective of this workspace...",
        save: "Save",
        saving: "Saving...",
        savedSuccess: "Workspace updated successfully!",
        savedError: "Error updating workspace",
      },
    },
    privacy: {
    title: "Privacy policy",
    lastUpdated: "Last updated",
      sections: {
        dataCollection: {
        title: "Data collection",
        description: "We collect the following data",
        item1: "Profile information",
        item2: "Decisions and analyses",
        item3: "Usage data",
        item4: "Cookies and similar technologies",
        },
        dataUsage: {
        title: "Data usage",
        description: "Your data is used to",
        item1: "Provide our services",
        item2: "Improve user experience",
        item3: "Analyze trends",
        item4: "Personalize content",
        },
        dataSharing: {
        title: "Data sharing",
        description: "We only share your data with",
        item1: "Your explicit consent",
        item2: "Necessary third-party services",
        item3: "Legal authorities when required",
        },
        security: {
        title: "Security",
        description: "We protect your data with",
        item1: "Encryption of sensitive data",
        item2: "Secure and authenticated access",
        item3: "Continuous system monitoring",
        item4: "Security training for staff",
        },
        rights: {
        title: "Your rights",
        description: "You have the following rights",
        item1: "Access to your personal data",
        item2: "Rectification of inaccurate data",
        item3: "Deletion of your data",
        item4: "Data portability",
      },
      cookies: {
        title: "Cookies",
        description: "We use cookies to improve your experience",
        },
        retention: {
        title: "Data retention",
        description: "Your data is retained according to our retention policies",
        },
        contact: {
        title: "Contact",
        description: "For any questions about this policy",
        email: "Email",
        },
        changes: {
        title: "Changes",
        description: "This policy may be modified at any time",
      },
    },
  },
};

// Export translations
export const translations: Record<'fr' | 'en', UITranslations> = {
  fr,
  en,
};
