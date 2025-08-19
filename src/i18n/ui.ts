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
    decision: {
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
    },
    history: {
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
      empty: 'No history',
      copy: {
        success: 'Data copied to clipboard!',
        error: 'Error copying data',
      },
      export: {
        json: {
          success: 'JSON export successful!',
          error: 'Error exporting JSON',
        },
        success: 'Export successful! (JSON format for now)',
        error: 'Export error',
      },
      confirm: {
        title: 'Are you sure?',
        desc: 'This action is irreversible and will delete all your decision history.',
        cancel: 'Cancel',
        ok: 'Confirm',
      },
      followUp: 'follow-up question',
      followUpPlural: 'follow-up questions',
      share: 'Share',
      delete: 'Delete',
      clearAll: 'Clear all',
    },
    share: {
      menu: {
        share: 'Share',
        simpleShare: 'Simple share',
        collaborate: 'Collaborate',
        shareAsTemplate: 'Share as template',
        copied: {
          success: 'Share link copied to clipboard!',
          error: 'Error sharing',
        },
      },
      dialog: {
        title: 'Share as community template',
        description1: 'Share your decision with the community to help other users.',
        description2: 'Your template will be reviewed before publication.',
        form: {
          title: {
            label: 'Title *',
            placeholder: 'Descriptive title of the template...',
          },
          description: {
            label: 'Description',
            placeholder: 'Briefly describe this template and when to use it...',
          },
          author: {
            label: 'Author name (optional)',
            placeholder: 'Your name or username (or leave blank to remain anonymous)',
          },
          category: {
            label: 'Category',
            placeholder: 'Select a category',
          },
          tags: {
            label: 'Tags',
            placeholder: 'Add a tag...',
            add: 'Add tag',
          },
        },
        cancel: 'Cancel',
        submit: 'Share',
        submitting: 'Sharing...',
        success: 'Template shared successfully! It will be visible after moderation.',
        error: 'Error sharing template',
        required: 'Title is required',
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