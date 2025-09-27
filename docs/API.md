# 📡 Documentation API

Cette documentation décrit les endpoints et services API utilisés dans Rationable.

## 📋 Table des Matières

- [Authentification](#authentification)
- [Gestion des Utilisateurs](#gestion-des-utilisateurs)
- [Espaces de Travail](#espaces-de-travail)
- [Décisions](#décisions)
- [Commentaires](#commentaires)
- [Templates](#templates)
- [Services IA](#services-ia)
- [Gestion des Fichiers](#gestion-des-fichiers)
- [Analytics](#analytics)

## 🔐 Authentification

### Supabase Auth

Rationable utilise Supabase pour l'authentification avec support des méthodes suivantes :

#### Connexion par Email/Mot de Passe

```typescript
/**
 * Connexion utilisateur avec email et mot de passe
 * @param email - Adresse email de l'utilisateur
 * @param password - Mot de passe
 * @returns Promise avec les données de session ou erreur
 */
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

#### Inscription

```typescript
/**
 * Inscription d'un nouvel utilisateur
 * @param email - Adresse email
 * @param password - Mot de passe
 * @param fullName - Nom complet
 * @returns Promise avec les données utilisateur ou erreur
 */
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});
```

#### Connexion Google

```typescript
/**
 * Connexion avec Google OAuth
 * @returns Promise avec les données de session ou erreur
 */
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

#### Déconnexion

```typescript
/**
 * Déconnexion de l'utilisateur actuel
 * @returns Promise vide
 */
const { error } = await supabase.auth.signOut();
```

## 👤 Gestion des Utilisateurs

### Profils Utilisateurs

#### Récupérer le Profil

```typescript
/**
 * Récupère le profil d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @returns Promise avec les données du profil
 */
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

#### Mettre à Jour le Profil

```typescript
/**
 * Met à jour le profil utilisateur
 * @param userId - ID de l'utilisateur
 * @param updates - Données à mettre à jour
 * @returns Promise avec les données mises à jour
 */
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Nouveau Nom',
    use_context: 'professional',
    onboarding_completed: true
  })
  .eq('id', userId)
  .select()
  .single();
```

#### Gestion des Avatars

```typescript
/**
 * Upload d'un avatar utilisateur
 * @param file - Fichier image
 * @param userId - ID de l'utilisateur
 * @returns Promise avec l'URL de l'avatar
 */
const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
    
  return publicUrl;
};
```

## 🏢 Espaces de Travail

### CRUD des Espaces de Travail

#### Créer un Espace de Travail

```typescript
/**
 * Crée un nouvel espace de travail
 * @param workspaceData - Données de l'espace de travail
 * @returns Promise avec l'espace créé
 */
const { data, error } = await supabase
  .from('workspaces')
  .insert({
    name: 'Mon Espace de Travail',
    description: 'Description de l\'espace',
    created_by: userId
  })
  .select()
  .single();
```

#### Récupérer les Espaces de Travail

```typescript
/**
 * Récupère tous les espaces de travail d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @returns Promise avec la liste des espaces
 */
const { data, error } = await supabase
  .from('workspaces')
  .select(`
    *,
    workspace_members!inner(user_id)
  `)
  .eq('workspace_members.user_id', userId);
```

#### Mettre à Jour un Espace de Travail

```typescript
/**
 * Met à jour un espace de travail
 * @param workspaceId - ID de l'espace de travail
 * @param updates - Données à mettre à jour
 * @returns Promise avec l'espace mis à jour
 */
const { data, error } = await supabase
  .from('workspaces')
  .update({
    name: 'Nouveau Nom',
    description: 'Nouvelle description'
  })
  .eq('id', workspaceId)
  .select()
  .single();
```

#### Supprimer un Espace de Travail

```typescript
/**
 * Supprime un espace de travail
 * @param workspaceId - ID de l'espace de travail
 * @returns Promise vide
 */
const { error } = await supabase
  .from('workspaces')
  .delete()
  .eq('id', workspaceId);
```

### Gestion des Membres

#### Ajouter un Membre

```typescript
/**
 * Ajoute un membre à un espace de travail
 * @param workspaceId - ID de l'espace de travail
 * @param userId - ID de l'utilisateur
 * @param role - Rôle du membre
 * @returns Promise avec les données du membre
 */
const { data, error } = await supabase
  .from('workspace_members')
  .insert({
    workspace_id: workspaceId,
    user_id: userId,
    role: 'member' // 'owner' | 'admin' | 'member'
  })
  .select()
  .single();
```

#### Récupérer les Membres

```typescript
/**
 * Récupère tous les membres d'un espace de travail
 * @param workspaceId - ID de l'espace de travail
 * @returns Promise avec la liste des membres
 */
const { data, error } = await supabase
  .from('workspace_members')
  .select(`
    *,
    profiles!inner(full_name, email, avatar_url)
  `)
  .eq('workspace_id', workspaceId);
```

## 🎯 Décisions

### CRUD des Décisions

#### Créer une Décision

```typescript
/**
 * Crée une nouvelle décision
 * @param decisionData - Données de la décision
 * @returns Promise avec la décision créée
 */
const { data, error } = await supabase
  .from('decisions')
  .insert({
    title: 'Choisir un Framework Frontend',
    description: 'Décision pour le nouveau projet web',
    workspace_id: workspaceId,
    status: 'draft',
    criteria: [
      { name: 'Performance', weight: 0.4, description: 'Vitesse d\'exécution' },
      { name: 'Écosystème', weight: 0.3, description: 'Communauté et packages' },
      { name: 'Courbe d\'apprentissage', weight: 0.3, description: 'Facilité d\'apprentissage' }
    ],
    options: [
      { name: 'React', description: 'Bibliothèque UI de Facebook' },
      { name: 'Vue.js', description: 'Framework progressif' },
      { name: 'Angular', description: 'Framework complet de Google' }
    ]
  })
  .select()
  .single();
```

#### Récupérer les Décisions

```typescript
/**
 * Récupère toutes les décisions d'un espace de travail
 * @param workspaceId - ID de l'espace de travail
 * @param status - Statut de la décision (optionnel)
 * @returns Promise avec la liste des décisions
 */
const { data, error } = await supabase
  .from('decisions')
  .select('*')
  .eq('workspace_id', workspaceId)
  .eq('status', status) // 'draft' | 'in_progress' | 'completed' | 'archived'
  .order('created_at', { ascending: false });
```

#### Mettre à Jour une Décision

```typescript
/**
 * Met à jour une décision
 * @param decisionId - ID de la décision
 * @param updates - Données à mettre à jour
 * @returns Promise avec la décision mise à jour
 */
const { data, error } = await supabase
  .from('decisions')
  .update({
    title: 'Nouveau Titre',
    status: 'in_progress',
    analysis_results: {
      scores: { 'React': 8.5, 'Vue.js': 7.2, 'Angular': 6.8 },
      recommendation: 'React',
      confidence: 0.85
    }
  })
  .eq('id', decisionId)
  .select()
  .single();
```

#### Supprimer une Décision

```typescript
/**
 * Supprime une décision
 * @param decisionId - ID de la décision
 * @returns Promise vide
 */
const { error } = await supabase
  .from('decisions')
  .delete()
  .eq('id', decisionId);
```

### Partage Public

#### Créer un Partage Public

```typescript
/**
 * Crée un lien de partage public pour une décision
 * @param decisionId - ID de la décision
 * @returns Promise avec l'ID public
 */
const { data, error } = await supabase
  .from('public_decisions')
  .insert({
    decision_id: decisionId,
    public_id: generatePublicId(), // Fonction utilitaire
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  })
  .select()
  .single();
```

#### Récupérer une Décision Publique

```typescript
/**
 * Récupère une décision via son ID public
 * @param publicId - ID public de la décision
 * @returns Promise avec la décision
 */
const { data, error } = await supabase
  .from('public_decisions')
  .select(`
    *,
    decisions!inner(*)
  `)
  .eq('public_id', publicId)
  .eq('expires_at', '>', new Date().toISOString())
  .single();
```

## 💬 Commentaires

### CRUD des Commentaires

#### Créer un Commentaire

```typescript
/**
 * Crée un nouveau commentaire sur une décision
 * @param commentData - Données du commentaire
 * @returns Promise avec le commentaire créé
 */
const { data, error } = await supabase
  .from('comments')
  .insert({
    decision_id: decisionId,
    user_id: userId,
    content: 'Je pense que React est le meilleur choix...',
    parent_id: null, // null pour un commentaire racine
    mentions: ['@user1', '@user2'] // Mentions d'utilisateurs
  })
  .select(`
    *,
    profiles!inner(full_name, avatar_url)
  `)
  .single();
```

#### Récupérer les Commentaires

```typescript
/**
 * Récupère tous les commentaires d'une décision
 * @param decisionId - ID de la décision
 * @returns Promise avec la liste des commentaires
 */
const { data, error } = await supabase
  .from('comments')
  .select(`
    *,
    profiles!inner(full_name, avatar_url),
    replies:comments!parent_id(*, profiles!inner(full_name, avatar_url))
  `)
  .eq('decision_id', decisionId)
  .is('parent_id', null)
  .order('created_at', { ascending: true });
```

## 📋 Templates

### Gestion des Templates

#### Créer un Template

```typescript
/**
 * Crée un nouveau template de décision
 * @param templateData - Données du template
 * @returns Promise avec le template créé
 */
const { data, error } = await supabase
  .from('decision_templates')
  .insert({
    name: 'Template Choix Technologique',
    description: 'Template pour choisir une technologie',
    category: 'technology',
    is_public: true,
    created_by: userId,
    template_data: {
      criteria: [
        { name: 'Performance', weight: 0.3 },
        { name: 'Écosystème', weight: 0.3 },
        { name: 'Courbe d\'apprentissage', weight: 0.2 },
        { name: 'Support communautaire', weight: 0.2 }
      ],
      default_options: ['Option A', 'Option B', 'Option C']
    }
  })
  .select()
  .single();
```

#### Récupérer les Templates

```typescript
/**
 * Récupère les templates publics et privés
 * @param userId - ID de l'utilisateur (optionnel)
 * @returns Promise avec la liste des templates
 */
const { data, error } = await supabase
  .from('decision_templates')
  .select('*')
  .or(`is_public.eq.true${userId ? `,created_by.eq.${userId}` : ''}`)
  .order('usage_count', { ascending: false });
```

## 🤖 Services IA

### OpenAI Integration

```typescript
/**
 * Analyse une décision avec OpenAI
 * @param decisionData - Données de la décision
 * @returns Promise avec l'analyse IA
 */
const analyzeWithOpenAI = async (decisionData: DecisionData) => {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      provider: 'openai',
      model: 'gpt-4',
      decision: decisionData
    })
  });
  
  return response.json();
};
```

### Claude Integration

```typescript
/**
 * Analyse une décision avec Claude
 * @param decisionData - Données de la décision
 * @returns Promise avec l'analyse IA
 */
const analyzeWithClaude = async (decisionData: DecisionData) => {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${claudeApiKey}`
    },
    body: JSON.stringify({
      provider: 'claude',
      model: 'claude-3-sonnet-20240229',
      decision: decisionData
    })
  });
  
  return response.json();
};
```

### Perplexity Integration

```typescript
/**
 * Recherche d'informations avec Perplexity
 * @param query - Requête de recherche
 * @returns Promise avec les résultats
 */
const searchWithPerplexity = async (query: string) => {
  const response = await fetch('/api/ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${perplexityApiKey}`
    },
    body: JSON.stringify({
      provider: 'perplexity',
      query: query,
      max_results: 5
    })
  });
  
  return response.json();
};
```

## 📁 Gestion des Fichiers

### Upload de Fichiers

```typescript
/**
 * Upload un fichier vers Supabase Storage
 * @param file - Fichier à uploader
 * @param bucket - Nom du bucket
 * @param path - Chemin dans le bucket
 * @returns Promise avec l'URL du fichier
 */
const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return publicUrl;
};
```

### Gestion des Documents

```typescript
/**
 * Associe un document à une décision
 * @param decisionId - ID de la décision
 * @param documentData - Données du document
 * @returns Promise avec le document créé
 */
const { data, error } = await supabase
  .from('decision_documents')
  .insert({
    decision_id: decisionId,
    name: 'Document de Référence.pdf',
    url: documentUrl,
    file_type: 'application/pdf',
    file_size: 1024000,
    uploaded_by: userId
  })
  .select()
  .single();
```

## 📊 Analytics

### Métriques d'Utilisation

```typescript
/**
 * Enregistre une action utilisateur
 * @param action - Type d'action
 * @param metadata - Métadonnées de l'action
 * @returns Promise vide
 */
const trackUserAction = async (action: string, metadata: any) => {
  const { error } = await supabase
    .from('user_analytics')
    .insert({
      user_id: userId,
      action: action,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      session_id: sessionId
    });
    
  if (error) console.error('Analytics error:', error);
};
```

### Récupération des Métriques

```typescript
/**
 * Récupère les métriques d'utilisation
 * @param workspaceId - ID de l'espace de travail
 * @param period - Période (7d, 30d, 90d)
 * @returns Promise avec les métriques
 */
const { data, error } = await supabase
  .from('workspace_analytics')
  .select('*')
  .eq('workspace_id', workspaceId)
  .gte('created_at', getDateFromPeriod(period))
  .order('created_at', { ascending: false });
```

## 🔒 Sécurité et Permissions

### Row Level Security (RLS)

Toutes les tables utilisent Row Level Security pour garantir la sécurité des données :

```sql
-- Exemple pour la table decisions
CREATE POLICY "Users can view decisions in their workspaces" ON decisions
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create decisions in their workspaces" ON decisions
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );
```

### Validation des Données

```typescript
/**
 * Valide les données d'une décision
 * @param decisionData - Données à valider
 * @returns Objet de validation
 */
const validateDecision = (decisionData: any) => {
  const errors: string[] = [];
  
  if (!decisionData.title || decisionData.title.length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }
  
  if (!decisionData.criteria || decisionData.criteria.length < 2) {
    errors.push('Au moins 2 critères sont requis');
  }
  
  if (!decisionData.options || decisionData.options.length < 2) {
    errors.push('Au moins 2 options sont requises');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## 🚨 Gestion des Erreurs

### Types d'Erreurs

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Exemples d'erreurs courantes
const ERROR_CODES = {
  AUTH_REQUIRED: 'auth_required',
  PERMISSION_DENIED: 'permission_denied',
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  RATE_LIMITED: 'rate_limited'
};
```

### Gestion des Erreurs

```typescript
/**
 * Gère les erreurs API de manière centralisée
 * @param error - Erreur à traiter
 * @returns Message d'erreur formaté
 */
const handleApiError = (error: any): string => {
  if (error.code === 'PGRST116') {
    return 'Ressource non trouvée';
  }
  
  if (error.code === '42501') {
    return 'Permissions insuffisantes';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Session expirée, veuillez vous reconnecter';
  }
  
  return error.message || 'Une erreur inattendue s\'est produite';
};
```

## 📈 Performance et Optimisation

### Pagination

```typescript
/**
 * Récupère les décisions avec pagination
 * @param workspaceId - ID de l'espace de travail
 * @param page - Numéro de page
 * @param limit - Nombre d'éléments par page
 * @returns Promise avec les données paginées
 */
const getDecisionsPaginated = async (
  workspaceId: string, 
  page: number = 1, 
  limit: number = 10
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('decisions')
    .select('*', { count: 'exact' })
    .eq('workspace_id', workspaceId)
    .range(from, to)
    .order('created_at', { ascending: false });
    
  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
};
```

### Cache et Optimisation

```typescript
/**
 * Cache les résultats avec TTL
 * @param key - Clé de cache
 * @param data - Données à mettre en cache
 * @param ttl - Durée de vie en secondes
 */
const setCache = (key: string, data: any, ttl: number = 300) => {
  const item = {
    data,
    timestamp: Date.now(),
    ttl: ttl * 1000
  };
  
  localStorage.setItem(`cache_${key}`, JSON.stringify(item));
};

/**
 * Récupère les données du cache
 * @param key - Clé de cache
 * @returns Données en cache ou null
 */
const getCache = (key: string) => {
  const item = localStorage.getItem(`cache_${key}`);
  
  if (!item) return null;
  
  const { data, timestamp, ttl } = JSON.parse(item);
  
  if (Date.now() - timestamp > ttl) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }
  
  return data;
};
```

---

Cette documentation API est maintenue à jour avec les évolutions du projet. Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue sur GitHub.


