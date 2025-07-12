// API utility functions for client-side requests

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// Specific API functions
export const userApi = {
  register: (userData: { name: string; email: string }) =>
    apiRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateScore: (userId: string, score: number) =>
    apiRequest(`/api/user/${userId}/score`, {
      method: 'PATCH',
      body: JSON.stringify({ score }),
    }),
};

export const leaderboardApi = {
  get: (limit: number = 10, page: number = 1) =>
    apiRequest(`/api/leaderboard?limit=${limit}&page=${page}`),
};