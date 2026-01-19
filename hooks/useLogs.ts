"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
	type LogFilters,
	logsApiClient,
	type PaginatedLogs,
	type LogStatistics,
	type Log,
} from "@/lib/logs-api"

export const logsKeys = {
	all: ["logs"] as const,
	lists: () => [...logsKeys.all, "list"] as const,
	list: (filters: LogFilters) => [...logsKeys.lists(), filters] as const,
	correlation: (id: string) => [...logsKeys.all, "correlation", id] as const,
	statistics: () => [...logsKeys.all, "statistics"] as const,
	errors: (limit: number) => [...logsKeys.all, "errors", limit] as const,
	trends: (days: number) => [...logsKeys.all, "trends", days] as const,
}

export function useLogs(
	filters: Parameters<typeof logsApiClient.getLogs>[0] = {}
) {
	return useQuery({
		queryKey: logsKeys.list(filters),
		queryFn: () => logsApiClient.getLogs(filters),
		staleTime: 1000 * 30,
	})
}

export function useLogsByCorrelationId(correlationId: string) {
	return useQuery({
		queryKey: logsKeys.correlation(correlationId),
		queryFn: () => logsApiClient.getLogsByCorrelationId(correlationId),
		enabled: !!correlationId,
		staleTime: 1000 * 60 * 5,
	})
}

export function useLogStatistics() {
	return useQuery({
		queryKey: logsKeys.statistics(),
		queryFn: () => logsApiClient.getLogStatistics(),
		staleTime: 1000 * 60,
		refetchInterval: 1000 * 60,
	})
}

export function useRecentErrors(limit: number = 20) {
	return useQuery({
		queryKey: logsKeys.errors(limit),
		queryFn: () => logsApiClient.getRecentErrors(limit),
		staleTime: 1000 * 30,
		refetchInterval: 1000 * 30,
	})
}

export function useLogTrends(days: number = 7) {
	return useQuery({
		queryKey: logsKeys.trends(days),
		queryFn: () => logsApiClient.getLogTrends(days),
		staleTime: 1000 * 60 * 5,
	})
}

export function useClearOldLogs() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (days: number) => logsApiClient.clearOldLogs(days),
		onMutate: async (days) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: logsKeys.all })

			// Snapshot previous values for rollback
			const previousQueries = queryClient.getQueriesData({
				queryKey: logsKeys.all,
			})

			// Calculate cutoff date
			const cutoffDate = new Date()
			cutoffDate.setDate(cutoffDate.getDate() - days)

			// Optimistically update list queries - filter out old logs
			queryClient.setQueriesData<PaginatedLogs>(
				{ queryKey: logsKeys.lists() },
				(old) => {
					if (!old) return old
					const filteredLogs = old.logs.filter((log) => {
						const logDate = new Date(log.timestamp)
						return logDate >= cutoffDate
					})
					return {
						...old,
						logs: filteredLogs,
						totalCount: Math.max(0, old.totalCount - (old.logs.length - filteredLogs.length)),
						totalPages: Math.ceil(
							Math.max(0, old.totalCount - (old.logs.length - filteredLogs.length)) /
								old.pageSize
						),
					}
				}
			)

			// Optimistically update correlation queries - filter out old logs
			const correlationQueries = queryClient.getQueriesData({
				queryKey: [...logsKeys.all, "correlation"],
			})
			correlationQueries.forEach(([queryKey, data]) => {
				if (Array.isArray(data)) {
					queryClient.setQueryData<Log[]>(queryKey, (old) => {
						if (!old || !Array.isArray(old)) return old
						return old.filter((log) => {
							const logDate = new Date(log.timestamp)
							return logDate >= cutoffDate
						})
					})
				}
			})

			// Optimistically update recent errors queries - filter out old logs
			const errorQueries = queryClient.getQueriesData({
				queryKey: [...logsKeys.all, "errors"],
			})
			errorQueries.forEach(([queryKey, data]) => {
				if (Array.isArray(data)) {
					queryClient.setQueryData<Log[]>(queryKey, (old) => {
						if (!old || !Array.isArray(old)) return old
						return old.filter((log) => {
							const logDate = new Date(log.timestamp)
							return logDate >= cutoffDate
						})
					})
				}
			})

			return { previousQueries }
		},
		onError: (_error, _variables, context) => {
			// Rollback on error
			if (context?.previousQueries) {
				context.previousQueries.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data)
				})
			}
		},
		onSuccess: (data) => {
			// Update statistics with actual deleted count
			queryClient.setQueryData<LogStatistics>(
				logsKeys.statistics(),
				(old) => {
					if (!old) return old
					return {
						...old,
						totalLogs: Math.max(0, old.totalLogs - data.deletedCount),
						// Note: levelBreakdown would need server recalculation
						// So we invalidate it to refetch
					}
				}
			)

			// Invalidate trends and statistics breakdown as they need server recalculation
			queryClient.invalidateQueries({ queryKey: logsKeys.statistics() })
			queryClient.invalidateQueries({ queryKey: logsKeys.trends(7) })
		},
	})
}
