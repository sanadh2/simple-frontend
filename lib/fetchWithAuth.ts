interface FetchOptions extends RequestInit {
	skipAuth?: boolean
	skipRetry?: boolean
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
	if (isRefreshing && refreshPromise) {
		return refreshPromise
	}

	isRefreshing = true
	refreshPromise = (async () => {
		try {
			const API_BASE_URL =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

			const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			})

			if (!response.ok) {
				throw new Error("Token refresh failed")
			}

			const result = await response.json()

			return result.success === true
		} catch (error) {
			console.error("Token refresh error:", error)

			if (typeof window !== "undefined") {
				window.location.href = "/"
			}

			return false
		} finally {
			isRefreshing = false
			refreshPromise = null
		}
	})()

	return refreshPromise
}

export async function fetchWithAuth(
	url: string,
	options: FetchOptions = {}
): Promise<Response> {
	const { skipAuth = false, skipRetry = false, ...fetchOptions } = options

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(fetchOptions.headers as Record<string, string>),
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers,
		credentials: "include",
	})

	if (response.status === 401 && !skipRetry && !skipAuth) {
		const refreshed = await refreshAccessToken()

		if (refreshed) {
			return fetch(url, {
				...fetchOptions,
				headers,
				credentials: "include",
			})
		}
	}

	return response
}

export const authFetch = {
	get: (url: string, options: FetchOptions = {}) =>
		fetchWithAuth(url, { ...options, method: "GET" }),

	post: (url: string, body?: unknown, options: FetchOptions = {}) =>
		fetchWithAuth(url, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		}),

	put: (url: string, body?: unknown, options: FetchOptions = {}) =>
		fetchWithAuth(url, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		}),

	patch: (url: string, body?: unknown, options: FetchOptions = {}) =>
		fetchWithAuth(url, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		}),

	delete: (url: string, options: FetchOptions = {}) =>
		fetchWithAuth(url, { ...options, method: "DELETE" }),
}
