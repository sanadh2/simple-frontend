import "server-only"

import { cookies } from "next/headers"

import { ApiResponse, AuthTokens, User } from "@/lib/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

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
			headers["Authorization"] = `Bearer ${accessToken}`
		}

		return headers
	}

	private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.message || "An error occurred")
		}

		return response.json()
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseURL}${endpoint}`
		const headers = await this.getAuthHeaders()

		const config: RequestInit = {
			...options,
			headers: {
				...headers,
				...options.headers,
			},
			credentials: "include",
			cache: "no-store",
		}

		try {
			const response = await fetch(url, config)
			return this.handleResponse<T>(response)
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
		firstName: string,
		lastName: string
	): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
		return this.request("/api/auth/register", {
			method: "POST",
			body: JSON.stringify({ email, password, firstName, lastName }),
		})
	}

	async logout(): Promise<ApiResponse> {
		const cookieStore = await cookies()
		const refreshToken = cookieStore.get("refreshToken")?.value

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

export async function setAuthCookies(accessToken: string) {
	const cookieStore = await cookies()

	cookieStore.set("accessToken", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 15 * 60,
		path: "/",
	})
}

export async function clearAuthCookies() {
	const cookieStore = await cookies()
	cookieStore.delete("accessToken")
}

export async function getAccessToken(): Promise<string | null> {
	const cookieStore = await cookies()
	return cookieStore.get("accessToken")?.value || null
}

export async function getRefreshToken(): Promise<string | null> {
	const cookieStore = await cookies()
	return cookieStore.get("refreshToken")?.value || null
}
