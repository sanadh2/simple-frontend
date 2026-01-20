import { QueryClient } from "@tanstack/react-query"

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const STALE_TIME_MINUTES = 5
const GC_TIME_MINUTES = 10
const HTTP_UNAUTHORIZED = 401

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime:
				MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES,
			gcTime: MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * GC_TIME_MINUTES,
			retry: (failureCount, error) => {
				if (
					error instanceof Error &&
					"status" in error &&
					error.status === HTTP_UNAUTHORIZED
				) {
					return false
				}
				return failureCount < 1
			},
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 0,
			onError: (error) => {
				console.error("Mutation error:", error)
			},
		},
	},
})
