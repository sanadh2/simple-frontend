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
	first_name: string
	last_name: string
	is_email_verified: boolean
	profile_picture?: string
	current_role?: string
	years_of_experience?: number
	createdAt?: string
	updatedAt?: string
}

export type JobStatus =
	| "Wishlist"
	| "Applied"
	| "Interview Scheduled"
	| "Interviewing"
	| "Offer"
	| "Rejected"
	| "Accepted"
	| "Withdrawn"

export type LocationType = "remote" | "hybrid" | "onsite"

export type PriorityLevel = "high" | "medium" | "low"

export interface StatusHistory {
	status: JobStatus
	changed_at: string
}

export interface JobApplication {
	_id: string
	user_id: string
	company_name: string
	job_title: string
	job_description?: string
	notes?: string
	application_date: string
	status: JobStatus
	status_history: StatusHistory[]
	salary_range?: string
	location_type: LocationType
	location_city?: string
	job_posting_url?: string
	application_method?: string
	priority: PriorityLevel
	resume_url?: string
	cover_letter_url?: string
	createdAt: string
	updatedAt: string
}

export interface CreateJobApplicationInput {
	company_name: string
	job_title: string
	job_description?: string
	notes?: string
	application_date: string | Date
	status: JobStatus
	salary_range?: string
	location_type: LocationType
	location_city?: string
	job_posting_url?: string
	application_method?: string
	priority: PriorityLevel
	resume_url?: string
	cover_letter_url?: string
}

export type UpdateJobApplicationInput = Partial<CreateJobApplicationInput>

export interface PaginatedJobApplications {
	applications: JobApplication[]
	totalCount: number
	currentPage: number
	pageSize: number
	totalPages: number
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
				error.message ?? "An error occurred"
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

		// Don't set Content-Type for FormData - browser will set it with boundary
		const isFormData = options.body instanceof FormData
		const headers: Record<string, string> = isFormData
			? { ...(options.headers as Record<string, string>) }
			: {
					"Content-Type": "application/json",
					...(options.headers as Record<string, string>),
				}

		const response = await fetchWithAuth(url, {
			...options,
			headers,
		})
		return this.handleResponse<T>(response)
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

	async login(
		email: string,
		password: string
	): Promise<
		ApiResponse<
			| { user: User; tokens: AuthTokens }
			| { requiresVerification: true; email: string }
		>
	> {
		const response = await this.request<
			| { user: User; tokens: AuthTokens }
			| { requiresVerification: true; email: string }
		>("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		})
		return response
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

	async updateProfile(data: {
		first_name?: string
		last_name?: string
		currentRole?: string | null
		yearsOfExperience?: number | null
	}): Promise<ApiResponse<{ user: User }>> {
		return this.request("/api/auth/update-profile", {
			method: "PUT",
			body: JSON.stringify(data),
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

	async verifyEmailAfterRegistration(
		email: string,
		otp: string
	): Promise<ApiResponse> {
		return this.request("/api/auth/verify-email-registration", {
			method: "POST",
			body: JSON.stringify({ email, otp }),
		})
	}

	async uploadProfilePicture(file: File): Promise<ApiResponse<{ user: User }>> {
		const formData = new FormData()
		formData.append("profilePicture", file)

		const url = `${this.baseURL}/api/auth/upload-profile-picture`
		const response = await fetchWithAuth(url, {
			method: "POST",
			body: formData,
		})

		return this.handleResponse<{ user: User }>(response)
	}

	async requestPasswordReset(email: string): Promise<ApiResponse> {
		return this.request("/api/auth/forgot-password", {
			method: "POST",
			body: JSON.stringify({ email }),
		})
	}

	async resetPassword(
		email: string,
		otp: string,
		newPassword: string
	): Promise<ApiResponse> {
		return this.request("/api/auth/reset-password", {
			method: "POST",
			body: JSON.stringify({ email, otp, newPassword }),
		})
	}

	async createJobApplication(
		data: CreateJobApplicationInput
	): Promise<ApiResponse<JobApplication>> {
		return this.request("/api/job-applications", {
			method: "POST",
			body: JSON.stringify(data),
		})
	}

	async getJobApplications(params?: {
		page?: number
		limit?: number
		status?: JobStatus
		priority?: PriorityLevel
		company_name?: string
		startDate?: string
		endDate?: string
	}): Promise<ApiResponse<PaginatedJobApplications>> {
		const queryParams = new URLSearchParams()
		if (params?.page) {
			queryParams.append("page", params.page.toString())
		}
		if (params?.limit) {
			queryParams.append("limit", params.limit.toString())
		}
		if (params?.status) {
			queryParams.append("status", params.status)
		}
		if (params?.priority) {
			queryParams.append("priority", params.priority)
		}
		if (params?.company_name) {
			queryParams.append("company_name", params.company_name)
		}
		if (params?.startDate) {
			queryParams.append("startDate", params.startDate)
		}
		if (params?.endDate) {
			queryParams.append("endDate", params.endDate)
		}

		const queryString = queryParams.toString()
		const endpoint = `/api/job-applications${queryString ? `?${queryString}` : ""}`

		return this.request(endpoint, {
			method: "GET",
		})
	}

	async getJobApplicationById(
		id: string
	): Promise<ApiResponse<JobApplication>> {
		return this.request(`/api/job-applications/${id}`, {
			method: "GET",
		})
	}

	async updateJobApplication(
		id: string,
		data: UpdateJobApplicationInput
	): Promise<ApiResponse<JobApplication>> {
		return this.request(`/api/job-applications/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		})
	}

	async deleteJobApplication(id: string): Promise<ApiResponse> {
		return this.request(`/api/job-applications/${id}`, {
			method: "DELETE",
		})
	}

	async uploadJobApplicationFile(
		file: File,
		fileType: "resume" | "cover_letter"
	): Promise<ApiResponse<{ url: string; publicId?: string }>> {
		const formData = new FormData()
		formData.append("file", file)
		formData.append("fileType", fileType)

		return this.request("/api/job-applications/upload-file", {
			method: "POST",
			body: formData,
		})
	}
}

export const apiClient = new ApiClient(API_BASE_URL)
