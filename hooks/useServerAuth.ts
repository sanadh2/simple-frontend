'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loginAction,
  registerAction,
  logoutAction,
  refreshTokenAction,
} from '@/actions/auth-actions';
import { authKeys } from '@/hooks/useAuth';

/**
 * Hook for login using Server Actions
 */
export function useServerLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await loginAction(email, password);
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
}

/**
 * Hook for register using Server Actions
 */
export function useServerRegister() {
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
      const response = await registerAction(email, password, firstName, lastName);
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
}

/**
 * Hook for logout using Server Actions
 */
export function useServerLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logoutAction();
    },
    onSuccess: () => {
      // Clear all auth queries
      queryClient.setQueryData(authKeys.profile(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Hook for token refresh using Server Actions
 */
export function useServerRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await refreshTokenAction();
      if (!response.success) {
        throw new Error(response.error || 'Token refresh failed');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate profile to refetch with new token
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

/**
 * Combined hook for easier access to all server auth functionality
 */
export function useServerAuthMutations() {
  const login = useServerLogin();
  const register = useServerRegister();
  const logout = useServerLogout();
  const refreshToken = useServerRefreshToken();

  return {
    login,
    register,
    logout,
    refreshToken,
  };
}

