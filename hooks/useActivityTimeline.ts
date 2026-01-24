"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient, type TimelineActivity } from "@/lib/api"

export const activityTimelineKeys = {
	all: ["activity-timeline"] as const,
	list: (params?: { startDate?: string; endDate?: string }) =>
		[...activityTimelineKeys.all, "list", params] as const,
}

export function useActivityTimeline(params?: {
	startDate?: string
	endDate?: string
}) {
	return useQuery({
		queryKey: activityTimelineKeys.list(params),
		queryFn: async (): Promise<TimelineActivity[]> => {
			const response = await apiClient.getActivityTimeline(params)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch activity timeline")
			}
			return response.data
		},
	})
}
