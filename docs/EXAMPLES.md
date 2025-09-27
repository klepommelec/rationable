# 💡 Exemples de Code et d'Utilisation

Ce document fournit des exemples pratiques d'utilisation de Rationable pour différents cas d'usage.

## 📋 Table des Matières

- [Exemples de Composants](#exemples-de-composants)
- [Hooks Personnalisés](#hooks-personnalisés)
- [Services API](#services-api)
- [Gestion d'État](#gestion-détat)
- [Tests](#tests)
- [Cas d'Usage Complets](#cas-dusage-complets)

## 🧩 Exemples de Composants

### Composant de Décision Simple

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';

/**
 * Composant pour créer une nouvelle décision
 */
export const CreateDecision: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createDecision, loading } = useDecisionMaker();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    try {
      await createDecision({
        title: title.trim(),
        description: description.trim(),
        criteria: [
          { name: 'Performance', weight: 0.4 },
          { name: 'Coût', weight: 0.3 },
          { name: 'Facilité d\'utilisation', weight: 0.3 }
        ],
        options: [
          { name: 'Option A', description: 'Première option' },
          { name: 'Option B', description: 'Deuxième option' }
        ]
      });
      
      // Reset form
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Créer une Nouvelle Décision</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Titre de la décision
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Choisir un framework frontend"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le contexte de votre décision..."
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
            />
          </div>
          
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? 'Création...' : 'Créer la Décision'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

### Composant de Liste de Décisions

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDecisions } from '@/hooks/useDecisions';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DecisionListProps {
  workspaceId: string;
}

/**
 * Composant affichant la liste des décisions d'un espace de travail
 */
export const DecisionList: React.FC<DecisionListProps> = ({ workspaceId }) => {
  const { decisions, loading, error } = useDecisions(workspaceId);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">Erreur lors du chargement des décisions</p>
        </CardContent>
      </Card>
    );
  }

  if (!decisions.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Aucune décision trouvée</p>
          <Button className="mt-4">Créer votre première décision</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {decisions.map((decision) => (
        <Card key={decision.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{decision.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDistanceToNow(new Date(decision.created_at), {
                    addSuffix: true,
                    locale: fr
                  })}
                </p>
              </div>
              <Badge variant={
                decision.status === 'completed' ? 'default' :
                decision.status === 'in_progress' ? 'secondary' : 'outline'
              }>
                {decision.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{decision.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{decision.criteria.length} critères</span>
                <span>{decision.options.length} options</span>
              </div>
              <Button variant="outline" size="sm">
                Voir la décision
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### Composant d'Analyse de Décision

```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDecisionAnalysis } from '@/hooks/useDecisionAnalysis';
import { Decision } from '@/types/decision';

interface DecisionAnalysisProps {
  decision: Decision;
}

/**
 * Composant affichant l'analyse d'une décision avec scores et recommandations
 */
export const DecisionAnalysis: React.FC<DecisionAnalysisProps> = ({ decision }) => {
  const { analysis, loading, error } = useDecisionAnalysis(decision.id);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if (analysis?.recommendation) {
      setSelectedOption(analysis.recommendation);
    }
  }, [analysis]);

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Analyse en cours...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">Erreur lors de l'analyse</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Aucune analyse disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommandation */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            🎯 Recommandation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-green-900">
                {analysis.recommendation}
              </h3>
              <p className="text-green-700 mt-1">
                Score: {analysis.scores[analysis.recommendation]}/10
              </p>
            </div>
            <Badge variant="default" className="bg-green-600">
              Confiance: {Math.round(analysis.confidence * 100)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scores détaillés */}
      <Card>
        <CardHeader>
          <CardTitle>Scores par Option</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analysis.scores).map(([option, score]) => (
              <div key={option} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  <span className="text-sm text-gray-600">{score}/10</span>
                </div>
                <Progress 
                  value={score * 10} 
                  className={`h-2 ${
                    option === analysis.recommendation ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Justification */}
      {analysis.justification && (
        <Card>
          <CardHeader>
            <CardTitle>Justification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {analysis.justification}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

## 🎣 Hooks Personnalisés

### Hook de Gestion des Décisions

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Decision, CreateDecisionData } from '@/types/decision';

/**
 * Hook pour gérer les décisions d'un espace de travail
 */
export const useDecisions = (workspaceId: string) => {
  const queryClient = useQueryClient();

  // Récupérer les décisions
  const {
    data: decisions = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['decisions', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Decision[];
    },
    enabled: !!workspaceId
  });

  // Créer une nouvelle décision
  const createDecisionMutation = useMutation({
    mutationFn: async (decisionData: CreateDecisionData) => {
      const { data, error } = await supabase
        .from('decisions')
        .insert({
          ...decisionData,
          workspace_id: workspaceId,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data as Decision;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions', workspaceId] });
    }
  });

  // Mettre à jour une décision
  const updateDecisionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Decision> }) => {
      const { data, error } = await supabase
        .from('decisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Decision;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions', workspaceId] });
    }
  });

  // Supprimer une décision
  const deleteDecisionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions', workspaceId] });
    }
  });

  return {
    decisions,
    loading,
    error,
    createDecision: createDecisionMutation.mutateAsync,
    updateDecision: updateDecisionMutation.mutateAsync,
    deleteDecision: deleteDecisionMutation.mutateAsync,
    isCreating: createDecisionMutation.isPending,
    isUpdating: updateDecisionMutation.isPending,
    isDeleting: deleteDecisionMutation.isPending
  };
};
```

### Hook d'Analyse IA

```typescript
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Decision } from '@/types/decision';

interface AnalysisResult {
  scores: Record<string, number>;
  recommendation: string;
  confidence: number;
  justification: string;
}

/**
 * Hook pour analyser une décision avec l'IA
 */
export const useDecisionAnalysis = (decisionId: string) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Mutation pour lancer l'analyse
  const analyzeMutation = useMutation({
    mutationFn: async (decision: Decision) => {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: {
            title: decision.title,
            description: decision.description,
            criteria: decision.criteria,
            options: decision.options
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse');
      }

      return response.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      setAnalysis(data);
    }
  });

  // Charger l'analyse existante
  useEffect(() => {
    const loadExistingAnalysis = async () => {
      try {
        const response = await fetch(`/api/decisions/${decisionId}/analysis`);
        if (response.ok) {
          const data = await response.json();
          setAnalysis(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'analyse:', error);
      }
    };

    if (decisionId) {
      loadExistingAnalysis();
    }
  }, [decisionId]);

  return {
    analysis,
    loading: analyzeMutation.isPending,
    error: analyzeMutation.error,
    analyze: analyzeMutation.mutateAsync
  };
};
```

### Hook de Gestion des Espaces de Travail

```typescript
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Workspace, CreateWorkspaceData } from '@/types/workspace';

/**
 * Hook pour gérer les espaces de travail de l'utilisateur
 */
export const useWorkspaces = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

  // Récupérer les espaces de travail
  const {
    data: workspaces = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['workspaces', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members!inner(user_id, role)
        `)
        .eq('workspace_members.user_id', user.id);

      if (error) throw error;
      return data as Workspace[];
    },
    enabled: !!user
  });

  // Créer un nouvel espace de travail
  const createWorkspaceMutation = useMutation({
    mutationFn: async (workspaceData: CreateWorkspaceData) => {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          ...workspaceData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter l'utilisateur comme owner
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      return data as Workspace;
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', user?.id] });
      setCurrentWorkspaceId(newWorkspace.id);
    }
  });

  // Mettre à jour un espace de travail
  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Workspace> }) => {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', user?.id] });
    }
  });

  // Récupérer l'espace de travail actuel
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  return {
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    loading,
    error,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    updateWorkspace: updateWorkspaceMutation.mutateAsync,
    setCurrentWorkspace: setCurrentWorkspaceId,
    isCreating: createWorkspaceMutation.isPending,
    isUpdating: updateWorkspaceMutation.isPending
  };
};
```

## 🔧 Services API

### Service de Décision

```typescript
import { supabase } from '@/integrations/supabase/client';
import { Decision, CreateDecisionData, UpdateDecisionData } from '@/types/decision';

/**
 * Service pour gérer les décisions
 */
export class DecisionService {
  /**
   * Récupère toutes les décisions d'un espace de travail
   */
  static async getDecisions(workspaceId: string): Promise<Decision[]> {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Decision[];
  }

  /**
   * Récupère une décision par son ID
   */
  static async getDecision(id: string): Promise<Decision> {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Decision;
  }

  /**
   * Crée une nouvelle décision
   */
  static async createDecision(decisionData: CreateDecisionData): Promise<Decision> {
    const { data, error } = await supabase
      .from('decisions')
      .insert(decisionData)
      .select()
      .single();

    if (error) throw error;
    return data as Decision;
  }

  /**
   * Met à jour une décision
   */
  static async updateDecision(id: string, updates: UpdateDecisionData): Promise<Decision> {
    const { data, error } = await supabase
      .from('decisions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Decision;
  }

  /**
   * Supprime une décision
   */
  static async deleteDecision(id: string): Promise<void> {
    const { error } = await supabase
      .from('decisions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Recherche des décisions
   */
  static async searchDecisions(
    workspaceId: string, 
    query: string
  ): Promise<Decision[]> {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Decision[];
  }

  /**
   * Récupère les décisions par statut
   */
  static async getDecisionsByStatus(
    workspaceId: string, 
    status: string
  ): Promise<Decision[]> {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Decision[];
  }
}
```

### Service d'Analyse IA

```typescript
import { Decision } from '@/types/decision';

interface AnalysisRequest {
  decision: {
    title: string;
    description: string;
    criteria: Array<{ name: string; weight: number; description?: string }>;
    options: Array<{ name: string; description: string }>;
  };
  provider?: 'openai' | 'claude' | 'perplexity';
}

interface AnalysisResponse {
  scores: Record<string, number>;
  recommendation: string;
  confidence: number;
  justification: string;
  criteria_analysis: Record<string, string>;
}

/**
 * Service pour l'analyse IA des décisions
 */
export class AIAnalysisService {
  /**
   * Analyse une décision avec l'IA
   */
  static async analyzeDecision(
    request: AnalysisRequest
  ): Promise<AnalysisResponse> {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Erreur d'analyse: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Génère des critères suggérés
   */
  static async suggestCriteria(
    title: string, 
    description: string
  ): Promise<Array<{ name: string; weight: number; description: string }>> {
    const response = await fetch('/api/ai/suggest-criteria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error(`Erreur de suggestion: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Génère des options suggérées
   */
  static async suggestOptions(
    title: string, 
    description: string
  ): Promise<Array<{ name: string; description: string }>> {
    const response = await fetch('/api/ai/suggest-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error(`Erreur de suggestion: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Recherche d'informations contextuelles
   */
  static async searchContext(
    query: string, 
    maxResults: number = 5
  ): Promise<Array<{ title: string; url: string; snippet: string }>> {
    const response = await fetch('/api/ai/search-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, maxResults })
    });

    if (!response.ok) {
      throw new Error(`Erreur de recherche: ${response.statusText}`);
    }

    return response.json();
  }
}
```

## 🧪 Tests

### Test de Composant

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '@/test/test-utils';
import { CreateDecision } from './CreateDecision';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';

// Mock du hook
vi.mock('@/hooks/useDecisionMaker');
const mockUseDecisionMaker = vi.mocked(useDecisionMaker);

describe('CreateDecision', () => {
  const mockCreateDecision = vi.fn();

  beforeEach(() => {
    mockUseDecisionMaker.mockReturnValue({
      createDecision: mockCreateDecision,
      loading: false,
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<CreateDecision />);
    
    expect(screen.getByLabelText(/titre de la décision/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer la décision/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateDecision />);
    
    const titleInput = screen.getByLabelText(/titre de la décision/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole('button', { name: /créer la décision/i });
    
    await user.type(titleInput, 'Test Decision');
    await user.type(descriptionInput, 'Test Description');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateDecision).toHaveBeenCalledWith({
        title: 'Test Decision',
        description: 'Test Description',
        criteria: expect.any(Array),
        options: expect.any(Array)
      });
    });
  });

  it('should not submit with empty title', async () => {
    const user = userEvent.setup();
    render(<CreateDecision />);
    
    const submitButton = screen.getByRole('button', { name: /créer la décision/i });
    
    await user.click(submitButton);
    
    expect(mockCreateDecision).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    mockUseDecisionMaker.mockReturnValue({
      createDecision: mockCreateDecision,
      loading: true,
      error: null
    });
    
    render(<CreateDecision />);
    
    expect(screen.getByText(/création.../i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Test de Hook

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDecisions } from './useDecisions';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');
const mockSupabase = vi.mocked(supabase);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDecisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch decisions for a workspace', async () => {
    const mockDecisions = [
      { id: '1', title: 'Decision 1', workspace_id: 'workspace-1' },
      { id: '2', title: 'Decision 2', workspace_id: 'workspace-1' }
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockDecisions,
        error: null
      })
    });

    const { result } = renderHook(
      () => useDecisions('workspace-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.decisions).toEqual(mockDecisions);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Fetch failed');
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    });

    const { result } = renderHook(
      () => useDecisions('workspace-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.decisions).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });
});
```

## 🎯 Cas d'Usage Complets

### Application Complète de Gestion de Décisions

```typescript
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { WorkspaceProvider } from '@/hooks/useWorkspaces';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

// Pages
import { HomePage } from '@/pages/HomePage';
import { DecisionPage } from '@/pages/DecisionPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AuthPage } from '@/pages/AuthPage';

// Composants
import { Navigation } from '@/components/Navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

/**
 * Composant principal de l'application
 */
export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="rationable-theme">
        <AuthProvider>
          <WorkspaceProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/workspace/:id" element={<WorkspacePage />} />
                    <Route path="/decision/:id" element={<DecisionPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </main>
                <Toaster />
              </div>
            </Router>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
```

### Page d'Accueil avec Dashboard

```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useDecisions } from '@/hooks/useDecisions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Users, Target } from 'lucide-react';

/**
 * Page d'accueil avec dashboard des décisions
 */
export const HomePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { workspaces, currentWorkspace } = useWorkspaces();
  const { decisions, loading: decisionsLoading } = useDecisions(
    currentWorkspace?.id || ''
  );

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const recentDecisions = decisions.slice(0, 5);
  const completedDecisions = decisions.filter(d => d.status === 'completed').length;
  const inProgressDecisions = decisions.filter(d => d.status === 'in_progress').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenue, {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Décision
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Décisions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressDecisions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDecisions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaces</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaces.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>Décisions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {decisionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentDecisions.length > 0 ? (
            <div className="space-y-4">
              {recentDecisions.map((decision) => (
                <div key={decision.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{decision.title}</h3>
                    <p className="text-sm text-gray-600">{decision.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      decision.status === 'completed' ? 'default' :
                      decision.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {decision.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune décision récente</p>
              <Button>Créer votre première décision</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

---

Ces exemples couvrent les cas d'usage les plus courants de Rationable. Ils peuvent être adaptés et étendus selon vos besoins spécifiques. Pour plus d'exemples ou des cas d'usage particuliers, n'hésitez pas à consulter la documentation ou à ouvrir une issue sur GitHub.


