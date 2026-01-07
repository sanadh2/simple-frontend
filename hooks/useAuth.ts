'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, User } from '@/lib/api';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Hook to get current user profile
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      try {
        const response = await apiClient.getProfile();
        return response.success && response.data ? response.data.user : null;
      } catch (error) {
        // Try to refresh token if profile fetch fails
        try {
          const refreshResponse = await apiClient.refreshToken();
          if (refreshResponse.success && refreshResponse.data) {
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            const profileResponse = await apiClient.getProfile();
            return profileResponse.success && profileResponse.data ? profileResponse.data.user : null;
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        return null;
      }
    },
    enabled: typeof window !== 'undefined',
  });
}

// Hook for login mutation
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiClient.login(email, password);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      // Update the profile cache
      queryClient.setQueryData(authKeys.profile(), data.user);
    },
  });
}

// Hook for register mutation
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      firstName,
      lastName,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const response = await apiClient.register(email, password, firstName, lastName);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      // Update the profile cache
      queryClient.setQueryData(authKeys.profile(), data.user);
    },
  });
}

// Hook for logout mutation
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear all auth queries
      queryClient.setQueryData(authKeys.profile(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

// Hook for logout all devices mutation
export function useLogoutAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.logoutAll();
    },
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear all auth queries
      queryClient.setQueryData(authKeys.profile(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

// Hook for token refresh mutation
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.refreshToken();
      if (!response.success || !response.data) {
        throw new Error('Token refresh failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      // Invalidate profile to refetch with new token
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

// Combined hook for easier access to all auth functionality
export function useAuthMutations() {
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const refreshToken = useRefreshToken();

  return {
    login,
    register,
    logout,
    logoutAll,
    refreshToken,
  };
}

