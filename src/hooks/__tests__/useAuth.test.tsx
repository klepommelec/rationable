import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';

// Mock de Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
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

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
  });

  it('should handle sign in', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
    };

    mockSupabaseClient.auth.signIn.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.signIn('test@example.com', 'password');

    expect(mockSupabaseClient.auth.signIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle sign out', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await result.current.signOut();

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should handle sign up', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
    };

    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await result.current.signUp('test@example.com', 'password');

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle auth state changes', () => {
    const mockCallback = vi.fn();
    
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
  });
});


