// Complete UI translations interface and implementations
import type { SupportedLanguage } from '../services/i18nService';

export interface UITranslations {
  analysis: {
    title: string;
    status: {
      analyzing: string;
      complete: string;
    };
    loadingMessages: {
      criteria: string;
      options: string;
      analysis: string;
      finalizing: string;
    };
    error: string;
    retry: string;
    criteriaSection: {
      title: string;
      description: string;
      add: string;
      placeholder: string;
      weight: string;
      importance: string;
      low: string;
      medium: string;
      high: string;
      expandDescription: string;
    };
    optionsSection: {
      title: string;
      description: string;
      expandOptions: string;
      collapseOptions: string;
      viewMore: string;
      viewLess: string;
      pros: string;
      cons: string;
      showMore: string;
      showLess: string;
    };
    resultsSection: {
      title: string;
      winner: string;
      score: string;
      recommendation: string;
      confidence: string;
      confidenceLevel: {
        low: string;
        medium: string;
        high: string;
        veryHigh: string;
      };
      viewDetails: string;
      comparisonTable: string;
      exportResults: string;
    };
    charts: {
      radar: {
        title: string;
        description: string;
      };
      comparison: {
        title: string;
        description: string;
      };
    };
    followUpSection: {
      title: string;
      subtitle: string;
    };
    toasts: {
      templateApplied: string;
      decisionLoaded: string;
    };
  };
  navbar: {
    home: string;
    templates: string;
    settings: string;
    signIn: string;
    signOut: string;
    profile: string;
  };
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    cta: string;
  };
  features: {
    title: string;
    ai: {
      title: string;
      description: string;
    };
    criteria: {
      title: string;
      description: string;
    };
    comparison: {
      title: string;
      description: string;
    };
  };
  auth: {
    signIn: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      submit: string;
      switchToSignUp: string;
      forgotPassword: string;
    };
    signUp: {
      title: string;
      subtitle: string;
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      submit: string;
      switchToSignIn: string;
    };
    forgotPassword: {
      title: string;
      subtitle: string;
      email: string;
      submit: string;
      backToSignIn: string;
      success: string;
    };
    errors: {
      invalidCredentials: string;
      emailExists: string;
      passwordMismatch: string;
      weakPassword: string;
      userNotFound: string;
      invalidEmail: string;
      generic: string;
      passwordsMismatch: string;
      passwordTooShort: string;
    };
    actions: {
      linkGoogle: string;
      signIn: string;
      createAccount: string;
      continueWithGoogle: string;
    };
    fields: {
      email: string;
      password: string;
      fullName: string;
      confirmPassword: string;
    };
    messages: {
      accountCreated: string;
    };
    separator: {
      or: string;
    };
    toggleText: {
      signUpPrompt: string;
      signUpLink: string;
      signInPrompt: string;
      signInLink: string;
    };
  };
  settings: {
    title: string;
    sidebar: {
      profile: string;
      workspaces: string;
      appearance: string;
      documents: string;
      admin: string;
    };
    header: {
      subtitle: string;
    };
    profile: {
      title: string;
      fullName: string;
      email: string;
      avatar: string;
      uploadAvatar: string;
      removeAvatar: string;
      save: string;
      cancel: string;
    };
    appearance: {
      title: string;
      description: string;
      themeLabel: string;
      theme: string;
      light: string;
      dark: string;
      system: string;
      language: string;
    };
    account: {
      title: string;
      deleteAccount: string;
      deleteWarning: string;
    };
    data: {
      title: string;
      description: string;
      history: {
        title: string;
        desc: string;
      };
      clearHistory: string;
    };
    documents: {
      title: string;
      description: string;
      usage: string;
      added: string;
    };
  };
  templates: {
    title: string;
    subtitle: string;
    page: {
      title: string;
      description: string;
    };
    categories: {
      all: string;
      personal: string;
      professional: string;
    };
    use: string;
    preview: string;
    share: string;
    create: string;
    featured: string;
    community: string;
    myTemplates: string;
    grid: {
      personalTitle: string;
      professionalTitle: string;
      recommendedBadge: string;
      emptyMessage: string;
      resetFilters: string;
    };
    card: {
      open: string;
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
    errors: {
      loadError: string;
      openError: string;
      rateLimitError: string;
    };
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    done: string;
    confirm: string;
    retry: string;
    viewMore: string;
    viewLess: string;
    search: string;
    browseFiles: string;
    supportedFormats: string;
  };
  criteria: {
    title: string;
    description: string;
    add: string;
    addButton: string;
    addSuccess: string;
    weight: string;
    importance: string;
    placeholder: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    low: string;
    medium: string;
    high: string;
  };
  share: {
    button: {
      share: string;
      simpleShare: string;
      collaborate: string;
      shareAsTemplate: string;
    };
    title: string;
    subtitle: string;
    copyLink: string;
    linkCopied: string;
    emailShare: string;
    socialShare: string;
    publicDecision: string;
    publicDescription: string;
    privateDecision: string;
    privateDescription: string;
    toasts: {
      linkCopied: string;
    };
  };
  profile: {
    avatar: {
      title: string;
      description: string;
      change: string;
      formatSupport: string;
      dropHere: string;
      tooBig: string;
      uploadSuccess: string;
      uploadError: string;
      deleteSuccess: string;
      deleteError: string;
    };
    info: {
      title: string;
      description: string;
      email: string;
      fullName: string;
      fullNamePlaceholder: string;
      save: string;
      saving: string;
      savedSuccess: string;
      savedError: string;
    };
    language: {
      title: string;
      description: string;
      label: string;
      helpText: string;
    };
    googleAccount: {
      title: string;
      description: string;
      notConnected: string;
    };
  };
  dashboard: {
    title: string;
    subtitle: string;
    recentDecisions: string;
    quickActions: string;
    stats: {
      decisionsCount: string;
      avgConfidence: string;
      timesSaved: string;
    };
  };
  history: {
    title: string;
    subtitle: string;
    empty: {
      title: string;
      description: string;
      cta: string;
    };
    search: {
      placeholder: string;
      noResults: string;
    };
    list: {
      emptyTitle: string;
      emptyDescription: string;
    };
    searchBar: {
      searchPlaceholder: string;
      filter: string;
      more: string;
      export: string;
      clearAll: string;
      categoryLabel: string;
      allCategories: string;
      uncategorized: string;
      sortBy: string;
      sort: {
        date: string;
        category: string;
      };
      exportPdf: string;
      exportJson: string;
      copyText: string;
      confirm: {
        title: string;
        desc: string;
        cancel: string;
        ok: string;
      };
      toasts: {
        export: {
          success: string;
          error: string;
        };
        json: {
          success: string;
          error: string;
        };
        copy: {
          success: string;
          error: string;
        };
      };
    };
    filters: {
      all: string;
      personal: string;
      professional: string;
      recent: string;
      highConfidence: string;
    };
    actions: {
      view: string;
      load: string;
      delete: string;
      export: string;
      share: string;
    };
    sort: {
      date: string;
      category: string;
    };
    item: {
      share: string;
      delete: string;
      followUp: {
        singular: string;
        plural: string;
      };
      more: {
        singular: string;
        plural: string;
      };
    };
    more: string;
    export: string;
    exportPdf: string;
    exportJson: string;
    copyText: string;
    clearAll: string;
    confirm: {
      title: string;
      desc: string;
      cancel: string;
      ok: string;
    };
  };
  workspaces: {
    title: string;
    description: string;
    newWorkspace: string;
    defaultBadge: string;
    currentBadge: string;
    personal: string;
    save: string;
    cancel: string;
    workspaceDescription: string;
    color: string;
    usageContext: string;
    professionalUsage: string;
    professionalDescription: string;
    searchDocuments: string;
    uploadDocuments: string;
  };
  comments: {
    section: {
      titleDefault: string;
      placeholderDefault: string;
      loading: string;
      empty: string;
      add: string;
      cancel: string;
      addButton: string;
      toasts: {
        loadError: string;
        emptyError: string;
        addSuccess: string;
        addError: string;
      };
    };
    item: {
      types: {
        general: string;
        criteria: string;
        option: string;
        follow_up: string;
      };
      createdOn: string;
      modifiedOn: string;
    };
  };
  dataAccuracy: {
    unknown: {
      date: string;
      datetime: string;
      author: string;
      user: string;
    };
    createdOn: string;
    updatedOn: string;
    by: string;
    viewSources: string;
    noExternalSources: string;
    sources: {
      one: string;
      other: string;
    };
  };
  decision: {
    title: string;
    recommended: string;
    advantages: string;
    disadvantages: string;
    learnMore: string;
    moreAdvantages: string;
    moreDisadvantages: string;
    search: string;
    comparisonTableCaption: string;
    comparisonTable: string;
    seeMoreOptions: string;
    noResults: string;
    pointsOfAttention: string;
    usefulLinks: string;
    popularVideos: string;
    seeMore: string;
    seeLess: string;
    toasts: {
      alreadyRunning: string;
      followup: {
        error: string;
      };
    };
  };
  footer: {
    allRightsReserved: string;
    privacyPolicy: string;
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
      };
      dataUsage: {
        title: string;
        description: string;
        item1: string;
        item2: string;
        item3: string;
      };
      dataSharing: {
        title: string;
        description: string;
      };
      cookies: {
        title: string;
        description: string;
      };
      rights: {
        title: string;
        description: string;
      };
      contact: {
        title: string;
        description: string;
      };
    };
  };
  analysisResult: {
    confidence: string;
    winner: string;
    score: string;
    reasons: string;
    criteria: string;
    options: string;
    analysis: string;
    recommendation: string;
    nextSteps: string;
    chartTitle: string;
    comparisonTitle: string;
    radarChartTitle: string;
    usefulLinks: string;
    popularVideos: string;
    seeMore: string;
    seeLess: string;
    pointsOfAttention: string;
    moreAdvantages: string;
    comparisonTableCaption: string;
    seeMoreOptions: string;
  };
  dilemmaSetup: {
    hero: {
      titleLine1: string;
      brand: string;
      subtitle: string;
    };
    dropHere: string;
    attachFile: string;
    launchAnalysis: string;
    helpText: string;
    attachedDocs: string;
    history: {
      title: string;
      description: string;
    };
    templates: {
      description: string;
      viewAll: string;
    };
    trending: {
      title: string;
      refresh: string;
    };
    analysisStarted: string;
    fileTooLarge: string;
  };
  optionsLoading: {
    title: string;
    subtitle: string;
    analyzing: string;
    generatingOptions: string;
    evaluatingCriteria: string;
    almostDone: string;
  };
  criteriaManager: {
    title: string;
    subtitle: string;
    addCriterion: string;
    placeholder: string;
    importance: string;
    weight: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
  };
  fileUpload: {
    dropZone: string;
    selectFiles: string;
    supportedFormats: string;
    maxSize: string;
    uploading: string;
    success: string;
    error: string;
    remove: string;
  };
  collaboration: {
    title: string;
    subtitle: string;
    invite: string;
    inviteEmail: string;
    invitePlaceholder: string;
    permissions: {
      view: string;
      comment: string;
      edit: string;
    };
    members: string;
    pending: string;
    remove: string;
    resend: string;
    description: string;
    publicLink: string;
    publicLinkDescription: string;
    createLink: string;
  };
  templates_: {
    personal: {
      title: string;
      description: string;
      examples: string[];
    };
    professional: {
      title: string;
      description: string;
      examples: string[];
    };
    custom: {
      title: string;
      description: string;
      create: string;
      name: string;
      namePlaceholder: string;
      description_: string;
      descriptionPlaceholder: string;
      category: string;
      dilemma: string;
      dilemmaPlaceholder: string;
      criteria: string;
      addCriterion: string;
      criterionName: string;
      criterionWeight: string;
      cancel: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
      required: string;
    };
  };
  export: {
    menuButton: {
      idle: string;
      busy: string;
    };
    menu: {
      pdf: string;
      pdfStandard: string;
      pdfCustom: string;
      image: string;
      json: string;
      copy: string;
    };
    pdfDialog: {
      title: string;
      subtitle: string;
      includeCharts: string;
      includeDetails: string;
      format: string;
      standardFormat: string;
      customFormat: string;
      cancel: string;
      export: string;
      exporting: string;
    };
    success: {
      title: string;
      subtitle: string;
    };
    error: {
      title: string;
      subtitle: string;
    };
  };
  workspace: {
    selector: {
      title: string;
      personal: string;
      professional: string;
      create: string;
      manage: string;
    };
    create: {
      title: string;
      subtitle: string;
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
    settings: {
      title: string;
      subtitle: string;
      defaultWorkspace: string;
      setDefault: string;
    };
    documents: {
      title: string;
      subtitle: string;
      upload: string;
      dragDrop: string;
      supported: string;
      maxSize: string;
      processing: string;
      processed: string;
      error: string;
      view: string;
      download: string;
      delete: string;
      cancel: string;
      confirm: string;
      loading: string;
    };
  };
}

export const translations: Record<'fr' | 'en', UITranslations> = {
  fr: {
    analysis: {
      title: 'Analyse de décision',
      status: {
        analyzing: 'Analyse en cours...',
        complete: 'Analyse terminée',
      },
      loadingMessages: {
        criteria: 'Identification des critères de décision...',
        options: 'Génération des options disponibles...',
        analysis: 'Analyse comparative en cours...',
        finalizing: 'Finalisation de la recommandation...',
      },
      error: 'Une erreur s\'est produite lors de l\'analyse',
      retry: 'Réessayer',
      criteriaSection: {
        title: 'Critères de décision',
        description: 'Facteurs importants pour votre décision',
        add: 'Ajouter un critère',
        placeholder: 'Nouveau critère...',
        weight: 'Poids',
        importance: 'Importance',
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée',
        expandDescription: 'Développer la description',
      },
      optionsSection: {
        title: 'Options disponibles',
        description: 'Alternatives identifiées pour votre décision',
        expandOptions: 'Développer les options',
        collapseOptions: 'Réduire les options',
        viewMore: 'Voir plus',
        viewLess: 'Voir moins',
        pros: 'Avantages',
        cons: 'Inconvénients',
        showMore: 'Afficher plus',
        showLess: 'Afficher moins',
      },
      resultsSection: {
        title: 'Recommandation',
        winner: 'Meilleure option',
        score: 'Score',
        recommendation: 'Recommandation',
        confidence: 'Confiance',
        confidenceLevel: {
          low: 'Faible',
          medium: 'Moyenne',
          high: 'Élevée',
          veryHigh: 'Très élevée',
        },
        viewDetails: 'Voir les détails',
        comparisonTable: 'Tableau comparatif',
        exportResults: 'Exporter les résultats',
      },
      charts: {
        radar: {
          title: 'Vue d\'ensemble des critères',
          description: 'Performance de chaque option selon les critères',
        },
        comparison: {
          title: 'Comparaison des scores',
          description: 'Scores totaux de chaque option',
        },
      },
      followUpSection: {
        title: 'Questions de suivi',
        subtitle: 'Cliquez sur une question pour lancer une nouvelle analyse complète',
      },
      toasts: {
        templateApplied: 'Modèle appliqué !',
        decisionLoaded: 'Décision précédente chargée.',
      },
    },
    navbar: {
      home: 'Accueil',
      templates: 'Modèles',
      settings: 'Paramètres',
      signIn: 'Se connecter',
      signOut: 'Se déconnecter',
      profile: 'Profil',
    },
    hero: {
      title: 'Prenez des décisions',
      titleHighlight: 'éclairées',
      subtitle: 'Utilisez l\'IA pour analyser vos options et prendre les meilleures décisions',
      cta: 'Commencer maintenant',
    },
    features: {
      title: 'Comment ça marche',
      ai: {
        title: 'Analyse IA',
        description: 'Notre IA analyse votre situation et identifie les critères clés',
      },
      criteria: {
        title: 'Critères personnalisés',
        description: 'Définissez vos propres critères selon vos priorités',
      },
      comparison: {
        title: 'Comparaison intelligente',
        description: 'Comparez objectivement toutes vos options',
      },
    },
    auth: {
      signIn: {
        title: 'Connexion',
        subtitle: 'Connectez-vous à votre compte',
        email: 'Email',
        password: 'Mot de passe',
        submit: 'Se connecter',
        switchToSignUp: 'Pas encore de compte ? Inscrivez-vous',
        forgotPassword: 'Mot de passe oublié ?',
      },
      signUp: {
        title: 'Inscription',
        subtitle: 'Créez votre compte',
        fullName: 'Nom complet',
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        submit: 'S\'inscrire',
        switchToSignIn: 'Déjà un compte ? Connectez-vous',
      },
      forgotPassword: {
        title: 'Mot de passe oublié',
        subtitle: 'Entrez votre email pour réinitialiser votre mot de passe',
        email: 'Email',
        submit: 'Envoyer',
        backToSignIn: 'Retour à la connexion',
        success: 'Email de réinitialisation envoyé !',
      },
      errors: {
        invalidCredentials: 'Email ou mot de passe incorrect',
        emailExists: 'Cet email est déjà utilisé',
        passwordMismatch: 'Les mots de passe ne correspondent pas',
        weakPassword: 'Le mot de passe est trop faible',
        userNotFound: 'Utilisateur non trouvé',
        invalidEmail: 'Email invalide',
        generic: 'Une erreur s\'est produite',
        passwordsMismatch: 'Les mots de passe ne correspondent pas',
        passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
      },
      actions: {
        linkGoogle: 'Associer un compte Google',
        signIn: 'Se connecter',
        createAccount: 'Créer un compte',
        continueWithGoogle: 'Continuer avec Google',
      },
      fields: {
        email: 'Adresse email',
        password: 'Mot de passe',
        fullName: 'Nom complet',
        confirmPassword: 'Confirmer le mot de passe',
      },
      messages: {
        accountCreated: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
      },
      separator: {
        or: 'OU',
      },
      toggleText: {
        signUpPrompt: 'Pas encore de compte ?',
        signUpLink: 'Créer un compte',
        signInPrompt: 'Déjà un compte ?',
        signInLink: 'Se connecter',
      },
    },
    settings: {
      title: 'Paramètres',
      sidebar: {
        profile: 'Profil',
        workspaces: 'Espaces de travail',
        appearance: 'Apparence',
        documents: 'Documents',
        admin: 'Administration',
      },
      header: {
        subtitle: 'Gérez vos préférences et paramètres',
      },
      profile: {
        title: 'Profil',
        fullName: 'Nom complet',
        email: 'Email',
        avatar: 'Photo de profil',
        uploadAvatar: 'Changer la photo',
        removeAvatar: 'Supprimer la photo',
        save: 'Sauvegarder',
        cancel: 'Annuler',
      },
      appearance: {
        title: 'Apparence',
        description: 'Personnalisez l\'apparence de l\'application',
        themeLabel: 'Choisissez votre thème',
        theme: 'Thème',
        light: 'Clair',
        dark: 'Sombre',
        system: 'Système',
        language: 'Langue',
      },
      account: {
        title: 'Compte',
        deleteAccount: 'Supprimer le compte',
        deleteWarning: 'Cette action est irréversible',
      },
      data: {
        title: 'Données et historique',
        description: 'Gérez vos données et votre historique de décisions',
        history: {
          title: 'Historique des décisions',
          desc: 'Supprimer toutes vos décisions sauvegardées',
        },
        clearHistory: 'Effacer l\'historique',
      },
      documents: {
        title: 'Documents',
        description: 'Gérez vos préférences et paramètres',
        usage: 'fois',
        added: 'Ajouté il y a environ',
      },
    },
    templates: {
      title: 'Modèles de décision',
      subtitle: 'Utilisez nos modèles prêts à l\'emploi pour démarrer rapidement',
      page: {
        title: 'Templates de décision',
        description: 'Découvrez des modèles de décision prêts à utiliser pour différentes situations.',
      },
      categories: {
        all: 'Tous',
        personal: 'Personnel',
        professional: 'Professionnel',
      },
      use: 'Utiliser',
      preview: 'Aperçu',
      share: 'Partager',
      create: 'Créer',
      featured: 'À la une',
      community: 'Communauté',
      myTemplates: 'Mes modèles',
      grid: {
        personalTitle: 'Templates personnels',
        professionalTitle: 'Templates professionnels',
        recommendedBadge: 'Recommandé',
        emptyMessage: 'Aucun template trouvé avec ces critères.',
        resetFilters: 'Réinitialiser les filtres',
      },
      card: {
        open: 'Ouvrir',
      },
      filters: {
        searchPlaceholder: 'Rechercher un template...',
        categoryAll: 'Toutes les catégories',
        sort: {
          newest: 'Plus récents',
          popular: 'Plus populaires',
          mostCopied: 'Plus copiés',
        },
      },
      errors: {
        loadError: 'Erreur lors du chargement des templates',
        openError: 'Erreur lors de l\'ouverture du template',
        rateLimitError: 'Limite de création de previews atteinte. Veuillez patienter quelques minutes.',
      },
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      done: 'Terminé',
      confirm: 'Confirmer',
      retry: 'Réessayer',
      viewMore: 'Voir plus',
      viewLess: 'Voir moins',
      search: 'Rechercher',
      browseFiles: 'Parcourir les fichiers',
      supportedFormats: 'PDF, Word, Excel, CSV, TXT',
    },
    criteria: {
      title: 'Critères de décision',
      description: 'Gérez les critères de votre décision',
      add: 'Ajouter un critère',
      addButton: 'Ajouter un critère',
      addSuccess: 'Critère ajouté avec succès',
      weight: 'Poids',
      importance: 'Importance',
      placeholder: 'Nom du critère...',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
    },
    share: {
      button: {
        share: 'Partager',
        simpleShare: 'Partager le lien',
        collaborate: 'Collaborer',
        shareAsTemplate: 'Partager comme modèle',
      },
      title: 'Partager la décision',
      subtitle: 'Partagez votre analyse avec d\'autres',
      copyLink: 'Copier le lien',
      linkCopied: 'Lien copié !',
      emailShare: 'Partager par email',
      socialShare: 'Partager sur les réseaux',
      publicDecision: 'Décision publique',
      publicDescription: 'Tout le monde peut voir cette décision',
      privateDecision: 'Décision privée',
      privateDescription: 'Seules les personnes avec le lien peuvent voir',
      toasts: {
        linkCopied: 'Lien copié dans le presse-papiers !',
      },
    },
    profile: {
      avatar: {
        title: 'Photo de profil',
        description: 'Personnalisez votre avatar',
        change: 'Changer la photo',
        formatSupport: 'JPG, PNG, GIF jusqu\'à 2MB',
        dropHere: 'Déposez votre image ici',
        tooBig: 'Le fichier est trop volumineux (max 2MB)',
        uploadSuccess: 'Photo mise à jour avec succès',
        uploadError: 'Erreur lors du téléchargement',
        deleteSuccess: 'Photo supprimée avec succès',
        deleteError: 'Erreur lors de la suppression',
      },
      info: {
        title: 'Informations personnelles',
        description: 'Gérez vos informations de profil',
        email: 'Adresse email',
        fullName: 'Nom complet',
        fullNamePlaceholder: 'Votre nom complet',
        save: 'Sauvegarder',
        saving: 'Sauvegarde...',
        savedSuccess: 'Profil sauvegardé avec succès',
        savedError: 'Erreur lors de la sauvegarde',
      },
      language: {
        title: 'Langue de l\'interface',
        description: 'Choisissez votre langue préférée',
        label: 'Langue',
        helpText: 'Sélectionnez la langue d\'affichage de l\'interface',
      },
      googleAccount: {
        title: 'Compte Google',
        description: 'Gérez votre connexion Google',
        notConnected: 'Compte Google non connecté',
      },
    },
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Gérez vos décisions et analyses',
      recentDecisions: 'Décisions récentes',
      quickActions: 'Actions rapides',
      stats: {
        decisionsCount: 'Décisions prises',
        avgConfidence: 'Confiance moyenne',
        timesSaved: 'Temps économisé',
      },
    },
    history: {
      title: 'Historique',
      subtitle: 'Consultez vos décisions passées',
      empty: {
        title: 'Aucune décision',
        description: 'Vous n\'avez pas encore pris de décisions',
        cta: 'Commencer une analyse',
      },
      search: {
        placeholder: 'Rechercher une décision...',
        noResults: 'Aucun résultat trouvé',
      },
      list: {
        emptyTitle: 'Aucune décision dans l\'historique',
        emptyDescription: 'Vos analyses passées apparaîtront ici.',
      },
      searchBar: {
        searchPlaceholder: 'Rechercher dans l\'historique...',
        filter: 'Filtrer',
        more: 'Plus',
        export: 'Exporter',
        clearAll: 'Tout effacer',
        categoryLabel: 'Catégorie',
        allCategories: 'Toutes les catégories',
        uncategorized: 'Non catégorisé',
        sortBy: 'Trier par',
        sort: {
          date: 'Date',
          category: 'Catégorie',
        },
        exportPdf: 'Exporter en PDF',
        exportJson: 'Exporter en JSON',
        copyText: 'Copier le texte',
        confirm: {
          title: 'Confirmer la suppression',
          desc: 'Cette action supprimera définitivement tout votre historique de décisions. Cette action est irréversible.',
          cancel: 'Annuler',
          ok: 'Confirmer',
        },
        toasts: {
          export: {
            success: 'Historique exporté en PDF avec succès',
            error: 'Erreur lors de l\'export PDF',
          },
          json: {
            success: 'Historique exporté en JSON avec succès',
            error: 'Erreur lors de l\'export JSON',
          },
          copy: {
            success: 'Texte copié dans le presse-papiers',
            error: 'Erreur lors de la copie',
          },
        },
      },
      filters: {
        all: 'Toutes',
        personal: 'Personnel',
        professional: 'Professionnel',
        recent: 'Récentes',
        highConfidence: 'Confiance élevée',
      },
      actions: {
        view: 'Voir',
        load: 'Charger',
        delete: 'Supprimer',
        export: 'Exporter',
        share: 'Partager',
      },
      sort: {
        date: 'Date',
        category: 'Catégorie',
      },
      item: {
        share: 'Partager',
        delete: 'Supprimer',
        followUp: {
          singular: 'question de suivi',
          plural: 'questions de suivi',
        },
        more: {
          singular: 'autre',
          plural: 'autres',
        },
      },
      more: 'Plus',
      export: 'Exporter',
      exportPdf: 'Exporter en PDF',
      exportJson: 'Exporter en JSON',
      copyText: 'Copier le texte',
      clearAll: 'Tout effacer',
      confirm: {
        title: 'Confirmer la suppression',
        desc: 'Êtes-vous sûr de vouloir supprimer cette décision ?',
        cancel: 'Annuler',
        ok: 'Supprimer',
      },
    },
    comments: {
      section: {
        titleDefault: 'Commentaires',
        placeholderDefault: 'Ajouter un commentaire...',
        loading: 'Chargement des commentaires...',
        empty: 'Aucun commentaire pour le moment',
        add: 'Ajouter',
        cancel: 'Annuler',
        addButton: 'Ajouter un commentaire',
        toasts: {
          loadError: 'Erreur lors du chargement des commentaires',
          emptyError: 'Le commentaire ne peut pas être vide',
          addSuccess: 'Commentaire ajouté avec succès',
          addError: 'Erreur lors de l\'ajout du commentaire',
        },
      },
      item: {
        types: {
          general: 'Général',
          criteria: 'Critère',
          option: 'Option',
          follow_up: 'Question de suivi',
        },
        createdOn: 'Créé le',
        modifiedOn: 'Modifié le',
      },
    },
    dataAccuracy: {
      unknown: {
        date: 'Date inconnue',
        datetime: 'Date et heure inconnues',
        author: 'Auteur inconnu',
        user: 'Utilisateur inconnu',
      },
      createdOn: 'Créé le',
      updatedOn: 'mis à jour le',
      by: 'par',
      viewSources: 'Voir les sources',
      noExternalSources: 'Aucune source externe disponible',
      sources: {
        one: 'source',
        other: 'sources',
      },
    },
    decision: {
      title: 'Décision',
      recommended: 'Recommandé',
      advantages: 'Avantages',
      disadvantages: 'Inconvénients',
      learnMore: 'En savoir plus',
      moreAdvantages: 'avantages supplémentaires',
      moreDisadvantages: 'inconvénients supplémentaires',
      search: 'Rechercher',
      comparisonTableCaption: 'Tableau de comparaison de {count} options',
      comparisonTable: 'Tableau de comparaison',
      seeMoreOptions: 'Voir plus d\'options',
      noResults: 'Aucun résultat disponible',
      pointsOfAttention: 'Points d\'attention',
      usefulLinks: 'Liens utiles',
      popularVideos: 'Vidéos populaires',
      seeMore: 'Voir plus',
      seeLess: 'Voir moins',
      toasts: {
        alreadyRunning: 'Une analyse est déjà en cours',
        followup: {
          error: 'Erreur lors de la question de suivi',
        },
      },
    },
    footer: {
      allRightsReserved: 'Tous droits réservés',
      privacyPolicy: 'Politique de confidentialité',
    },
    privacy: {
      title: 'Politique de confidentialité',
      lastUpdated: 'Dernière mise à jour',
      sections: {
        dataCollection: {
          title: 'Collecte de données',
          description: 'Nous collectons les informations suivantes',
          item1: 'Données de décision et critères',
          item2: 'Informations de profil utilisateur',
          item3: 'Données d\'usage de l\'application',
        },
        dataUsage: {
          title: 'Utilisation des données',
          description: 'Vos données sont utilisées pour',
          item1: 'Améliorer nos algorithmes de décision',
          item2: 'Personnaliser votre expérience',
          item3: 'Fournir un support technique',
        },
        dataSharing: {
          title: 'Partage de données',
          description: 'Nous ne partageons pas vos données personnelles avec des tiers',
        },
        cookies: {
          title: 'Cookies',
          description: 'Nous utilisons des cookies pour améliorer votre expérience',
        },
        rights: {
          title: 'Vos droits',
          description: 'Vous avez le droit d\'accéder, modifier ou supprimer vos données',
        },
        contact: {
          title: 'Contact',
          description: 'Pour toute question, contactez-nous',
        },
      },
    },
    analysisResult: {
      confidence: 'Confiance',
      winner: 'Meilleure option',
      score: 'Score',
      reasons: 'Raisons',
      criteria: 'Critères',
      options: 'Options',
      analysis: 'Analyse',
      recommendation: 'Recommandation',
      nextSteps: 'Prochaines étapes',
      chartTitle: 'Analyse comparative',
      comparisonTitle: 'Comparaison des options',
      radarChartTitle: 'Vue radar des critères',
      usefulLinks: 'Liens utiles',
      popularVideos: 'Vidéos populaires',
      seeMore: 'Voir plus',
      seeLess: 'Voir moins',
      pointsOfAttention: 'Points d\'attention',
      moreAdvantages: 'Autres avantages',
      comparisonTableCaption: 'Tableau de comparaison des options',
      seeMoreOptions: 'Voir plus d\'options',
    },
    dilemmaSetup: {
      hero: {
        titleLine1: 'Vos décisions seront',
        brand: 'Rationable',
        subtitle: 'De l\'incertitude à la clarté : exploitez la puissance de l\'IA',
      },
      dropHere: 'Déposez vos fichiers ici',
      attachFile: 'Joindre un fichier',
      launchAnalysis: 'Lancer l\'analyse',
      helpText: 'Décrivez le problème ou la décision que vous devez prendre. Vous pouvez aussi glisser-déposer des documents directement dans cette zone.',
      attachedDocs: 'Documents joints',
      history: {
        title: 'Historique des décisions',
        description: 'Chargez ou supprimez vos analyses passées.',
      },
      templates: {
        description: 'Utilisez des modèles prêts à l\'emploi pour commencer rapidement',
        viewAll: 'Voir tout',
      },
      trending: {
        title: 'Tendances de la semaine en {country}',
        refresh: 'Actualiser',
      },
      analysisStarted: 'Analyse démarrée !',
      fileTooLarge: 'est trop volumineux (max 10MB)',
    },
    optionsLoading: {
      title: 'Génération des options',
      subtitle: 'L\'IA analyse votre situation...',
      analyzing: 'Analyse en cours...',
      generatingOptions: 'Génération des options...',
      evaluatingCriteria: 'Évaluation des critères...',
      almostDone: 'Presque terminé...',
    },
    criteriaManager: {
      title: 'Gestionnaire de critères',
      subtitle: 'Ajoutez et gérez vos critères de décision',
      addCriterion: 'Ajouter un critère',
      placeholder: 'Nom du critère...',
      importance: 'Importance',
      weight: 'Poids',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
    },
    fileUpload: {
      dropZone: 'Glissez-déposez vos fichiers ici',
      selectFiles: 'Sélectionner des fichiers',
      supportedFormats: 'Formats supportés',
      maxSize: 'Taille max',
      uploading: 'Téléchargement...',
      success: 'Fichier téléchargé',
      error: 'Erreur de téléchargement',
      remove: 'Supprimer',
    },
    collaboration: {
      title: 'Collaboration',
      subtitle: 'Travaillez ensemble sur cette décision',
      invite: 'Inviter des collaborateurs',
      inviteEmail: 'Email',
      invitePlaceholder: 'email@exemple.com',
      permissions: {
        view: 'Lecture seule',
        comment: 'Commenter',
        edit: 'Modifier',
      },
      members: 'Membres',
      pending: 'En attente',
      remove: 'Retirer',
      resend: 'Renvoyer',
      description: 'Invitez d\'autres personnes à collaborer sur cette décision',
      publicLink: 'Lien public',
      publicLinkDescription: 'Toute personne avec ce lien peut voir et commenter',
      createLink: 'Créer un lien',
    },
    templates_: {
      personal: {
        title: 'Modèles personnels',
        description: 'Décisions de la vie quotidienne',
        examples: ['Choix de logement', 'Décision d\'achat', 'Choix de carrière'],
      },
      professional: {
        title: 'Modèles professionnels',
        description: 'Décisions business et stratégiques',
        examples: ['Stratégie marketing', 'Recrutement', 'Investissement'],
      },
      custom: {
        title: 'Modèles personnalisés',
        description: 'Créez vos propres modèles',
        create: 'Créer un modèle',
        name: 'Nom du modèle',
        namePlaceholder: 'Mon modèle de décision',
        description_: 'Description',
        descriptionPlaceholder: 'Décrivez à quoi sert ce modèle',
        category: 'Catégorie',
        dilemma: 'Dilemme type',
        dilemmaPlaceholder: 'Décrivez le type de décision',
        criteria: 'Critères prédéfinis',
        addCriterion: 'Ajouter un critère',
        criterionName: 'Nom du critère',
        criterionWeight: 'Poids',
        cancel: 'Annuler',
        submit: 'Créer le modèle',
        submitting: 'Création...',
        success: 'Modèle créé !',
        error: 'Erreur lors de la création',
        required: 'Ce champ est requis',
      },
    },
    export: {
      menuButton: {
        idle: 'Exporter',
        busy: 'Export...',
      },
      menu: {
        pdf: 'PDF',
        pdfStandard: 'PDF Standard',
        pdfCustom: 'PDF Personnalisé',
        image: 'Image',
        json: 'JSON',
        copy: 'Copier le texte',
      },
      pdfDialog: {
        title: 'Exporter en PDF',
        subtitle: 'Personnalisez votre export',
        includeCharts: 'Inclure les graphiques',
        includeDetails: 'Inclure les détails',
        format: 'Format',
        standardFormat: 'Standard',
        customFormat: 'Personnalisé',
        cancel: 'Annuler',
        export: 'Exporter',
        exporting: 'Export en cours...',
      },
      success: {
        title: 'Export réussi',
        subtitle: 'Votre fichier a été téléchargé',
      },
      error: {
        title: 'Erreur d\'export',
        subtitle: 'Une erreur s\'est produite',
      },
    },
    workspace: {
      selector: {
        title: 'Espace de travail',
        personal: 'Personnel',
        professional: 'Professionnel',
        create: 'Créer',
        manage: 'Gérer',
      },
      create: {
        title: 'Créer un espace de travail',
        subtitle: 'Organisez vos décisions par contexte',
        name: 'Nom',
        namePlaceholder: 'Mon espace de travail',
        description: 'Description',
        descriptionPlaceholder: 'Description de l\'espace',
        color: 'Couleur',
        usageContext: 'Contexte d\'usage',
        deleteTitle: 'Supprimer l\'espace',
        deleteDescription: 'Cette action est irréversible',
        delete: 'Supprimer',
        save: 'Sauvegarder',
        cancel: 'Annuler',
      },
      settings: {
        title: 'Paramètres des espaces',
        subtitle: 'Gérez vos espaces de travail',
        defaultWorkspace: 'Espace par défaut',
        setDefault: 'Définir par défaut',
      },
      documents: {
        title: 'Documents',
        subtitle: 'Gérez les documents de cet espace',
        upload: 'Télécharger',
        dragDrop: 'Glisser-déposer',
        supported: 'Formats supportés',
        maxSize: 'Taille max',
        processing: 'Traitement...',
        processed: 'Traité',
        error: 'Erreur',
        view: 'Voir',
        download: 'Télécharger',
        delete: 'Supprimer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        loading: 'Chargement...',
      },
    },
    workspaces: {
      title: 'Espaces de travail',
      description: 'Gérez vos préférences et paramètres',
      newWorkspace: 'Nouvel espace de travail',
      defaultBadge: 'Par défaut',
      currentBadge: 'Actuel',
      personal: 'Personnel',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      workspaceDescription: 'Description de l\'espace de travail',
      color: 'Couleur',
      usageContext: 'Contexte d\'utilisation',
      professionalUsage: 'Usage professionnel',
      professionalDescription: 'Pour les décisions commerciales et professionnelles',
      searchDocuments: 'Rechercher des documents',
      uploadDocuments: 'Télécharger des documents',
    },
  },
  en: {
    analysis: {
      title: 'Decision Analysis',
      status: {
        analyzing: 'Analyzing...',
        complete: 'Analysis Complete',
      },
      loadingMessages: {
        criteria: 'Identifying decision criteria...',
        options: 'Generating available options...',
        analysis: 'Performing comparative analysis...',
        finalizing: 'Finalizing recommendation...',
      },
      error: 'An error occurred during analysis',
      retry: 'Retry',
      criteriaSection: {
        title: 'Decision Criteria',
        description: 'Important factors for your decision',
        add: 'Add criteria',
        placeholder: 'New criteria...',
        weight: 'Weight',
        importance: 'Importance',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        expandDescription: 'Expand description',
      },
      optionsSection: {
        title: 'Available Options',
        description: 'Identified alternatives for your decision',
        expandOptions: 'Expand options',
        collapseOptions: 'Collapse options',
        viewMore: 'View more',
        viewLess: 'View less',
        pros: 'Pros',
        cons: 'Cons',
        showMore: 'Show more',
        showLess: 'Show less',
      },
      resultsSection: {
        title: 'Recommendation',
        winner: 'Best option',
        score: 'Score',
        recommendation: 'Recommendation',
        confidence: 'Confidence',
        confidenceLevel: {
          low: 'Low',
          medium: 'Medium',
          high: 'High',
          veryHigh: 'Very High',
        },
        viewDetails: 'View details',
        comparisonTable: 'Comparison table',
        exportResults: 'Export results',
      },
      charts: {
        radar: {
          title: 'Criteria Overview',
          description: 'Performance of each option across criteria',
        },
        comparison: {
          title: 'Score Comparison',
          description: 'Total scores for each option',
        },
      },
      followUpSection: {
        title: 'Follow-up questions',
        subtitle: 'Click on a question to launch a complete new analysis',
      },
      toasts: {
        templateApplied: 'Template applied!',
        decisionLoaded: 'Previous decision loaded.',
      },
    },
    navbar: {
      home: 'Home',
      templates: 'Templates',
      settings: 'Settings',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      profile: 'Profile',
    },
    hero: {
      title: 'Make',
      titleHighlight: 'informed decisions',
      subtitle: 'Use AI to analyze your options and make the best decisions',
      cta: 'Get Started Now',
    },
    features: {
      title: 'How it works',
      ai: {
        title: 'AI Analysis',
        description: 'Our AI analyzes your situation and identifies key criteria',
      },
      criteria: {
        title: 'Custom Criteria',
        description: 'Define your own criteria based on your priorities',
      },
      comparison: {
        title: 'Smart Comparison',
        description: 'Objectively compare all your options',
      },
    },
    auth: {
      signIn: {
        title: 'Sign In',
        subtitle: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        submit: 'Sign In',
        switchToSignUp: 'Don\'t have an account? Sign up',
        forgotPassword: 'Forgot password?',
      },
      signUp: {
        title: 'Sign Up',
        subtitle: 'Create your account',
        fullName: 'Full Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        submit: 'Sign Up',
        switchToSignIn: 'Already have an account? Sign in',
      },
      forgotPassword: {
        title: 'Forgot Password',
        subtitle: 'Enter your email to reset your password',
        email: 'Email',
        submit: 'Send Reset Email',
        backToSignIn: 'Back to Sign In',
        success: 'Reset email sent!',
      },
      errors: {
        invalidCredentials: 'Invalid email or password',
        emailExists: 'Email already exists',
        passwordMismatch: 'Passwords do not match',
        weakPassword: 'Password is too weak',
        userNotFound: 'User not found',
        invalidEmail: 'Invalid email',
        generic: 'An error occurred',
        passwordsMismatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 6 characters long',
      },
      actions: {
        linkGoogle: 'Link Google Account',
        signIn: 'Sign In',
        createAccount: 'Create Account',
        continueWithGoogle: 'Continue with Google',
      },
      fields: {
        email: 'Email address',
        password: 'Password',
        fullName: 'Full name',
        confirmPassword: 'Confirm password',
      },
      messages: {
        accountCreated: 'Account created successfully! You can now sign in.',
      },
      separator: {
        or: 'OR',
      },
      toggleText: {
        signUpPrompt: 'Don\'t have an account?',
        signUpLink: 'Create account',
        signInPrompt: 'Already have an account?',
        signInLink: 'Sign in',
      },
    },
    settings: {
      title: 'Settings',
      sidebar: {
        profile: 'Profile',
        workspaces: 'Workspaces',
        appearance: 'Appearance',
        documents: 'Documents',
        admin: 'Admin',
      },
      header: {
        subtitle: 'Manage your preferences and settings',
      },
      profile: {
        title: 'Profile',
        fullName: 'Full Name',
        email: 'Email',
        avatar: 'Avatar',
        uploadAvatar: 'Upload Avatar',
        removeAvatar: 'Remove Avatar',
        save: 'Save',
        cancel: 'Cancel',
      },
      appearance: {
        title: 'Appearance',
        description: 'Customize the app appearance',
        themeLabel: 'Choose your theme',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        language: 'Language',
      },
      account: {
        title: 'Account',
        deleteAccount: 'Delete Account',
        deleteWarning: 'This action cannot be undone',
      },
      data: {
        title: 'Data & History',
        description: 'Manage your data and decision history',
        history: {
          title: 'Decision History',
          desc: 'Delete all your saved decisions',
        },
        clearHistory: 'Clear History',
      },
      documents: {
        title: 'Documents',
        description: 'Manage your preferences and settings',
        usage: 'times',
        added: 'Added about',
      },
    },
    templates: {
      title: 'Decision Templates',
      subtitle: 'Use our ready-made templates to get started quickly',
      page: {
        title: 'Decision Templates',
        description: 'Discover ready-to-use decision templates for different situations.',
      },
      categories: {
        all: 'All',
        personal: 'Personal',
        professional: 'Professional',
      },
      use: 'Use',
      preview: 'Preview',
      share: 'Share',
      create: 'Create',
      featured: 'Featured',
      community: 'Community',
      myTemplates: 'My Templates',
      grid: {
        personalTitle: 'Personal Templates',
        professionalTitle: 'Professional Templates',
        recommendedBadge: 'Recommended',
        emptyMessage: 'No templates found with these criteria.',
        resetFilters: 'Reset Filters',
      },
      card: {
        open: 'Open',
      },
      filters: {
        searchPlaceholder: 'Search templates...',
        categoryAll: 'All categories',
        sort: {
          newest: 'Newest',
          popular: 'Most popular',
          mostCopied: 'Most copied',
        },
      },
      errors: {
        loadError: 'Error loading templates',
        openError: 'Error opening template',
        rateLimitError: 'Preview creation limit reached. Please wait a few minutes.',
      },
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      done: 'Done',
      confirm: 'Confirm',
      retry: 'Retry',
      viewMore: 'View more',
      viewLess: 'View less',
      search: 'Search',
      browseFiles: 'Browse files',
      supportedFormats: 'PDF, Word, Excel, CSV, TXT',
    },
    criteria: {
      title: 'Decision Criteria',
      description: 'Manage your decision criteria',
      add: 'Add criterion',
      addButton: 'Add criterion',
      addSuccess: 'Criterion added successfully',
      weight: 'Weight',
      importance: 'Importance',
      placeholder: 'Criterion name...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    share: {
      button: {
        share: 'Share',
        simpleShare: 'Share Link',
        collaborate: 'Collaborate',
        shareAsTemplate: 'Share as Template',
      },
      title: 'Share Decision',
      subtitle: 'Share your analysis with others',
      copyLink: 'Copy link',
      linkCopied: 'Link copied!',
      emailShare: 'Share by email',
      socialShare: 'Share on social',
      publicDecision: 'Public decision',
      publicDescription: 'Anyone can view this decision',
      privateDecision: 'Private decision',
      privateDescription: 'Only people with the link can view',
      toasts: {
        linkCopied: 'Link copied to clipboard!',
      },
    },
    profile: {
      avatar: {
        title: 'Profile Picture',
        description: 'Customize your avatar',
        change: 'Change Picture',
        formatSupport: 'JPG, PNG, GIF up to 2MB',
        dropHere: 'Drop your image here',
        tooBig: 'File is too large (max 2MB)',
        uploadSuccess: 'Picture updated successfully',
        uploadError: 'Error during upload',
        deleteSuccess: 'Picture deleted successfully',
        deleteError: 'Error during deletion',
      },
      info: {
        title: 'Personal Information',
        description: 'Manage your profile information',
        email: 'Email Address',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Your full name',
        save: 'Save',
        saving: 'Saving...',
        savedSuccess: 'Profile saved successfully',
        savedError: 'Error saving profile',
      },
      language: {
        title: 'Interface Language',
        description: 'Choose your preferred language',
        label: 'Language',
        helpText: 'Select the interface display language',
      },
      googleAccount: {
        title: 'Google Account',
        description: 'Manage your Google connection',
        notConnected: 'Google account not connected',
      },
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Manage your decisions and analyses',
      recentDecisions: 'Recent Decisions',
      quickActions: 'Quick Actions',
      stats: {
        decisionsCount: 'Decisions Made',
        avgConfidence: 'Average Confidence',
        timesSaved: 'Time Saved',
      },
    },
    history: {
      title: 'History',
      subtitle: 'View your past decisions',
      empty: {
        title: 'No decisions yet',
        description: 'You haven\'t made any decisions yet',
        cta: 'Start an analysis',
      },
      search: {
        placeholder: 'Search decisions...',
        noResults: 'No results found',
      },
      list: {
        emptyTitle: 'No decisions in history',
        emptyDescription: 'Your past analyses will appear here.',
      },
      searchBar: {
        searchPlaceholder: 'Search history...',
        filter: 'Filter',
        more: 'More',
        export: 'Export',
        clearAll: 'Clear All',
        categoryLabel: 'Category',
        allCategories: 'All Categories',
        uncategorized: 'Uncategorized',
        sortBy: 'Sort by',
        sort: {
          date: 'Date',
          category: 'Category',
        },
        exportPdf: 'Export as PDF',
        exportJson: 'Export as JSON',
        copyText: 'Copy text',
        confirm: {
          title: 'Confirm deletion',
          desc: 'This action will permanently delete your entire decision history. This action cannot be undone.',
          cancel: 'Cancel',
          ok: 'Confirm',
        },
        toasts: {
          export: {
            success: 'History exported to PDF successfully',
            error: 'Error during PDF export',
          },
          json: {
            success: 'History exported to JSON successfully',
            error: 'Error during JSON export',
          },
          copy: {
            success: 'Text copied to clipboard',
            error: 'Error during copy',
          },
        },
      },
      filters: {
        all: 'All',
        personal: 'Personal',
        professional: 'Professional',
        recent: 'Recent',
        highConfidence: 'High Confidence',
      },
      actions: {
        view: 'View',
        load: 'Load',
        delete: 'Delete',
        export: 'Export',
        share: 'Share',
      },
      sort: {
        date: 'Date',
        category: 'Category',
      },
      item: {
        share: 'Share',
        delete: 'Delete',
        followUp: {
          singular: 'follow-up question',
          plural: 'follow-up questions',
        },
        more: {
          singular: 'other',
          plural: 'others',
        },
      },
      more: 'More',
      export: 'Export',
      exportPdf: 'Export as PDF',
      exportJson: 'Export as JSON',
      copyText: 'Copy text',
      clearAll: 'Clear all',
      confirm: {
        title: 'Confirm deletion',
        desc: 'Are you sure you want to delete this decision?',
        cancel: 'Cancel',
        ok: 'Delete',
      },
    },
    comments: {
      section: {
        titleDefault: 'Comments',
        placeholderDefault: 'Add a comment...',
        loading: 'Loading comments...',
        empty: 'No comments yet',
        add: 'Add',
        cancel: 'Cancel',
        addButton: 'Add comment',
        toasts: {
          loadError: 'Error loading comments',
          emptyError: 'Comment cannot be empty',
          addSuccess: 'Comment added successfully',
          addError: 'Error adding comment',
        },
      },
      item: {
        types: {
          general: 'General',
          criteria: 'Criteria',
          option: 'Option',
          follow_up: 'Follow-up',
        },
        createdOn: 'Created on',
        modifiedOn: 'Modified on',
      },
    },
    dataAccuracy: {
      unknown: {
        date: 'Unknown date',
        datetime: 'Unknown date and time',
        author: 'Unknown author',
        user: 'Unknown user',
      },
      createdOn: 'Created on',
      updatedOn: 'updated on',
      by: 'by',
      viewSources: 'View sources',
      noExternalSources: 'No external sources available',
      sources: {
        one: 'source',
        other: 'sources',
      },
    },
    decision: {
      title: 'Decision',
      recommended: 'Recommended',
      advantages: 'Advantages',
      disadvantages: 'Disadvantages',
      learnMore: 'Learn more',
      moreAdvantages: 'more advantages',
      moreDisadvantages: 'more disadvantages',
      search: 'Search',
      comparisonTableCaption: 'Comparison table of {count} options',
      comparisonTable: 'Comparison table',
      seeMoreOptions: 'See more options',
      noResults: 'No results available',
      pointsOfAttention: 'Points of attention',
      usefulLinks: 'Useful links',
      popularVideos: 'Popular videos',
      seeMore: 'See more',
      seeLess: 'See less',
      toasts: {
        alreadyRunning: 'An analysis is already running',
        followup: {
          error: 'Error with follow-up question',
        },
      },
    },
    footer: {
      allRightsReserved: 'All rights reserved',
      privacyPolicy: 'Privacy Policy',
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated',
      sections: {
        dataCollection: {
          title: 'Data Collection',
          description: 'We collect the following information',
          item1: 'Decision data and criteria',
          item2: 'User profile information',
          item3: 'Application usage data',
        },
        dataUsage: {
          title: 'Data Usage',
          description: 'Your data is used to',
          item1: 'Improve our decision algorithms',
          item2: 'Personalize your experience',
          item3: 'Provide technical support',
        },
        dataSharing: {
          title: 'Data Sharing',
          description: 'We do not share your personal data with third parties',
        },
        cookies: {
          title: 'Cookies',
          description: 'We use cookies to improve your experience',
        },
        rights: {
          title: 'Your Rights',
          description: 'You have the right to access, modify or delete your data',
        },
        contact: {
          title: 'Contact',
          description: 'For any questions, contact us',
        },
      },
    },
    analysisResult: {
      confidence: 'Confidence',
      winner: 'Best option',
      score: 'Score',
      reasons: 'Reasons',
      criteria: 'Criteria',
      options: 'Options',
      analysis: 'Analysis',
      recommendation: 'Recommendation',
      nextSteps: 'Next steps',
      chartTitle: 'Comparative analysis',
      comparisonTitle: 'Option comparison',
      radarChartTitle: 'Criteria radar view',
      usefulLinks: 'Useful links',
      popularVideos: 'Popular videos',
      seeMore: 'See more',
      seeLess: 'See less',
      pointsOfAttention: 'Points of attention',
      moreAdvantages: 'Other advantages',
      comparisonTableCaption: 'Options comparison table',
      seeMoreOptions: 'See more options',
    },
    dilemmaSetup: {
      hero: {
        titleLine1: 'Make every decision',
        brand: 'Rationable',
        subtitle: 'From uncertainty to clarity: harness the power of AI',
      },
      dropHere: 'Drop your files here',
      attachFile: 'Attach file',
      launchAnalysis: 'Launch analysis',
      helpText: 'Describe the problem or decision you need to make. You can also drag and drop documents directly in this area.',
      attachedDocs: 'Attached documents',
      history: {
        title: 'Decision History',
        description: 'Load or delete your past analyses.',
      },
      templates: {
        description: 'Use ready-to-use templates to get started quickly',
        viewAll: 'View all',
      },
      trending: {
        title: 'Trending this week in {country}',
        refresh: 'Refresh',
      },
      analysisStarted: 'Analysis started!',
      fileTooLarge: 'is too large (max 10MB)',
    },
    optionsLoading: {
      title: 'Generating Options',
      subtitle: 'AI is analyzing your situation...',
      analyzing: 'Analyzing...',
      generatingOptions: 'Generating options...',
      evaluatingCriteria: 'Evaluating criteria...',
      almostDone: 'Almost done...',
    },
    criteriaManager: {
      title: 'Criteria Manager',
      subtitle: 'Add and manage your decision criteria',
      addCriterion: 'Add criterion',
      placeholder: 'Criterion name...',
      importance: 'Importance',
      weight: 'Weight',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
    },
    fileUpload: {
      dropZone: 'Drag and drop your files here',
      selectFiles: 'Select files',
      supportedFormats: 'Supported formats',
      maxSize: 'Max size',
      uploading: 'Uploading...',
      success: 'File uploaded',
      error: 'Upload error',
      remove: 'Remove',
    },
    collaboration: {
      title: 'Collaboration',
      subtitle: 'Work together on this decision',
      invite: 'Invite collaborators',
      inviteEmail: 'Email',
      invitePlaceholder: 'email@example.com',
      permissions: {
        view: 'View only',
        comment: 'Comment',
        edit: 'Edit',
      },
      members: 'Members',
      pending: 'Pending',
      remove: 'Remove',
      resend: 'Resend',
      description: 'Invite others to collaborate on this decision',
      publicLink: 'Public Link',
      publicLinkDescription: 'Anyone with this link can view and comment',
      createLink: 'Create Link',
    },
    templates_: {
      personal: {
        title: 'Personal Templates',
        description: 'Daily life decisions',
        examples: ['Housing choice', 'Purchase decision', 'Career choice'],
      },
      professional: {
        title: 'Professional Templates',
        description: 'Business and strategic decisions',
        examples: ['Marketing strategy', 'Recruitment', 'Investment'],
      },
      custom: {
        title: 'Custom Templates',
        description: 'Create your own templates',
        create: 'Create template',
        name: 'Template name',
        namePlaceholder: 'My decision template',
        description_: 'Description',
        descriptionPlaceholder: 'Describe what this template is for',
        category: 'Category',
        dilemma: 'Typical dilemma',
        dilemmaPlaceholder: 'Describe the type of decision',
        criteria: 'Predefined criteria',
        addCriterion: 'Add criterion',
        criterionName: 'Criterion name',
        criterionWeight: 'Weight',
        cancel: 'Cancel',
        submit: 'Create template',
        submitting: 'Creating...',
        success: 'Template created!',
        error: 'Error creating template',
        required: 'This field is required',
      },
    },
    export: {
      menuButton: {
        idle: 'Export',
        busy: 'Exporting...',
      },
      menu: {
        pdf: 'PDF',
        pdfStandard: 'Standard PDF',
        pdfCustom: 'Custom PDF',
        image: 'Image',
        json: 'JSON',
        copy: 'Copy text',
      },
      pdfDialog: {
        title: 'Export to PDF',
        subtitle: 'Customize your export',
        includeCharts: 'Include charts',
        includeDetails: 'Include details',
        format: 'Format',
        standardFormat: 'Standard',
        customFormat: 'Custom',
        cancel: 'Cancel',
        export: 'Export',
        exporting: 'Exporting...',
      },
      success: {
        title: 'Export successful',
        subtitle: 'Your file has been downloaded',
      },
      error: {
        title: 'Export error',
        subtitle: 'An error occurred',
      },
    },
    workspace: {
      selector: {
        title: 'Workspace',
        personal: 'Personal',
        professional: 'Professional',
        create: 'Create',
        manage: 'Manage',
      },
      create: {
        title: 'Create workspace',
        subtitle: 'Organize your decisions by context',
        name: 'Name',
        namePlaceholder: 'My workspace',
        description: 'Description',
        descriptionPlaceholder: 'Workspace description',
        color: 'Color',
        usageContext: 'Usage context',
        deleteTitle: 'Delete workspace',
        deleteDescription: 'This action cannot be undone',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
      },
      settings: {
        title: 'Workspace settings',
        subtitle: 'Manage your workspaces',
        defaultWorkspace: 'Default workspace',
        setDefault: 'Set as default',
      },
      documents: {
        title: 'Documents',
        subtitle: 'Manage documents for this workspace',
        upload: 'Upload',
        dragDrop: 'Drag and drop',
        supported: 'Supported formats',
        maxSize: 'Max size',
        processing: 'Processing...',
        processed: 'Processed',
        error: 'Error',
        view: 'View',
        download: 'Download',
        delete: 'Delete',
        cancel: 'Cancel',
        confirm: 'Confirm',
        loading: 'Loading...',
      },
    },
    // Add missing keys from screenshots
    workspaces: {
      title: 'Espaces de travail',
      description: 'Gérez vos préférences et paramètres',
      newWorkspace: 'Nouvel espace de travail',
      defaultBadge: 'Par défaut',
      currentBadge: 'Actuel',
      personal: 'Personnel',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      workspaceDescription: 'Description de l\'espace de travail',
      color: 'Couleur',
      usageContext: 'Contexte d\'utilisation',
      professionalUsage: 'Usage professionnel',
      professionalDescription: 'Pour les décisions commerciales et professionnelles',
      searchDocuments: 'Rechercher des documents',
      uploadDocuments: 'Télécharger des documents',
    },
  },
};
