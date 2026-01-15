import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 10,
			retry: (failureCount, error) => {
				// Don't retry on 401 errors - let components handle auth state
				// Don't redirect here as it causes hard refreshes
				if (
					error instanceof Error &&
					"status" in error &&
					error.status === 401
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
				// Don't redirect on 401 errors in mutations
				// Components should handle auth state changes
				console.error("Mutation error:", error)
			},
		},
	},
})
