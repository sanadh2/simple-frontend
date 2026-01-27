import { useQuery } from "@tanstack/react-query"

import { apiClient, type UpcomingScheduledEmail } from "@/lib/api"

export const upcomingScheduledEmailsKeys = {
	all: ["upcoming-scheduled-emails"] as const,
	upcoming: (limit?: number) =>
		[...upcomingScheduledEmailsKeys.all, "upcoming", limit] as const,
}

export function useUpcomingScheduledEmails(limit = 10, enabled = true) {
	return useQuery({
		queryKey: upcomingScheduledEmailsKeys.upcoming(limit),
		enabled,
		queryFn: async (): Promise<UpcomingScheduledEmail[]> => {
			const response = await apiClient.getUpcomingScheduledEmails(limit)
			if (!response.success || !response.data) {
				throw new Error(
					response.message || "Failed to fetch upcoming scheduled emails"
				)
			}
			return response.data
		},
	})
}
