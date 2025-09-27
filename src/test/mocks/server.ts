import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock des endpoints Supabase
export const handlers = [
  // Mock pour l'authentification
  http.post('https://dzrlrfkidaahceryoajc.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
      },
    });
  }),

  // Mock pour les workspaces
  http.get('https://dzrlrfkidaahceryoajc.supabase.co/rest/v1/workspaces', () => {
    return HttpResponse.json([
      {
        id: 'workspace-1',
        name: 'Test Workspace',
        description: 'A test workspace',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock pour les décisions
  http.get('https://dzrlrfkidaahceryoajc.supabase.co/rest/v1/decisions', () => {
    return HttpResponse.json([
      {
        id: 'decision-1',
        title: 'Test Decision',
        description: 'A test decision',
        workspace_id: 'workspace-1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock pour les services AI
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: 'Mock AI response',
            role: 'assistant',
          },
        },
      ],
    });
  }),
];

export const server = setupServer(...handlers);


