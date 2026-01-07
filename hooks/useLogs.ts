'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logsApiClient, type LogFilters } from '@/lib/logs-api';

export const logsKeys = {
  all: ['logs'] as const,
  lists: () => [...logsKeys.all, 'list'] as const,
  list: (filters: LogFilters) => [...logsKeys.lists(), filters] as const,
  correlation: (id: string) => [...logsKeys.all, 'correlation', id] as const,
  statistics: () => [...logsKeys.all, 'statistics'] as const,
  errors: (limit: number) => [...logsKeys.all, 'errors', limit] as const,
  trends: (days: number) => [...logsKeys.all, 'trends', days] as const,
};

export function useLogs(filters: Parameters<typeof logsApiClient.getLogs>[0] = {}) {
  return useQuery({
    queryKey: logsKeys.list(filters),
    queryFn: () => logsApiClient.getLogs(filters),
    staleTime: 1000 * 30,
  });
}

export function useLogsByCorrelationId(correlationId: string) {
  return useQuery({
    queryKey: logsKeys.correlation(correlationId),
    queryFn: () => logsApiClient.getLogsByCorrelationId(correlationId),
    enabled: !!correlationId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogStatistics() {
  return useQuery({
    queryKey: logsKeys.statistics(),
    queryFn: () => logsApiClient.getLogStatistics(),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });
}

export function useRecentErrors(limit: number = 20) {
  return useQuery({
    queryKey: logsKeys.errors(limit),
    queryFn: () => logsApiClient.getRecentErrors(limit),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

export function useLogTrends(days: number = 7) {
  return useQuery({
    queryKey: logsKeys.trends(days),
    queryFn: () => logsApiClient.getLogTrends(days),
    staleTime: 1000 * 60 * 5,
  });
}

export function useClearOldLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (days: number) => logsApiClient.clearOldLogs(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logsKeys.all });
    },
  });
}

