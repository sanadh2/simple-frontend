"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient, type DashboardAnalytics } from "@/lib/api"

export const dashboardAnalyticsKeys = {
	all: ["analytics", "dashboard"] as const,
}

export function useDashboardAnalytics() {
	return useQuery({
		queryKey: dashboardAnalyticsKeys.all,
		queryFn: async (): Promise<DashboardAnalytics> => {
			const response = await apiClient.getDashboardAnalytics()
			if (!response.success || !response.data) {
				throw new Error(
					response.message || "Failed to fetch dashboard analytics"
				)
			}
			return response.data
		},
	})
}
