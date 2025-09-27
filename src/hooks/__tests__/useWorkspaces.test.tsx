import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkspaces } from '../useWorkspaces';

// Mock de Supabase
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// Wrapper pour les tests de hooks
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useWorkspaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    expect(result.current.workspaces).toEqual([]);
    expect(result.current.currentWorkspace).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(typeof result.current.createWorkspace).toBe('function');
    expect(typeof result.current.updateWorkspace).toBe('function');
    expect(typeof result.current.deleteWorkspace).toBe('function');
  });

  it('should fetch workspaces', async () => {
    const mockWorkspaces = [
      {
        id: 'workspace-1',
        name: 'Test Workspace',
        description: 'A test workspace',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    mockSupabaseClient.from().select().mockResolvedValue({
      data: mockWorkspaces,
      error: null,
    });

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces).toEqual(mockWorkspaces);
  });

  it('should create workspace', async () => {
    const newWorkspace = {
      name: 'New Workspace',
      description: 'A new workspace',
    };

    const createdWorkspace = {
      id: 'workspace-2',
      ...newWorkspace,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockSupabaseClient.from().insert().mockResolvedValue({
      data: [createdWorkspace],
      error: null,
    });

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await result.current.createWorkspace(newWorkspace);

    expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(newWorkspace);
  });

  it('should update workspace', async () => {
    const workspaceId = 'workspace-1';
    const updates = {
      name: 'Updated Workspace',
    };

    mockSupabaseClient.from().update().eq().mockResolvedValue({
      data: [{ id: workspaceId, ...updates }],
      error: null,
    });

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await result.current.updateWorkspace(workspaceId, updates);

    expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updates);
    expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', workspaceId);
  });

  it('should delete workspace', async () => {
    const workspaceId = 'workspace-1';

    mockSupabaseClient.from().delete().eq().mockResolvedValue({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await result.current.deleteWorkspace(workspaceId);

    expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
    expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', workspaceId);
  });
});


