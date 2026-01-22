import { cookies } from "next/headers"

import { env } from "@/env"
import { type ApiResponse, type AuthTokens, type User } from "@/lib/api"

import "server-only"

const API_BASE_URL = env.NEXT_PUBLIC_API_URL

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

	/**
	 * Parses Set-Cookie header and sets cookies in Next.js cookie store
	 */
	private async setCookiesFromResponse(response: Response): Promise<void> {
		const setCookieHeaders = response.headers.getSetCookie()
		if (setCookieHeaders.length === 0) {
			return
		}

		const cookieStore = await cookies()
		const MILLISECONDS_PER_SECOND = 1000

		for (const setCookie of setCookieHeaders) {
			// Parse the Set-Cookie header
			// Format: name=value; Path=/; HttpOnly; SameSite=Lax; Max-Age=...
			const parts = setCookie.split(";").map((s) => s.trim())
			const nameValuePart = parts[0]
			const equalsIndex = nameValuePart.indexOf("=")

			if (equalsIndex === -1) {
				continue
			}

			const name = nameValuePart.substring(0, equalsIndex).trim()
			const value = nameValuePart.substring(equalsIndex + 1).trim()

			if (!name) {
				continue
			}

			// Parse attributes
			const attrs: Record<string, string | number | boolean> = {}
			for (let i = 1; i < parts.length; i++) {
				const attr = parts[i]
				const equalsIdx = attr.indexOf("=")
				if (equalsIdx !== -1) {
					const key = attr.substring(0, equalsIdx).trim().toLowerCase()
					const val = attr.substring(equalsIdx + 1).trim()
					if (key === "max-age") {
						attrs[key] = parseInt(val, 10)
					} else {
						attrs[key] = val
					}
				} else {
					attrs[attr.toLowerCase()] = true
				}
			}

			// Handle cookie deletion (Max-Age=0 or Expires in the past)
			const maxAge = attrs["max-age"] as number | undefined
			if (maxAge !== undefined && maxAge <= 0) {
				cookieStore.delete(name)
				continue
			}

			// Set cookie with appropriate options
			let expires: Date | undefined
			if (attrs.expires) {
				expires = new Date(attrs.expires as string)
			} else if (maxAge !== undefined) {
				expires = new Date(Date.now() + maxAge * MILLISECONDS_PER_SECOND)
			}

			// Check if expires is in the past (cookie should be deleted)
			if (expires && expires.getTime() < Date.now()) {
				cookieStore.delete(name)
				continue
			}

			const cookieOptions: {
				path?: string
				httpOnly?: boolean
				secure?: boolean
				sameSite?: "strict" | "lax" | "none"
				maxAge?: number
				expires?: Date
			} = {
				path: (attrs.path as string) || "/",
			}

			if (attrs.httponly === true) {
				cookieOptions.httpOnly = true
			}
			if (attrs.secure === true) {
				cookieOptions.secure = true
			}
			if (attrs.samesite) {
				cookieOptions.sameSite = (attrs.samesite as string).toLowerCase() as
					| "strict"
					| "lax"
					| "none"
			}
			if (maxAge !== undefined && maxAge > 0) {
				cookieOptions.maxAge = maxAge
			}
			if (expires && expires.getTime() > Date.now()) {
				cookieOptions.expires = expires
			}

			cookieStore.set(name, value, cookieOptions)
		}
	}

	private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.message ?? "An error occurred")
		}

		return response.json()
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

			// Extract and set cookies from Set-Cookie headers BEFORE consuming the response body
			await this.setCookiesFromResponse(response)

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

export async function setAuthCookies(_accessToken: string) {
	// Access token is now set by the backend as a cookie
	// This function is kept for compatibility but does nothing
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
