import { env } from "@/env"

import { clearAuthCookieClient } from "./cookie-utils"
import { getDeviceFingerprint } from "./deviceFingerprint"

const HTTP_UNAUTHORIZED = 401

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
			const response = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				}
			)

			if (!response.ok) {
				throw new Error("Token refresh failed")
			}

			const result = await response.json()

			return result.success === true
		} catch (error) {
			console.error("Token refresh error:", error)
			return false
		} finally {
			isRefreshing = false
			refreshPromise = null
		}
	})()

	return refreshPromise
}

function isAuthRequest(url: string): boolean {
	const authPaths = [
		"/api/auth/login",
		"/api/auth/register",
		"/api/auth/logout",
		"/api/auth/logout-all",
		"/api/auth/verify-email",
		"/api/auth/verify-email-login",
		"/api/auth/verify-email-registration",
	]
	return authPaths.some((path) => url.includes(path))
}

async function addFingerprintHeader(
	headers: Record<string, string>
): Promise<Record<string, string>> {
	if (typeof window === "undefined") {
		return headers
	}

	try {
		const fingerprint = await getDeviceFingerprint()
		return { ...headers, "X-Device-Fingerprint": fingerprint }
	} catch (error) {
		console.error("Failed to get device fingerprint:", error)
		return headers
	}
}

function buildHeaders(fetchOptions: RequestInit): Record<string, string> {
	const isFormData = fetchOptions.body instanceof FormData
	const baseHeaders = fetchOptions.headers as Record<string, string> | undefined

	if (isFormData) {
		return { ...baseHeaders }
	}

	return {
		"Content-Type": "application/json",
		...baseHeaders,
	}
}

async function performFetch(
	url: string,
	fetchOptions: RequestInit,
	headers: Record<string, string>
): Promise<Response> {
	return fetch(url, {
		...fetchOptions,
		headers,
		credentials: "include",
	})
}

async function handleUnauthorized(
	url: string,
	fetchOptions: RequestInit,
	headers: Record<string, string>
): Promise<Response | null> {
	if (isAuthRequest(url)) {
		return null
	}

	const refreshed = await refreshAccessToken()
	if (!refreshed) {
		clearAuthCookieClient()
		if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
			window.location.href = "/auth"
		}
		return null
	}

	const updatedHeaders = await addFingerprintHeader(headers)
	return performFetch(url, fetchOptions, updatedHeaders)
}

export async function fetchWithAuth(
	url: string,
	options: FetchOptions = {}
): Promise<Response> {
	const { skipAuth = false, skipRetry = false, ...fetchOptions } = options

	let headers = buildHeaders(fetchOptions)
	headers = await addFingerprintHeader(headers)

	const response = await performFetch(url, fetchOptions, headers)

	if (response.status === HTTP_UNAUTHORIZED && !skipRetry && !skipAuth) {
		const retryResponse = await handleUnauthorized(url, fetchOptions, headers)
		if (retryResponse) {
			return retryResponse
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
