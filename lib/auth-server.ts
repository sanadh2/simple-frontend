import { cookies } from "next/headers"

import { env } from "@/env"
import { type ApiResponse, type AuthTokens, type User } from "@/lib/api"

import "server-only"

const API_BASE_URL = env.NEXT_PUBLIC_API_URL

// Time constants for cookie max age (7 days)
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS = 7
const MAX_AGE = DAYS * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE
class ServerApiClient {
	private baseURL: string

	constructor(baseURL: string) {
		this.baseURL = baseURL
	}

	private async getAuthHeaders(): Promise<HeadersInit> {
		const cookieStore = await cookies()
		const accessToken = cookieStore.get("accessToken")?.value

		const headers: HeadersInit = {
			"Content-Type": "application/json",
		}

		if (accessToken) {
			headers.Authorization = `Bearer ${accessToken}`
		}

		return headers
	}

	private async getCookieHeader(): Promise<string> {
		const cookieStore = await cookies()
		return cookieStore.toString()
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseURL}${endpoint}`
		const headers = await this.getAuthHeaders()
		const cookieHeader = await this.getCookieHeader()

		const config: RequestInit = {
			...options,
			headers: {
				...headers,
				...(cookieHeader ? { Cookie: cookieHeader } : {}),
				...options.headers,
			},
			credentials: "include",
			cache: "no-store",
		}

		try {
			const response = await fetch(url, config)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message ?? "An error occurred")
			}

			return response.json()
		} catch (error) {
			if (error instanceof Error) {
				throw error
			}
			throw new Error("Network error occurred")
		}
	}

	async getProfile(): Promise<ApiResponse<{ user: User }>> {
		return this.request("/api/auth/me", {
			method: "GET",
		})
	}

	async login(
		email: string,
		password: string
	): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
		return this.request("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		})
	}

	async register(
		email: string,
		password: string,
		first_name: string,
		last_name: string
	): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
		return this.request("/api/auth/register", {
			method: "POST",
			body: JSON.stringify({ email, password, first_name, last_name }),
		})
	}

	async logout(): Promise<ApiResponse> {
		const cookieStore = await cookies()
		const refreshToken = cookieStore.get("refreshToken")?.value

		// The request method will automatically handle Set-Cookie headers
		return this.request("/api/auth/logout", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		})
	}

	async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
		const cookieStore = await cookies()
		const refreshToken = cookieStore.get("refreshToken")?.value

		return this.request("/api/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		})
	}
}

export const serverApiClient = new ServerApiClient(API_BASE_URL)

export async function getCurrentUser(): Promise<User | null> {
	try {
		const cookieStore = await cookies()
		const accessToken = cookieStore.get("accessToken")?.value

		if (!accessToken) {
			return null
		}

		const response = await serverApiClient.getProfile()
		return response.success && response.data ? response.data.user : null
	} catch (error) {
		console.error("Failed to get current user:", error)
		return null
	}
}

export async function isAuthenticated(): Promise<boolean> {
	const user = await getCurrentUser()
	return user !== null
}

/**
 * Set the isAuthenticated cookie in the client app
 * This cookie is readable by both:
 * - Client-side JavaScript (httpOnly: false)
 * - Next.js middleware/proxy.ts (can read all cookies)
 */
export async function setAuthCookies() {
	const cookieStore = await cookies()
	const isProduction = env.NODE_ENV === "production"

	cookieStore.set("isAuthenticated", "true", {
		path: "/", // Available on all routes
		httpOnly: false, // Allows client-side JavaScript to read it
		secure: isProduction, // HTTPS only in production
		sameSite: isProduction ? "none" : "lax", // Cross-site support in production
		maxAge: MAX_AGE, // 7 days
	})
}

export async function clearAuthCookies() {
	const cookieStore = await cookies()
	cookieStore.delete("accessToken")
	cookieStore.delete("refreshToken")
	cookieStore.delete("isAuthenticated")
	cookieStore.delete("sessionId")
}

export async function getAccessToken(): Promise<string | null> {
	const cookieStore = await cookies()
	return cookieStore.get("accessToken")?.value ?? null
}

export async function getRefreshToken(): Promise<string | null> {
	const cookieStore = await cookies()
	return cookieStore.get("refreshToken")?.value ?? null
}

/**
 * Get the isAuthenticated cookie value
 * Can be used by server-side code to check authentication status
 */
export async function getIsAuthenticated(): Promise<boolean> {
	const cookieStore = await cookies()
	return cookieStore.get("isAuthenticated")?.value === "true"
}
