'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loginAction,
  registerAction,
  logoutAction,
  refreshTokenAction,
} from '@/actions/auth-actions';
import { authKeys } from '@/hooks/useAuth';

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
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
}

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
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
}

export function useServerLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logoutAction();
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.profile(), null);
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

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
