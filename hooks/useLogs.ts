"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
	type Log,
	type LogFilters,
	logsApiClient,
	type LogStatistics,
	type PaginatedLogs,
} from "@/lib/logs-api"

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const STALE_TIME_SECONDS = 30
const STALE_TIME_MINUTES_5 = 5
const STALE_TIME_MINUTES_1 = 1
const REFETCH_INTERVAL_SECONDS = 30
const REFETCH_INTERVAL_MINUTES_1 = 1
const DEFAULT_TRENDS_DAYS = 7

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
		staleTime: MILLISECONDS_PER_SECOND * STALE_TIME_SECONDS,
	})
}

export function useLogsBycorrelation_id(correlation_id: string) {
	return useQuery({
		queryKey: logsKeys.correlation(correlation_id),
		queryFn: () => logsApiClient.getLogsBycorrelation_id(correlation_id),
		enabled: !!correlation_id,
		staleTime:
			MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES_5,
	})
}

export function useLogStatistics() {
	return useQuery({
		queryKey: logsKeys.statistics(),
		queryFn: () => logsApiClient.getLogStatistics(),
		staleTime:
			MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES_1,
		refetchInterval:
			MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * REFETCH_INTERVAL_MINUTES_1,
	})
}

export function useRecentErrors(limit = 20) {
	return useQuery({
		queryKey: logsKeys.errors(limit),
		queryFn: () => logsApiClient.getRecentErrors(limit),
		staleTime: MILLISECONDS_PER_SECOND * REFETCH_INTERVAL_SECONDS,
		refetchInterval: MILLISECONDS_PER_SECOND * REFETCH_INTERVAL_SECONDS,
	})
}

export function useLogTrends(days = DEFAULT_TRENDS_DAYS) {
	return useQuery({
		queryKey: logsKeys.trends(days),
		queryFn: () => logsApiClient.getLogTrends(days),
		staleTime:
			MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES_5,
	})
}

export function useClearOldLogs() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (days: number) => logsApiClient.clearOldLogs(days),
		onMutate: async (days) => {
			await queryClient.cancelQueries({ queryKey: logsKeys.all })

			const previousQueries = queryClient.getQueriesData({
				queryKey: logsKeys.all,
			})

			const cutoffDate = new Date()
			cutoffDate.setDate(cutoffDate.getDate() - days)

			queryClient.setQueriesData<PaginatedLogs>(
				{ queryKey: logsKeys.lists() },
				(old) => {
					if (!old) {
						return old
					}
					const filteredLogs = old.logs.filter((log) => {
						const logDate = new Date(log.timestamp)
						return logDate >= cutoffDate
					})
					return {
						...old,
						logs: filteredLogs,
						totalCount: Math.max(
							0,
							old.totalCount - (old.logs.length - filteredLogs.length)
						),
						totalPages: Math.ceil(
							Math.max(
								0,
								old.totalCount - (old.logs.length - filteredLogs.length)
							) / old.pageSize
						),
					}
				}
			)

			const correlationQueries = queryClient.getQueriesData({
				queryKey: [...logsKeys.all, "correlation"],
			})
			correlationQueries.forEach(([queryKey, data]) => {
				if (Array.isArray(data)) {
					queryClient.setQueryData<Log[]>(queryKey, (old) => {
						if (!old || !Array.isArray(old)) {
							return old
						}
						return old.filter((log) => {
							const logDate = new Date(log.timestamp)
							return logDate >= cutoffDate
						})
					})
				}
			})

			const errorQueries = queryClient.getQueriesData({
				queryKey: [...logsKeys.all, "errors"],
			})
			errorQueries.forEach(([queryKey, data]) => {
				if (Array.isArray(data)) {
					queryClient.setQueryData<Log[]>(queryKey, (old) => {
						if (!old || !Array.isArray(old)) {
							return old
						}
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
			if (context?.previousQueries) {
				context.previousQueries.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data)
				})
			}
		},
		onSuccess: async (data) => {
			queryClient.setQueryData<LogStatistics>(logsKeys.statistics(), (old) => {
				if (!old) {
					return old
				}
				return {
					...old,
					totalLogs: Math.max(0, old.totalLogs - data.deletedCount),
				}
			})

			await queryClient.invalidateQueries({ queryKey: logsKeys.statistics() })
			await queryClient.invalidateQueries({
				queryKey: logsKeys.trends(DEFAULT_TRENDS_DAYS),
			})
		},
	})
}
