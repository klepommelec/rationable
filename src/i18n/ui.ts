export interface UITranslations {
  settings: {
    sidebar: {
      profile: string;
      workspaces: string;
      appearance: string;
      notifications: string;
      preferences: string;
      documents: string;
      data: string;
      admin: string;
    };
    header: {
      subtitle: string;
      selectWorkspace: string;
    };
    appearance: {
      title: string;
      description: string;
      themeLabel: string;
      light: string;
      dark: string;
      system: string;
    };
    notifications: {
      title: string;
      description: string;
      email: {
        title: string;
        desc: string;
      };
      push: {
        title: string;
        desc: string;
      };
    };
    preferences: {
      title: string;
      description: string;
      autoSave: {
        title: string;
        desc: string;
      };
      showConfidence: {
        title: string;
        desc: string;
      };
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
    documents: {
      title: string;
      description: string;
      drop: {
        title: string;
        titleActive: string;
        desc: string;
        button: string;
        buttonUploading: string;
      };
      loading: string;
      empty: {
        title: string;
        desc: string;
        filtered: string;
      };
      search: {
        placeholder: string;
      };
      filter: {
        allCategories: string;
      };
      actions: {
        view: string;
        download: string;
        delete: string;
      };
      confirm: {
        title: string;
        desc: string;
        cancel: string;
        confirm: string;
      };
      usage: string;
      added: string;
    };
  };
  profile: {
    avatar: {
      title: string;
      description: string;
      change: string;
      dropHere: string;
      formatSupport: string;
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
      placeholder: string;
      helpText: string;
      toastTitle: string;
      toastDesc: string;
    };
  };
  navbar: {
    templates: string;
    settings: string;
    signIn: string;
    signOut: string;
    userFallback: string;
  };
  footer: {
    allRightsReserved: string;
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
      emptyMessage: string;
      resetFilters: string;
    };
    card: {
      byAuthor: string;
      open: string;
    };
    errors: {
      loadError: string;
      openError: string;
    };
  };
  auth: {
    title: string;
    description: string;
    tabs: {
      signIn: string;
      signUp: string;
    };
    fields: {
      email: string;
      password: string;
      fullName: string;
      confirmPassword: string;
    };
    actions: {
      signIn: string;
      signUp: string;
      createAccount: string;
    };
    errors: {
      passwordsMismatch: string;
      passwordTooShort: string;
    };
    messages: {
      accountCreated: string;
    };
  };
  sharedDecision: {
    signIn: string;
  };
  categorySelector: {
    placeholder: string;
    searchPlaceholder: string;
    empty: string;
    none: string;
  };
  history: {
    title: string;
    subtitle: string;
    searchBar: {
      searchPlaceholder: string;
      filter: string;
      categoryLabel: string;
      allCategories: string;
      uncategorized: string;
      sortBy: string;
      sort: {
        date: string;
        category: string;
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
    list: {
      emptyMessage: string;
      seeMore: string;
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
    search: {
      placeholder: string;
    };
    filter: {
      button: string;
      categoryLabel: string;
      sortByLabel: string;
      sort: {
        date: string;
        category: string;
      };
    };
    more: {
      button: string;
    };
    empty: string;
    copy: {
      success: string;
      error: string;
    };
    export: {
      json: {
        success: string;
        error: string;
      };
      success: string;
      error: string;
    };
    confirm: {
      title: string;
      desc: string;
      cancel: string;
      ok: string;
    };
    followUp: string;
    followUpPlural: string;
    share: string;
    delete: string;
    clearAll: string;
  };
  decision: {
    a11y: {
      skipToMain: string;
      mainLabel: string;
    };
    toasts: {
      alreadyRunning: string;
      followup: {
        error: string;
      };
    };
    home: {
      hero: {
        titleLine1: string;
        titleLine2: string;
        subtitle: string;
      };
      textarea: {
        drop: string;
        helper: string;
      };
      attachFile: string;
      startAnalysis: string;
      analysisStarted: string;
      fileToast: string;
      history: {
        title: string;
        subtitle: string;
      };
    };
    // Analysis results
    recommended: string;
    advantages: string;
    disadvantages: string;
    learnMore: string;
    comparisonTable: string;
    usefulLinks: string;
    popularVideos: string;
    seeMore: string;
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
    analysisStarted: string;
    fileTooLarge: string;
  };
  optionsLoading: {
    title: string;
    subtitle: string;
  };
  mainActionButton: {
    analyzing: string;
  };
  share: {
    button: {
      share: string;
      simpleShare: string;
      collaborate: string;
      shareAsTemplate: string;
    };
    toasts: {
      linkCreated: string;
      linkCopied: string;
      shareError: string;
      copyError: string;
    };
    collaborateDialog: {
      title: string;
      description: string;
      tabs: {
        public: string;
        invite: string;
      };
      public: {
        label: string;
        help: string;
        create: string;
        creating: string;
        createdHint: string;
      };
      invite: {
        label: string;
        help: string;
        emailPlaceholder: string;
        send: string;
        missingEmail: string;
        needPublicLink: string;
        emailClientOpened: string;
      };
    };
    templateDialog: {
      title: string;
      desc1: string;
      desc2: string;
      form: {
        title: {
          label: string;
          placeholder: string;
        };
        description: {
          label: string;
          placeholder: string;
        };
        author: {
          label: string;
          placeholder: string;
        };
        category: {
          label: string;
          placeholder: string;
        };
        tags: {
          label: string;
          placeholder: string;
        };
      };
      tags: {
        add: string;
      };
      cancel: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
    };
    sharedView: {
      sharedOn: string;
    };
    menu: {
      share: string;
      simpleShare: string;
      collaborate: string;
      shareAsTemplate: string;
      copied: {
        success: string;
        error: string;
      };
    };
    dialog: {
      title: string;
      description1: string;
      description2: string;
      form: {
        title: {
          label: string;
          placeholder: string;
        };
        description: {
          label: string;
          placeholder: string;
        };
        author: {
          label: string;
          placeholder: string;
        };
        category: {
          label: string;
          placeholder: string;
        };
        tags: {
          label: string;
          placeholder: string;
          add: string;
        };
      };
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
      includeCharts: string;
      includeLinks: string;
      includeBreakdown: string;
      pageFormat: string;
      orientation: string;
      orientationPortrait: string;
      orientationLandscape: string;
      generatePdf: string;
      toasts: {
        pdfOnlySingle: string;
        launchSuccess: string;
        pdfError: string;
        jsonSuccess: string;
        jsonError: string;
        imageOnlySingle: string;
        imageDev: string;
        copySuccess: string;
        copyError: string;
      };
    };
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
        emptyError: string;
        loadError: string;
        addSuccess: string;
        addError: string;
        updateSuccess: string;
        updateError: string;
        deleteSuccess: string;
        deleteError: string;
      };
    };
    item: {
      types: {
        criteria: string;
        option: string;
        recommendation: string;
        general: string;
      };
      createdOn: string;
      modifiedOn: string;
    };
  };
  dataAccuracy: {
    createdOn: string;
    by: string;
    updatedOn: string;
    sources: {
      zero: string;
      one: string;
      other: string;
    };
    noExternalSources: string;
    unknown: {
      author: string;
      date: string;
      datetime: string;
    };
  };
  categories: {
    tech: string;
    travel: string;
    career: string;
    lifestyle: string;
    finance: string;
    health: string;
    education: string;
    other: string;
    all: string;
    uncategorized: string;
    none: string;
  };
  criteria: {
    title: string;
    tooltip: string;
    reorderSuccess: string;
    minCriteriaError: string;
    maxCriteriaError: string;
    addSuccess: string;
    removeSuccess: string;
    addButton: string;
    updateAnalysis: string;
  };
  fileUpload: {
    processing: string;
    dropHere: string;
    clickToSelect: string;
    formats: string;
    attachedFiles: string;
    filesTooBig: string;
    filesAdded: string;
    uploadError: string;
    addFilesError: string;
    analysisHint: string;
  };
  workspaces: {
    title: string;
    description: string;
    newWorkspace: string;
    createDialog: {
      title: string;
      description: string;
      nameLabel: string;
      namePlaceholder: string;
      colorLabel: string;
      cancel: string;
      create: string;
      creating: string;
      nameRequired: string;
      createError: string;
    };
    uploadDocuments: string;
    dropFiles: string;
    uploading: string;
    searchDocuments: string;
    defaultBadge: string;
    currentBadge: string;
    personal: string;
    professional: string;
    personalUsage: string;
    personalDescription: string;
    professionalUsage: string;
    professionalDescription: string;
    usageContext: string;
    deleteTitle: string;
    deleteDescription: string;
    delete: string;
    save: string;
    cancel: string;
    activate: string;
    workspaceDescription: string;
    descriptionPlaceholder: string;
    color: string;
  };
  emoji: {
    searchPlaceholder: string;
    tabs: {
      popular: string;
      emotions: string;
      activities: string;
      objects: string;
      nature: string;
      food: string;
      symbols: string;
    };
  };
  collaboration: {
    title: string;
    description: string;
    publicLink: string;
    invite: string;
    publicLinkDescription: string;
    createLink: string;
    creating: string;
    linkSuccess: string;
    inviteByEmail: string;
    inviteDescription: string;
    emailPlaceholder: string;
    sendInvitation: string;
    createLinkFirst: string;
    linkCreatedToast: string;
    linkCreateError: string;
    linkCopiedToast: string;
    linkCopyError: string;
    emailClientOpened: string;
    emailRequired: string;
    createLinkFirstError: string;
  };
  sharedDecisionView: {
    notFound: string;
    notFoundDescription: string;
    backToHome: string;
    sharedOn: string;
    view: string;
    views: string;
    copyLinkButton: string;
    recommended: string;
    evaluationCriteria: string;
    detailedAnalysis: string;
    learnMore: string;
    advantages: string;
    disadvantages: string;
    usefulLinks: string;
    shoppingLinks: string;
    commentsTitle: string;
    commentsPlaceholder: string;
    missingPublicId: string;
    loading: string;
    loadingError: string;
  };
  common: {
    view: string;
    download: string;
    delete: string;
    cancel: string;
    confirm: string;
    loading: string;
    search: string;
    upload: string;
    browseFiles: string;
    supportedFormats: string;
    none: string;
    yes: string;
    no: string;
    email: string;
    password: string;
    save: string;
    actions: {
      ok: string;
    };
  };
}

export const translations: Record<'fr' | 'en', UITranslations> = {
  fr: {
    settings: {
      sidebar: {
        profile: 'Profil',
        workspaces: 'Workspaces',
        appearance: 'Apparence',
        notifications: 'Notifications',
        preferences: 'Préférences',
        documents: 'Documents',
        data: 'Gestion des données',
        admin: 'Administration',
      },
      header: {
        subtitle: 'Gérez vos préférences et paramètres de compte',
        selectWorkspace: 'Sélectionnez un workspace',
      },
      appearance: {
        title: 'Apparence',
        description: 'Personnalisez l\'apparence de l\'application',
        themeLabel: 'Thème',
        light: 'Clair',
        dark: 'Sombre',
        system: 'Système',
      },
      notifications: {
        title: 'Notifications',
        description: 'Gérez vos préférences de notification',
        email: {
          title: 'Notifications par email',
          desc: 'Recevez des emails pour les nouvelles fonctionnalités',
        },
        push: {
          title: 'Notifications push',
          desc: 'Notifications dans le navigateur',
        },
      },
      preferences: {
        title: 'Préférences de l\'application',
        description: 'Configurez le comportement de l\'application',
        autoSave: {
          title: 'Sauvegarde automatique',
          desc: 'Sauvegarde automatique de vos décisions',
        },
        showConfidence: {
          title: 'Afficher le niveau de confiance',
          desc: 'Affiche l\'indicateur de confiance de l\'IA',
        },
      },
      data: {
        title: 'Gestion des données',
        description: 'Gérez vos données personnelles',
        history: {
          title: 'Historique des décisions',
          desc: 'Supprime toutes vos décisions sauvegardées',
        },
        clearHistory: 'Vider l\'historique',
        toast: {
          cleared: 'Historique vidé',
          clearedDesc: 'Toutes vos décisions ont été supprimées.',
        },
      },
      documents: {
        title: 'Documents du workspace',
        description: 'Gérez les documents qui seront utilisés par l\'IA pour enrichir les analyses de décision.',
        drop: {
          title: 'Télécharger des documents',
          titleActive: 'Déposez vos fichiers ici',
          desc: 'Formats supportés: PDF, Word, Excel, CSV, TXT',
          button: 'Parcourir les fichiers',
          buttonUploading: 'Téléchargement...',
        },
        loading: 'Chargement des documents...',
        empty: {
          title: 'Aucun document',
          desc: 'Commencez par télécharger des documents pour enrichir les analyses de l\'IA.',
          filtered: 'Aucun document ne correspond à vos critères de recherche.',
        },
        search: {
          placeholder: 'Rechercher dans les documents...',
        },
        filter: {
          allCategories: 'Toutes les catégories',
        },
        actions: {
          view: 'Visualiser',
          download: 'Télécharger',
          delete: 'Supprimer',
        },
        confirm: {
          title: 'Supprimer le document',
          desc: 'Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.',
          cancel: 'Annuler',
          confirm: 'Supprimer',
        },
        usage: 'Utilisé',
        added: 'Ajouté',
      },
    },
    profile: {
      avatar: {
        title: 'Photo de profil',
        description: 'Téléchargez une photo de profil pour personnaliser votre compte',
        change: 'Changer l\'avatar',
        dropHere: 'Déposez l\'image ici...',
        formatSupport: 'PNG, JPG, WebP (max 2MB)',
        tooBig: 'L\'image est trop volumineuse (max 2MB)',
        uploadSuccess: 'Avatar mis à jour avec succès',
        uploadError: 'Erreur lors de la mise à jour de l\'avatar',
        deleteSuccess: 'Avatar supprimé avec succès',
        deleteError: 'Erreur lors de la suppression de l\'avatar',
      },
      info: {
        title: 'Informations personnelles',
        description: 'Informations de votre compte',
        email: 'Email',
        fullName: 'Nom complet',
        fullNamePlaceholder: 'Votre nom complet',
        save: 'Sauvegarder le profil',
        saving: 'Sauvegarde...',
        savedSuccess: 'Vos modifications ont été enregistrées avec succès.',
        savedError: 'Une erreur est survenue lors de la mise à jour du profil.',
      },
      language: {
        title: 'Langue de l\'interface',
        description: 'Choisissez la langue d\'affichage de l\'application',
        label: 'Langue',
        placeholder: 'Sélectionnez une langue',
        helpText: 'La langue s\'applique immédiatement à toute l\'interface.',
        toastTitle: 'Langue mise à jour',
        toastDesc: 'La langue de l\'interface a été modifiée.',
      },
    },
    navbar: {
      templates: 'Templates',
      settings: 'Paramètres',
      signIn: 'Se connecter',
      signOut: 'Se déconnecter',
      userFallback: 'Utilisateur',
    },
    footer: {
      allRightsReserved: 'Tous droits réservés.',
    },
    templates: {
      page: {
        title: 'Templates Communautaires',
        description: 'Découvrez et utilisez des templates créés par la communauté pour vous aider dans vos décisions.',
      },
      filters: {
        searchPlaceholder: 'Rechercher des templates...',
        categoryAll: 'Toutes les catégories',
        sort: {
          newest: 'Plus récents',
          popular: 'Plus populaires',
          mostCopied: 'Plus copiés',
        },
      },
      grid: {
        personalTitle: 'Usage Personnel',
        professionalTitle: 'Usage Professionnel',
        recommendedBadge: 'Recommandé pour vous',
        emptyMessage: 'Aucun template trouvé pour vos critères de recherche.',
        resetFilters: 'Réinitialiser les filtres',
      },
      card: {
        byAuthor: 'par',
        open: 'Ouvrir',
      },
      errors: {
        loadError: 'Erreur lors du chargement des templates',
        openError: 'Erreur lors de l\'ouverture du template',
      },
    },
    auth: {
      title: 'Bienvenue',
      description: 'Connectez-vous ou créez un compte pour commencer à prendre des décisions éclairées',
      tabs: {
        signIn: 'Connexion',
        signUp: 'Inscription',
      },
      fields: {
        email: 'Email',
        password: 'Mot de passe',
        fullName: 'Nom complet',
        confirmPassword: 'Confirmer le mot de passe',
      },
      actions: {
        signIn: 'Se connecter',
        signUp: 'Créer un compte',
        createAccount: 'Créer un compte',
      },
      errors: {
        passwordsMismatch: 'Les mots de passe ne correspondent pas',
        passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
      },
      messages: {
        accountCreated: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
      },
    },
    sharedDecision: {
      signIn: 'Se connecter',
    },
    categorySelector: {
      placeholder: 'Sélectionner une catégorie...',
      searchPlaceholder: 'Rechercher...',
      empty: 'Aucune catégorie trouvée.',
      none: 'Aucune catégorie',
    },
    history: {
      title: 'Historique des décisions',
      subtitle: 'Chargez ou supprimez vos analyses passées.',
      searchBar: {
        searchPlaceholder: 'Rechercher...',
        filter: 'Filtrer',
        categoryLabel: 'Catégorie',
        allCategories: 'Toutes les catégories',
        uncategorized: 'Non catégorisées',
        sortBy: 'Trier par',
        sort: {
          date: 'Par date',
          category: 'Par catégorie',
        },
        more: 'Plus',
        export: 'Exporter',
        exportPdf: 'Exporter en PDF',
        exportJson: 'Exporter en JSON',
        copyText: 'Copier le texte',
        clearAll: 'Tout effacer',
        confirm: {
          title: 'Êtes-vous sûr ?',
          desc: 'Cette action est irréversible et supprimera tout votre historique de décisions.',
          cancel: 'Annuler',
          ok: 'Confirmer',
        },
        toasts: {
          export: {
            success: 'Export réussi ! (format JSON pour le moment)',
            error: 'Erreur lors de l\'export',
          },
          json: {
            success: 'Export JSON réussi !',
            error: 'Erreur lors de l\'export JSON',
          },
          copy: {
            success: 'Données copiées dans le presse-papiers !',
            error: 'Erreur lors de la copie',
          },
        },
      },
      list: {
        emptyMessage: 'Aucune décision ne correspond aux critères de recherche.',
        seeMore: 'Voir plus',
      },
      item: {
        share: 'Partager',
        delete: 'Supprimer',
        followUp: {
          singular: 'question de suivi',
          plural: 'questions de suivi',
        },
        more: {
          singular: 'de plus',
          plural: 'de plus',
        },
      },
      search: {
        placeholder: 'Rechercher...',
      },
      filter: {
        button: 'Filtrer',
        categoryLabel: 'Catégorie',
        sortByLabel: 'Trier par',
        sort: {
          date: 'Par date',
          category: 'Par catégorie',
        },
      },
      more: {
        button: 'Plus',
      },
      empty: 'Aucune décision ne correspond aux critères de recherche.',
      copy: {
        success: 'Données copiées dans le presse-papiers !',
        error: 'Erreur lors de la copie',
      },
      export: {
        json: {
          success: 'Export JSON réussi !',
          error: 'Erreur lors de l\'export JSON',
        },
        success: 'Export réussi ! (format JSON pour le moment)',
        error: 'Erreur lors de l\'export',
      },
      confirm: {
        title: 'Êtes-vous sûr ?',
        desc: 'Cette action est irréversible et supprimera tout votre historique de décisions.',
        cancel: 'Annuler',
        ok: 'Confirmer',
      },
      followUp: 'question de suivi',
      followUpPlural: 'questions de suivi',
      share: 'Partager',
      delete: 'Supprimer',
      clearAll: 'Tout effacer',
    },
    decision: {
      a11y: {
        skipToMain: 'Aller au contenu principal',
        mainLabel: 'Assistant de décision',
      },
      toasts: {
        alreadyRunning: 'Une analyse est déjà en cours, veuillez patienter...',
        followup: {
          error: 'Erreur lors du traitement de la question de suivi',
        },
      },
      home: {
        hero: {
          titleLine1: 'Vos décisions seront',
          titleLine2: 'Rationable',
          subtitle: 'De l\'incertitude à la clarté : exploitez la puissance de l\'IA',
        },
        textarea: {
          drop: 'Déposez vos fichiers ici',
          helper: 'Décrivez le problème ou la décision que vous devez prendre. Vous pouvez aussi glisser-déposer des documents directement dans cette zone.',
        },
        attachFile: 'Joindre un fichier',
        startAnalysis: 'Lancer l\'analyse',
        analysisStarted: 'Analyse démarrée !',
        fileToast: 'fichier(s) ajouté(s)',
        history: {
          title: 'Historique des décisions',
          subtitle: 'Chargez ou supprimez vos analyses passées.',
        },
      },
      // Analysis results
      recommended: 'Recommandé',
      advantages: 'Avantages',
      disadvantages: 'Inconvénients', 
      learnMore: 'En savoir plus',
      comparisonTable: 'Tableau comparatif',
      usefulLinks: 'Liens utiles',
      popularVideos: 'Vidéos populaires',
      seeMore: 'Voir plus',
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
      analysisStarted: 'Analyse démarrée !',
      fileTooLarge: 'est trop volumineux (max 10MB)',
    },
    optionsLoading: {
      title: 'Analyse des options en cours...',
      subtitle: 'L\'IA évalue les meilleures solutions selon vos critères',
    },
    mainActionButton: {
      analyzing: 'Analyse en cours...',
    },
    share: {
      button: {
        share: 'Partager',
        simpleShare: 'Partage simple',
        collaborate: 'Collaborer',
        shareAsTemplate: 'Partager comme template',
      },
      toasts: {
        linkCreated: 'Lien de partage créé !',
        linkCopied: 'Lien de partage copié dans le presse-papier !',
        shareError: 'Erreur lors du partage',
        copyError: 'Erreur lors de la copie',
      },
      collaborateDialog: {
        title: 'Collaborer sur cette décision',
        description: 'Partagez cette décision pour obtenir des commentaires et collaborer.',
        tabs: {
          public: 'Lien public',
          invite: 'Inviter',
        },
        public: {
          label: 'Créer un lien public',
          help: 'Créez un lien que vous pouvez partager avec n\'importe qui.',
          create: 'Créer le lien',
          creating: 'Création...',
          createdHint: 'Lien créé ! Vous pouvez maintenant le copier et le partager.',
        },
        invite: {
          label: 'Invitation par email',
          help: 'Invitez des personnes spécifiques à collaborer sur cette décision.',
          emailPlaceholder: 'email@exemple.com',
          send: 'Envoyer l\'invitation',
          missingEmail: 'Veuillez saisir une adresse email.',
          needPublicLink: 'Vous devez d\'abord créer un lien public.',
          emailClientOpened: 'Votre client email s\'est ouvert avec l\'invitation pré-remplie.',
        },
      },
      templateDialog: {
        title: 'Partager comme template communautaire',
        desc1: 'Partagez cette décision avec la communauté pour aider d\'autres utilisateurs.',
        desc2: 'Votre template sera visible publiquement et pourra être utilisé par d\'autres.',
        form: {
          title: {
            label: 'Titre du template',
            placeholder: 'Un titre accrocheur pour votre template',
          },
          description: {
            label: 'Description',
            placeholder: 'Décrivez ce que ce template peut aider à résoudre',
          },
          author: {
            label: 'Nom de l\'auteur',
            placeholder: 'Votre nom ou pseudonyme',
          },
          category: {
            label: 'Catégorie',
            placeholder: 'Sélectionnez une catégorie',
          },
          tags: {
            label: 'Tags',
            placeholder: 'Ajoutez des mots-clés...',
          },
        },
        tags: {
          add: 'Ajouter',
        },
        cancel: 'Annuler',
        submit: 'Partager le template',
        submitting: 'Partage en cours...',
        success: 'Template partagé avec succès !',
        error: 'Erreur lors du partage du template',
      },
      sharedView: {
        sharedOn: 'Partagé le',
      },
      menu: {
        share: 'Partager',
        simpleShare: 'Partage simple',
        collaborate: 'Collaborer',
        shareAsTemplate: 'Partager comme template',
        copied: {
          success: 'Lien de partage copié dans le presse-papier !',
          error: 'Erreur lors du partage',
        },
      },
      dialog: {
        title: 'Partager comme template communautaire',
        description1: 'Partagez votre décision avec la communauté pour aider d\'autres utilisateurs.',
        description2: 'Votre template sera examiné avant publication.',
        form: {
          title: {
            label: 'Titre *',
            placeholder: 'Titre descriptif du template...',
          },
          description: {
            label: 'Description',
            placeholder: 'Décrivez brièvement ce template et quand l\'utiliser...',
          },
          author: {
            label: 'Nom d\'auteur (optionnel)',
            placeholder: 'Votre nom ou pseudo (ou laissez vide pour rester anonyme)',
          },
          category: {
            label: 'Catégorie',
            placeholder: 'Sélectionner une catégorie',
          },
          tags: {
            label: 'Tags',
            placeholder: 'Ajouter un tag...',
            add: 'Ajouter un tag',
          },
        },
        cancel: 'Annuler',
        submit: 'Partager',
        submitting: 'Partage en cours...',
        success: 'Template partagé avec succès ! Il sera visible après modération.',
        error: 'Erreur lors du partage du template',
        required: 'Le titre est requis',
      },
    },
    export: {
      menuButton: {
        idle: 'Exporter',
        busy: 'Export...',
      },
      menu: {
        pdf: 'PDF',
        pdfStandard: 'PDF standard',
        pdfCustom: 'PDF personnalisé',
        image: 'Image',
        json: 'JSON',
        copy: 'Copier',
      },
      pdfDialog: {
        title: 'Options d\'export PDF',
        includeCharts: 'Inclure les graphiques',
        includeLinks: 'Inclure les liens',
        includeBreakdown: 'Inclure le détail',
        pageFormat: 'Format de page',
        orientation: 'Orientation',
        orientationPortrait: 'Portrait',
        orientationLandscape: 'Paysage',
        generatePdf: 'Générer le PDF',
        toasts: {
          pdfOnlySingle: 'L\'export PDF n\'est disponible que pour une seule décision.',
          launchSuccess: 'Génération PDF lancée !',
          pdfError: 'Erreur lors de la génération PDF',
          jsonSuccess: 'Export JSON réussi !',
          jsonError: 'Erreur lors de l\'export JSON',
          imageOnlySingle: 'L\'export image n\'est disponible que pour une seule décision.',
          imageDev: 'Export image en développement',
          copySuccess: 'Données copiées !',
          copyError: 'Erreur lors de la copie',
        },
      },
    },
    comments: {
      section: {
        titleDefault: 'Commentaires',
        placeholderDefault: 'Ajoutez un commentaire...',
        loading: 'Chargement des commentaires...',
        empty: 'Aucun commentaire pour le moment.',
        add: 'Ajouter',
        cancel: 'Annuler',
        addButton: 'Ajouter un commentaire',
        toasts: {
          emptyError: 'Le commentaire ne peut pas être vide',
          loadError: 'Erreur lors du chargement des commentaires',
          addSuccess: 'Commentaire ajouté avec succès',
          addError: 'Erreur lors de l\'ajout du commentaire',
          updateSuccess: 'Commentaire mis à jour avec succès',
          updateError: 'Erreur lors de la mise à jour du commentaire',
          deleteSuccess: 'Commentaire supprimé avec succès',
          deleteError: 'Erreur lors de la suppression du commentaire',
        },
      },
      item: {
        types: {
          criteria: 'Critère',
          option: 'Option',
          recommendation: 'Recommandation',
          general: 'Général',
        },
        createdOn: 'Créé le',
        modifiedOn: 'Modifié le',
      },
    },
    dataAccuracy: {
      createdOn: 'Créé le',
      by: 'par',
      updatedOn: 'mis à jour le',
      sources: {
        zero: 'sources',
        one: 'source',
        other: 'sources',
      },
      noExternalSources: 'Aucune source externe utilisée',
      unknown: {
        author: 'Auteur inconnu',
        date: 'Date inconnue',
        datetime: 'Date inconnue',
      },
    },
    categories: {
      tech: 'Technologie',
      travel: 'Voyage',
      career: 'Carrière',
      lifestyle: 'Mode de vie',
      finance: 'Finance',
      health: 'Santé',
      education: 'Éducation',
      other: 'Autre',
      all: 'Toutes les catégories',
      uncategorized: 'Non catégorisées',
      none: 'Aucune catégorie',
    },
    emoji: {
      searchPlaceholder: 'Rechercher un emoji...',
      tabs: {
        popular: 'Populaires',
        emotions: 'Émotions',
        activities: 'Activités',
        objects: 'Objets',
        nature: 'Nature',
        food: 'Nourriture',
        symbols: 'Symboles',
      },
    },
    collaboration: {
      title: 'Collaborer sur cette décision',
      description: 'Partagez votre analyse et invitez d\'autres personnes à commenter.',
      publicLink: 'Lien public',
      invite: 'Inviter',
      publicLinkDescription: 'Créez un lien que vous pouvez partager avec n\'importe qui.',
      createLink: 'Créer un lien public',
      creating: 'Création...',
      linkSuccess: '✓ Lien créé ! Partagez-le avec qui vous voulez.',
      inviteByEmail: 'Inviter par email',
      inviteDescription: 'Envoyez une invitation personnalisée par email.',
      emailPlaceholder: 'exemple@email.com',
      sendInvitation: 'Envoyer l\'invitation',
      createLinkFirst: '⚠️ Créez d\'abord un lien public dans l\'onglet précédent.',
      linkCreatedToast: 'Lien de partage créé !',
      linkCreateError: 'Erreur lors de la création du lien',
      linkCopiedToast: 'Lien copié !',
      linkCopyError: 'Erreur lors de la copie',
      emailClientOpened: 'Client email ouvert !',
      emailRequired: 'Veuillez entrer une adresse email',
      createLinkFirstError: 'Créez d\'abord un lien de partage',
    },
    sharedDecisionView: {
      notFound: 'Décision introuvable',
      notFoundDescription: 'Cette décision partagée n\'existe pas ou a expiré.',
      backToHome: 'Retour à l\'accueil',
      sharedOn: 'Partagé le',
      view: 'vue',
      views: 'vues',
      copyLinkButton: 'Copier le lien',
      recommended: '✅ Recommandée',
      evaluationCriteria: 'Critères d\'évaluation',
      detailedAnalysis: 'Analyse détaillée',
      learnMore: 'En savoir plus',
      advantages: '✅ Avantages',
      disadvantages: '❌ Inconvénients',
      usefulLinks: 'Liens utiles',
      shoppingLinks: '🛒 Liens d\'achat',
      commentsTitle: 'Commentaires sur cette décision',
      commentsPlaceholder: 'Partagez vos réflexions sur cette décision...',
      missingPublicId: 'ID de partage manquant',
      loading: 'Chargement...',
      loadingError: 'Erreur lors du chargement',
    },
    criteria: {
      title: 'Gérez les critères de décision',
      tooltip: 'Modifiez, réorganisez (par glisser-déposer) ou supprimez les critères. L\'ordre est important et reflète leur poids dans la décision.',
      reorderSuccess: 'L\'ordre des critères a été mis à jour.',
      minCriteriaError: 'Vous devez conserver au moins 2 critères.',
      maxCriteriaError: 'Vous ne pouvez pas ajouter plus de 8 critères.',
      addSuccess: 'Nouveau critère ajouté.',
      removeSuccess: 'Critère supprimé.',
      addButton: 'Ajouter un critère',
      updateAnalysis: 'Mettre à jour l\'analyse',
    },
    fileUpload: {
      processing: 'Traitement en cours...',
      dropHere: 'Déposez les fichiers ici...',
      clickToSelect: 'Glissez-déposez vos documents ici, ou cliquez pour sélectionner',
      formats: 'PDF, Images, Word (max 10MB par fichier)',
      attachedFiles: 'Fichiers joints',
      filesTooBig: 'Le fichier {name} est trop volumineux (max 10MB)',
      filesAdded: '{count} fichier(s) ajouté(s)',
      uploadError: 'Erreur lors de l\'upload',
      addFilesError: 'Erreur lors de l\'ajout des fichiers',
      analysisHint: 'Les documents seront analysés avec votre dilemme pour vous aider dans votre décision',
    },
    workspaces: {
      title: 'Workspaces',
      description: 'Organisez vos décisions dans des espaces de travail séparés',
      newWorkspace: 'Nouveau workspace',
      createDialog: {
        title: 'Créer un nouveau workspace',
        description: 'Organisez vos décisions dans des espaces séparés pour différents projets ou contextes.',
        nameLabel: 'Nom du workspace',
        namePlaceholder: 'Entrez le nom du workspace...',
        colorLabel: 'Couleur',
        cancel: 'Annuler',
        create: 'Créer',
        creating: 'Création...',
        nameRequired: 'Le nom est requis',
        createError: 'Erreur lors de la création du workspace',
      },
      uploadDocuments: 'Télécharger des documents',
      dropFiles: 'Déposez vos fichiers ici',
      uploading: 'Téléchargement...',
      searchDocuments: 'Rechercher dans les documents...',
      defaultBadge: 'Par défaut',
      currentBadge: 'Actuel',
      personal: 'Personnel',
      professional: 'Professionnel',
      personalUsage: 'Usage personnel',
      personalDescription: 'Décisions personnelles, choix de vie, achats, loisirs',
      professionalUsage: 'Usage professionnel',
      professionalDescription: 'Décisions business, stratégie, management, projets',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      activate: 'Activer',
      workspaceDescription: 'Description',
      descriptionPlaceholder: 'Description du workspace...',
      color: 'Couleur',
      usageContext: 'Contexte d\'utilisation',
      deleteTitle: 'Supprimer le workspace',
      deleteDescription: 'Êtes-vous sûr de vouloir supprimer ce workspace ? Toutes les décisions associées seront perdues. Cette action est irréversible.',
      delete: 'Supprimer',
    },
    common: {
      view: 'Voir',
      download: 'Télécharger',
      delete: 'Supprimer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      loading: 'Chargement...',
      search: 'Rechercher',
      upload: 'Télécharger',
      browseFiles: 'Parcourir les fichiers',
      supportedFormats: 'Formats supportés',
      none: 'Aucun',
      yes: 'Oui',
      no: 'Non',
      email: 'Email',
      password: 'Mot de passe',
      save: 'Sauvegarder',
      actions: {
        ok: 'OK',
      },
    },
  },
  en: {
    settings: {
      sidebar: {
        profile: 'Profile',
        workspaces: 'Workspaces',
        appearance: 'Appearance',
        notifications: 'Notifications',
        preferences: 'Preferences',
        documents: 'Documents',
        data: 'Data Management',
        admin: 'Administration',
      },
      header: {
        subtitle: 'Manage your preferences and account settings',
        selectWorkspace: 'Select a workspace',
      },
      appearance: {
        title: 'Appearance',
        description: 'Customize the appearance of the application',
        themeLabel: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
      notifications: {
        title: 'Notifications',
        description: 'Manage your notification preferences',
        email: {
          title: 'Email notifications',
          desc: 'Receive emails for new features',
        },
        push: {
          title: 'Push notifications',
          desc: 'Browser notifications',
        },
      },
      preferences: {
        title: 'Application preferences',
        description: 'Configure application behavior',
        autoSave: {
          title: 'Auto-save',
          desc: 'Automatically save your decisions',
        },
        showConfidence: {
          title: 'Show confidence level',
          desc: 'Display AI confidence indicator',
        },
      },
      data: {
        title: 'Data Management',
        description: 'Manage your personal data',
        history: {
          title: 'Decision history',
          desc: 'Delete all your saved decisions',
        },
        clearHistory: 'Clear history',
        toast: {
          cleared: 'History cleared',
          clearedDesc: 'All your decisions have been deleted.',
        },
      },
      documents: {
        title: 'Workspace documents',
        description: 'Manage documents that will be used by AI to enrich decision analysis.',
        drop: {
          title: 'Upload documents',
          titleActive: 'Drop your files here',
          desc: 'Supported formats: PDF, Word, Excel, CSV, TXT',
          button: 'Browse files',
          buttonUploading: 'Uploading...',
        },
        loading: 'Loading documents...',
        empty: {
          title: 'No documents',
          desc: 'Start by uploading documents to enrich AI analysis.',
          filtered: 'No documents match your search criteria.',
        },
        search: {
          placeholder: 'Search in documents...',
        },
        filter: {
          allCategories: 'All categories',
        },
        actions: {
          view: 'View',
          download: 'Download',
          delete: 'Delete',
        },
        confirm: {
          title: 'Delete document',
          desc: 'Are you sure you want to delete this document? This action cannot be undone.',
          cancel: 'Cancel',
          confirm: 'Delete',
        },
        usage: 'Used',
        added: 'Added',
      },
    },
    profile: {
      avatar: {
        title: 'Profile Picture',
        description: 'Upload a profile picture to personalize your account',
        change: 'Change avatar',
        dropHere: 'Drop image here...',
        formatSupport: 'PNG, JPG, WebP (max 2MB)',
        tooBig: 'Image is too large (max 2MB)',
        uploadSuccess: 'Avatar updated successfully',
        uploadError: 'Error updating avatar',
        deleteSuccess: 'Avatar deleted successfully',
        deleteError: 'Error deleting avatar',
      },
      info: {
        title: 'Personal Information',
        description: 'Your account information',
        email: 'Email',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Your full name',
        save: 'Save Profile',
        saving: 'Saving...',
        savedSuccess: 'Your changes have been saved successfully.',
        savedError: 'An error occurred while updating the profile.',
      },
      language: {
        title: 'Interface Language',
        description: 'Choose the display language for the application',
        label: 'Language',
        placeholder: 'Select a language',
        helpText: 'The language applies immediately to the entire interface.',
        toastTitle: 'Language updated',
        toastDesc: 'The interface language has been changed.',
      },
    },
    navbar: {
      templates: 'Templates',
      settings: 'Settings',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      userFallback: 'User',
    },
    footer: {
      allRightsReserved: 'All rights reserved.',
    },
    templates: {
      page: {
        title: 'Community Templates',
        description: 'Discover and use templates created by the community to help you with your decisions.',
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
      grid: {
        personalTitle: 'Personal Use',
        professionalTitle: 'Professional Use',
        recommendedBadge: 'Recommended for you',
        emptyMessage: 'No templates found for your search criteria.',
        resetFilters: 'Reset filters',
      },
      card: {
        byAuthor: 'by',
        open: 'Open',
      },
      errors: {
        loadError: 'Error loading templates',
        openError: 'Error opening template',
      },
    },
    auth: {
      title: 'Welcome',
      description: 'Sign in or create an account to start making informed decisions',
      tabs: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
      },
      fields: {
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        confirmPassword: 'Confirm Password',
      },
      actions: {
        signIn: 'Sign In',
        signUp: 'Create Account',
        createAccount: 'Create Account',
      },
      errors: {
        passwordsMismatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 6 characters long',
      },
      messages: {
        accountCreated: 'Account created successfully! You can now sign in.',
      },
    },
    sharedDecision: {
      signIn: 'Sign In',
    },
    categorySelector: {
      placeholder: 'Select a category...',
      searchPlaceholder: 'Search...',
      empty: 'No category found.',
      none: 'No category',
    },
    history: {
      title: 'Decision History',
      subtitle: 'Load or delete your past analyses.',
      searchBar: {
        searchPlaceholder: 'Search...',
        filter: 'Filter',
        categoryLabel: 'Category',
        allCategories: 'All categories',
        uncategorized: 'Uncategorized',
        sortBy: 'Sort by',
        sort: {
          date: 'By date',
          category: 'By category',
        },
        more: 'More',
        export: 'Export',
        exportPdf: 'Export as PDF',
        exportJson: 'Export as JSON',
        copyText: 'Copy text',
        clearAll: 'Clear all',
        confirm: {
          title: 'Are you sure?',
          desc: 'This action is irreversible and will delete your entire decision history.',
          cancel: 'Cancel',
          ok: 'Confirm',
        },
        toasts: {
          export: {
            success: 'Export successful! (JSON format for now)',
            error: 'Export error',
          },
          json: {
            success: 'JSON export successful!',
            error: 'JSON export error',
          },
          copy: {
            success: 'Data copied to clipboard!',
            error: 'Copy error',
          },
        },
      },
      list: {
        emptyMessage: 'No decisions match the search criteria.',
        seeMore: 'See more',
      },
      item: {
        share: 'Share',
        delete: 'Delete',
        followUp: {
          singular: 'follow-up question',
          plural: 'follow-up questions',
        },
        more: {
          singular: 'more',
          plural: 'more',
        },
      },
      search: {
        placeholder: 'Search...',
      },
      filter: {
        button: 'Filter',
        categoryLabel: 'Category',
        sortByLabel: 'Sort by',
        sort: {
          date: 'By date',
          category: 'By category',
        },
      },
      more: {
        button: 'More',
      },
      empty: 'No decisions match the search criteria.',
      copy: {
        success: 'Data copied to clipboard!',
        error: 'Copy error',
      },
      export: {
        json: {
          success: 'JSON export successful!',
          error: 'JSON export error',
        },
        success: 'Export successful! (JSON format for now)',
        error: 'Export error',
      },
      confirm: {
        title: 'Are you sure?',
        desc: 'This action is irreversible and will delete your entire decision history.',
        cancel: 'Cancel',
        ok: 'Confirm',
      },
      followUp: 'follow-up question',
      followUpPlural: 'follow-up questions',
      share: 'Share',
      delete: 'Delete',
      clearAll: 'Clear all',
    },
    dilemmaSetup: {
      hero: {
        titleLine1: 'Your decisions will be',
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
      analysisStarted: 'Analysis started!',
      fileTooLarge: 'is too large (max 10MB)',
    },
    optionsLoading: {
      title: 'Analyzing options...',
      subtitle: 'AI is evaluating the best solutions according to your criteria',
    },
    mainActionButton: {
      analyzing: 'Analyzing...',
    },
    decision: {
      a11y: {
        skipToMain: 'Skip to main content',
        mainLabel: 'Decision assistant',
      },
      toasts: {
        alreadyRunning: 'An analysis is already in progress, please wait...',
        followup: {
          error: 'Error processing the follow-up question',
        },
      },
      home: {
        hero: {
          titleLine1: 'Your decisions will be',
          titleLine2: 'Rationable',
          subtitle: 'From uncertainty to clarity: harness the power of AI',
        },
        textarea: {
          drop: 'Drop your files here',
          helper: 'Describe the problem or decision you need to make. You can also drag and drop documents directly into this area.',
        },
        attachFile: 'Attach file',
        startAnalysis: 'Start analysis',
        analysisStarted: 'Analysis started!',
        fileToast: 'file(s) added',
        history: {
          title: 'Decision history',
          subtitle: 'Load or delete your past analysis.',
        },
      },
      // Analysis results
      recommended: 'Recommended',
      advantages: 'Advantages',
      disadvantages: 'Disadvantages',
      learnMore: 'Learn more',
      comparisonTable: 'Comparison table',
      usefulLinks: 'Useful links',
      popularVideos: 'Popular videos',
      seeMore: 'See more',
      pointsOfAttention: 'Points of attention',
      moreAdvantages: 'More advantages',
      comparisonTableCaption: 'Options comparison table',
      seeMoreOptions: 'See more options',
    },
    share: {
      button: {
        share: 'Share',
        simpleShare: 'Simple share',
        collaborate: 'Collaborate',
        shareAsTemplate: 'Share as template',
      },
      toasts: {
        linkCreated: 'Share link created!',
        linkCopied: 'Share link copied to clipboard!',
        shareError: 'Share error',
        copyError: 'Copy error',
      },
      collaborateDialog: {
        title: 'Collaborate on this decision',
        description: 'Share this decision to get feedback and collaborate.',
        tabs: {
          public: 'Public link',
          invite: 'Invite',
        },
        public: {
          label: 'Create public link',
          help: 'Create a link you can share with anyone.',
          create: 'Create link',
          creating: 'Creating...',
          createdHint: 'Link created! You can now copy and share it.',
        },
        invite: {
          label: 'Email invitation',
          help: 'Invite specific people to collaborate on this decision.',
          emailPlaceholder: 'email@example.com',
          send: 'Send invitation',
          missingEmail: 'Please enter an email address.',
          needPublicLink: 'You must first create a public link.',
          emailClientOpened: 'Your email client opened with the pre-filled invitation.',
        },
      },
      templateDialog: {
        title: 'Share as community template',
        desc1: 'Share this decision with the community to help other users.',
        desc2: 'Your template will be publicly visible and can be used by others.',
        form: {
          title: {
            label: 'Template title',
            placeholder: 'A catchy title for your template',
          },
          description: {
            label: 'Description',
            placeholder: 'Describe what this template can help solve',
          },
          author: {
            label: 'Author name',
            placeholder: 'Your name or username',
          },
          category: {
            label: 'Category',
            placeholder: 'Select a category',
          },
          tags: {
            label: 'Tags',
            placeholder: 'Add keywords...',
          },
        },
        tags: {
          add: 'Add',
        },
        cancel: 'Cancel',
        submit: 'Share template',
        submitting: 'Sharing...',
        success: 'Template shared successfully!',
        error: 'Template sharing error',
      },
      sharedView: {
        sharedOn: 'Shared on',
      },
      menu: {
        share: 'Share',
        simpleShare: 'Simple share',
        collaborate: 'Collaborate',
        shareAsTemplate: 'Share as template',
        copied: {
          success: 'Share link copied to clipboard!',
          error: 'Share error',
        },
      },
      dialog: {
        title: 'Share as community template',
        description1: 'Share this decision with the community to help other users.',
        description2: 'Your template will be publicly visible and can be used by others.',
        form: {
          title: {
            label: 'Template title',
            placeholder: 'A catchy title for your template',
          },
          description: {
            label: 'Description',
            placeholder: 'Describe what this template can help solve',
          },
          author: {
            label: 'Author name',
            placeholder: 'Your name or username',
          },
          category: {
            label: 'Category',
            placeholder: 'Select a category',
          },
          tags: {
            label: 'Tags',
            placeholder: 'Add keywords...',
            add: 'Add',
          },
        },
        cancel: 'Cancel',
        submit: 'Share template',
        submitting: 'Sharing...',
        success: 'Template shared successfully!',
        error: 'Template sharing error',
        required: 'Title is required',
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
        copy: 'Copy',
      },
      pdfDialog: {
        title: 'PDF Export Options',
        includeCharts: 'Include charts',
        includeLinks: 'Include links',
        includeBreakdown: 'Include breakdown',
        pageFormat: 'Page format',
        orientation: 'Orientation',
        orientationPortrait: 'Portrait',
        orientationLandscape: 'Landscape',
        generatePdf: 'Generate PDF',
        toasts: {
          pdfOnlySingle: 'PDF export is only available for a single decision.',
          launchSuccess: 'PDF generation started!',
          pdfError: 'PDF generation error',
          jsonSuccess: 'JSON export successful!',
          jsonError: 'JSON export error',
          imageOnlySingle: 'Image export is only available for a single decision.',
          imageDev: 'Image export in development',
          copySuccess: 'Data copied!',
          copyError: 'Copy error',
        },
      },
    },
    comments: {
      section: {
        titleDefault: 'Comments',
        placeholderDefault: 'Add a comment...',
        loading: 'Loading comments...',
        empty: 'No comments yet.',
        add: 'Add',
        cancel: 'Cancel',
        addButton: 'Add comment',
        toasts: {
          emptyError: 'Comment cannot be empty',
          loadError: 'Error loading comments',
          addSuccess: 'Comment added successfully',
          addError: 'Error adding comment',
          updateSuccess: 'Comment updated successfully',
          updateError: 'Error updating comment',
          deleteSuccess: 'Comment deleted successfully',
          deleteError: 'Error deleting comment',
        },
      },
      item: {
        types: {
          criteria: 'Criteria',
          option: 'Option',
          recommendation: 'Recommendation',
          general: 'General',
        },
        createdOn: 'Created on',
        modifiedOn: 'Modified on',
      },
    },
    dataAccuracy: {
      createdOn: 'Created on',
      by: 'by',
      updatedOn: 'updated on',
      sources: {
        zero: 'sources',
        one: 'source',
        other: 'sources',
      },
      noExternalSources: 'No external sources used',
      unknown: {
        author: 'Unknown author',
        date: 'Unknown date',
        datetime: 'Unknown date',
      },
    },
    categories: {
      tech: 'Technology',
      travel: 'Travel',
      career: 'Career',
      lifestyle: 'Lifestyle',
      finance: 'Finance',
      health: 'Health',
      education: 'Education',
      other: 'Other',
      all: 'All categories',
      uncategorized: 'Uncategorized',
      none: 'No category',
    },
    criteria: {
      title: 'Manage Decision Criteria',
      tooltip: 'Edit, reorder (drag and drop), or delete criteria. Order is important and reflects their weight in the decision.',
      reorderSuccess: 'Criteria order has been updated.',
      minCriteriaError: 'You must keep at least 2 criteria.',
      maxCriteriaError: 'You cannot add more than 8 criteria.',
      addSuccess: 'New criterion added.',
      removeSuccess: 'Criterion removed.',
      addButton: 'Add criterion',
      updateAnalysis: 'Update analysis',
    },
    fileUpload: {
      processing: 'Processing...',
      dropHere: 'Drop files here...',
      clickToSelect: 'Drag and drop your documents here, or click to select',
      formats: 'PDF, Images, Word (max 10MB per file)',
      attachedFiles: 'Attached files',
      filesTooBig: 'The file {name} is too large (max 10MB)',
      filesAdded: '{count} file(s) added',
      uploadError: 'Upload error',
      addFilesError: 'Error adding files',
      analysisHint: 'Documents will be analyzed with your dilemma to help you make your decision',
    },
      emoji: {
        searchPlaceholder: 'Search emoji...',
        tabs: {
          popular: 'Popular',
          emotions: 'Emotions',
          activities: 'Activities',
          objects: 'Objects',
          nature: 'Nature',
          food: 'Food',
          symbols: 'Symbols',
        },
      },
      collaboration: {
        title: 'Collaborate on this decision',
        description: 'Share your analysis and invite others to comment.',
        publicLink: 'Public link',
        invite: 'Invite',
        publicLinkDescription: 'Create a link you can share with anyone.',
        createLink: 'Create public link',
        creating: 'Creating...',
        linkSuccess: '✓ Link created! Share it with anyone.',
        inviteByEmail: 'Invite by email',
        inviteDescription: 'Send a personalized invitation by email.',
        emailPlaceholder: 'example@email.com',
        sendInvitation: 'Send invitation',
        createLinkFirst: '⚠️ Create a public link first in the previous tab.',
        linkCreatedToast: 'Share link created!',
        linkCreateError: 'Error creating link',
        linkCopiedToast: 'Link copied!',
        linkCopyError: 'Error copying link',
        emailClientOpened: 'Email client opened!',
        emailRequired: 'Please enter an email address',
        createLinkFirstError: 'Create a public link first',
      },
      sharedDecisionView: {
        notFound: 'Decision not found',
        notFoundDescription: 'This shared decision does not exist or has expired.',
        backToHome: 'Back to home',
        sharedOn: 'Shared on',
        view: 'view',
        views: 'views',
        copyLinkButton: 'Copy link',
        recommended: '✅ Recommended',
        evaluationCriteria: 'Evaluation criteria',
        detailedAnalysis: 'Detailed analysis',
        learnMore: 'Learn more',
        advantages: '✅ Advantages',
        disadvantages: '❌ Disadvantages',
        usefulLinks: 'Useful links',
        shoppingLinks: '🛒 Shopping links',
        commentsTitle: 'Comments on this decision',
        commentsPlaceholder: 'Share your thoughts on this decision...',
        missingPublicId: 'Missing share ID',
        loading: 'Loading...',
        loadingError: 'Error loading',
    },
    workspaces: {
      title: 'Workspaces',
      description: 'Organize your decisions in separate workspaces',
      newWorkspace: 'New workspace',
      createDialog: {
        title: 'Create a new workspace',
        description: 'Organize your decisions in separate spaces for different projects or contexts.',
        nameLabel: 'Workspace name',
        namePlaceholder: 'Enter workspace name...',
        colorLabel: 'Color',
        cancel: 'Cancel',
        create: 'Create',
        creating: 'Creating...',
        nameRequired: 'Name is required',
        createError: 'Error creating workspace',
      },
      uploadDocuments: 'Upload documents',
      dropFiles: 'Drop your files here',
      uploading: 'Uploading...',
      searchDocuments: 'Search documents...',
      defaultBadge: 'Default',
      currentBadge: 'Current',
      personal: 'Personal',
      professional: 'Professional',
      personalUsage: 'Personal use',
      personalDescription: 'Personal decisions, life choices, purchases, leisure',
      professionalUsage: 'Professional use',
      professionalDescription: 'Business decisions, strategy, management, projects',
      save: 'Save',
      cancel: 'Cancel',
      activate: 'Activate',
      workspaceDescription: 'Description',
      descriptionPlaceholder: 'Workspace description...',
      color: 'Color',
      usageContext: 'Usage context',
      deleteTitle: 'Delete workspace',
      deleteDescription: 'Are you sure you want to delete this workspace? All associated decisions will be lost. This action is irreversible.',
      delete: 'Delete',
    },
    common: {
      view: 'View',
      download: 'Download',
      delete: 'Delete',
      cancel: 'Cancel',
      confirm: 'Confirm',
      loading: 'Loading...',
      search: 'Search',
      upload: 'Upload',
      browseFiles: 'Browse files',
      supportedFormats: 'Supported formats',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      email: 'Email',
      password: 'Password',
      save: 'Save',
      actions: {
        ok: 'OK',
      },
    },
  },
};