import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { uploadUserAvatar, deleteUserAvatar, AvatarUploadResult } from '@/services/avatarService';

/**
 * Interface représentant le profil utilisateur
 * @interface Profile
 */
interface Profile {
  /** Identifiant unique de l'utilisateur */
  id: string;
  /** Nom complet de l'utilisateur */
  full_name: string | null;
  /** Adresse email de l'utilisateur */
  email: string | null;
  /** URL de l'avatar de l'utilisateur */
  avatar_url: string | null;
  /** Indique si l'onboarding est terminé */
  onboarding_completed: boolean | null;
  /** Contexte d'utilisation (personnel ou professionnel) */
  use_context: 'personal' | 'professional' | null;
  /** Date de création du profil */
  created_at: string;
  /** Date de dernière mise à jour */
  updated_at: string;
}

/**
 * Interface du contexte d'authentification
 * @interface AuthContextType
 */
interface AuthContextType {
  /** Utilisateur actuellement connecté */
  user: User | null;
  /** Session active */
  session: Session | null;
  /** Profil utilisateur complet */
  profile: Profile | null;
  /** État de chargement */
  loading: boolean;
  /** Fonction d'inscription */
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  /** Fonction de connexion */
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  /** Connexion avec Google */
  signInWithGoogle: () => Promise<{ error: any }>;
  /** Lier le compte avec Google */
  linkWithGoogle: () => Promise<{ error: any }>;
  /** Délier le compte Google */
  unlinkGoogle: () => Promise<{ error: any }>;
  /** Fonction de déconnexion */
  signOut: () => Promise<void>;
  /** Mise à jour du profil */
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  /** Mise à jour de l'avatar */
  updateAvatar: (file: File) => Promise<{ error: any }>;
  /** Suppression de l'avatar */
  deleteAvatar: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider d'authentification qui gère l'état global de l'utilisateur
 * @param children - Composants enfants
 * @returns JSX.Element
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when authenticated
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setProfile(data as Profile);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const linkWithGoogle = async () => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase.auth.linkIdentity({
      provider: 'google'
    });
    return { error };
  };

  const unlinkGoogle = async () => {
    if (!user) return { error: 'Not authenticated' };

    // Trouver l'identité Google
    const googleIdentity = user.identities?.find(identity => identity.provider === 'google');
    if (!googleIdentity) return { error: 'No Google account linked' };

    const { error } = await supabase.auth.unlinkIdentity({
      provider: 'google',
      identityId: googleIdentity.id
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Force sign out even if session is corrupted
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
    // Force clear local state regardless of API response
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    
    return { error };
  };

  const updateAvatar = async (file: File) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Upload de l'avatar
      const { avatarUrl }: AvatarUploadResult = await uploadUserAvatar(file, user.id);
      
      // Mise à jour du profil avec la nouvelle URL
      const { error } = await updateProfile({ avatar_url: avatarUrl });
      
      return { error };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { error: error instanceof Error ? error.message : 'Failed to update avatar' };
    }
  };

  const deleteAvatar = async () => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Supprimer les fichiers de stockage
      await deleteUserAvatar(user.id);
      
      // Mettre à jour le profil pour enlever l'URL de l'avatar
      const { error } = await updateProfile({ avatar_url: null });
      
      return { error };
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return { error: error instanceof Error ? error.message : 'Failed to delete avatar' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      linkWithGoogle,
      unlinkGoogle,
      signOut,
      updateProfile,
      updateAvatar,
      deleteAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
