import { env } from "@/env"
import { fetchWithAuth } from "./fetchWithAuth"

const API_BASE_URL = env.NEXT_PUBLIC_API_URL

export interface ApiResponse<T = unknown> {
	success: boolean
	message: string
	data?: T
}

export interface AuthTokens {
	accessToken: string
}

export interface User {
	id: string
	email: string
	firstName: string
	lastName: string
	isEmailVerified: boolean
	createdAt?: string
	updatedAt?: string
}

class ApiClient {
	private baseURL: string

	constructor(baseURL: string) {
		this.baseURL = baseURL
	}

	private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
		if (!response.ok) {
			const error = await response.json()
			const errorWithStatus = new Error(
				error.message || "An error occurred"
			) as Error & { status: number }
			errorWithStatus.status = response.status
			throw errorWithStatus
		}

		return response.json()
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseURL}${endpoint}`
		const response = await fetchWithAuth(url, options)
		return this.handleResponse<T>(response)
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

	async login(
		email: string,
		password: string
	): Promise<
		ApiResponse<
			| { user: User; tokens: AuthTokens }
			| { requiresVerification: true; email: string }
		>
	> {
		return this.request("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		})
	}

	async logout(): Promise<ApiResponse> {
		return this.request("/api/auth/logout", {
			method: "POST",
			body: JSON.stringify({}),
		})
	}

	async logoutAll(): Promise<ApiResponse> {
		return this.request("/api/auth/logout-all", {
			method: "POST",
		})
	}

	async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
		return this.request("/api/auth/refresh", {
			method: "POST",
			body: JSON.stringify({}),
		})
	}

	async getProfile(): Promise<ApiResponse<{ user: User }>> {
		return this.request("/api/auth/me", {
			method: "GET",
		})
	}

	async sendVerificationOTP(): Promise<ApiResponse> {
		return this.request("/api/auth/send-verification-otp", {
			method: "POST",
		})
	}

	async verifyEmail(otp: string): Promise<ApiResponse> {
		return this.request("/api/auth/verify-email", {
			method: "POST",
			body: JSON.stringify({ otp }),
		})
	}

	async verifyEmailAndLogin(
		email: string,
		otp: string
	): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
		return this.request("/api/auth/verify-email-login", {
			method: "POST",
			body: JSON.stringify({ email, otp }),
		})
	}
}

export const apiClient = new ApiClient(API_BASE_URL)
