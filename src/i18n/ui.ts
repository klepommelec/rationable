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
  },
};