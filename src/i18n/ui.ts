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
  },
};