import { QueryClient } from '@tanstack/react-query';

const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
          handleUnauthorized();
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        if (error instanceof Error && 'status' in error && (error as any).status === 401) {
          handleUnauthorized();
        }
      },
    },
  },
});
