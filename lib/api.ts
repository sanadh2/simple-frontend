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
	timezone?: string | null
	reminder_time?: string | null
	createdAt?: string
	updatedAt?: string
}

export type JobStatus =
	| "All"
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

export type InterviewType =
	| "phone_screen"
	| "technical"
	| "behavioral"
	| "system_design"
	| "hr"
	| "final"

export type InterviewFormat = "phone" | "video" | "in_person"

export interface StatusHistory {
	status: JobStatus
	changed_at: string
}

export interface Interview {
	_id: string
	job_application_id: string
	interview_type: InterviewType
	scheduled_at: string
	interviewer_name?: string
	interviewer_role?: string
	interview_format: InterviewFormat
	duration_minutes?: number
	notes?: string
	feedback?: string
	interview_reminder_sent_at?: string
	preparation_checklist?: string[]
	createdAt: string
	updatedAt: string
}

export interface CreateInterviewInput {
	job_application_id: string
	interview_type: InterviewType
	scheduled_at: string | Date
	interviewer_name?: string
	interviewer_role?: string
	interview_format: InterviewFormat
	duration_minutes?: number
	notes?: string
	feedback?: string
	preparation_checklist?: string[]
}

export type UpdateInterviewInput = Partial<CreateInterviewInput>

// Application Contact (recruiter/contact tracking)
export interface Interaction {
	date: string
	type?: string
	notes?: string
}

export interface ApplicationContact {
	_id: string
	job_application_id: string
	name: string
	role?: string
	email?: string
	phone?: string
	linkedin_url?: string
	last_contacted_at?: string
	follow_up_reminder_at?: string
	follow_up_reminder_sent_at?: string
	interaction_history: Interaction[]
	createdAt: string
	updatedAt: string
}

export interface CreateContactInput {
	job_application_id: string
	name: string
	role?: string
	email?: string
	phone?: string
	linkedin_url?: string
	last_contacted_at?: string | Date
	follow_up_reminder_at?: string | Date
}

export type UpdateContactInput = Partial<CreateContactInput>

export interface AddInteractionInput {
	date?: string | Date
	type?: string
	notes?: string
}

export type CompanySize =
	| "startup"
	| "small"
	| "medium"
	| "large"
	| "enterprise"
	| ""

export type FundingStage =
	| "bootstrapped"
	| "seed"
	| "series-a"
	| "series-b"
	| "series-c"
	| "series-d"
	| "ipo"
	| "acquired"
	| "unknown"
	| ""

export interface Company {
	_id: string
	user_id: string
	name: string
	size?: CompanySize
	industry?: string
	funding_stage?: FundingStage
	glassdoor_url?: string
	culture_notes?: string
	pros: string[]
	cons: string[]
	interview_process_overview?: string
	application_count?: number
	applications?: Array<{
		_id: string
		job_title: string
		status: string
		application_date: string
	}>
	createdAt: string
	updatedAt: string
}

export interface CreateCompanyInput {
	name: string
	size?: CompanySize
	industry?: string
	funding_stage?: FundingStage
	glassdoor_url?: string
	culture_notes?: string
	pros?: string[]
	cons?: string[]
	interview_process_overview?: string
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>

export interface PaginatedCompanies {
	companies: Company[]
	totalCount: number
	currentPage: number
	pageSize: number
	totalPages: number
}

export interface JobApplication {
	_id: string
	user_id: string
	company_id?: string
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
	resume_id?: string
	resume_url?: string
	cover_letter_url?: string
	createdAt: string
	updatedAt: string
}

export type ActivityType =
	| "application_submitted"
	| "status_change"
	| "interview_completed"
	| "follow_up_sent"

export interface TimelineActivity {
	type: ActivityType
	date: string
	description: string
	job_application_id: string
	company_name: string
	job_title: string
	meta?: {
		status?: string
		interview_type?: string
		contact_name?: string
	}
}

export interface CreateJobApplicationInput {
	company_id?: string
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
	resume_id?: string
	resume_url?: string
	cover_letter_url?: string
}

export type UpdateJobApplicationInput = Partial<CreateJobApplicationInput>

export interface Resume {
	_id: string
	user_id: string
	version: number
	description?: string
	file_url: string
	file_name?: string
	file_size?: number
	application_count?: number
	createdAt: string
	updatedAt: string
}

export interface CreateResumeInput {
	description?: string
	file_name?: string
	file_size?: number
}

export interface UpdateResumeInput {
	description?: string
}

export interface ResumeApplication {
	_id: string
	company_name: string
	job_title: string
}

export interface PaginatedJobApplications {
	applications: JobApplication[]
	totalCount: number
	currentPage: number
	pageSize: number
	totalPages: number
}
export interface ApplicationFunnel {
	applied: number
	interview: number
	offer: number
}

export interface DashboardAnalytics {
	funnel: ApplicationFunnel
	responseRate: number
	interviewConversionRate: number
	avgTimeToHearBackDays: number | null
	avgTimeBetweenInterviewRoundsDays: number | null
	successByApplicationMethod: Array<{
		method: string
		total: number
		success: number
		rate: number
	}>
	bestDaysToApply: Array<{
		day: string
		applications: number
		responseCount: number
		responseRate: number
	}>
	bestHoursToApply: Array<{
		hour: number
		label: string
		applications: number
		responseCount: number
		responseRate: number
	}>
	salaryRange: {
		min: number | null
		max: number | null
		median: number | null
		sampleCount: number
		currency: string
		periodLabel: "annual" | "monthly" | "hourly" | "mixed"
		byPeriod: { annual: number; monthly: number; hourly: number }
		distribution: Array<{ range: string; count: number }>
	}
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
		timezone?: string | null
		reminderTime?: string | null
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

	private buildQueryParams(params?: {
		page?: number
		limit?: number
		status?: JobStatus
		priority?: PriorityLevel
		company_name?: string
		search?: string
		startDate?: string
		endDate?: string
		sortBy?: string
		sortOrder?: "asc" | "desc"
	}): URLSearchParams {
		const queryParams = new URLSearchParams()
		if (!params) {
			return queryParams
		}

		const paramMap: Record<string, string | undefined> = {
			page: params.page?.toString(),
			limit: params.limit?.toString(),
			status: params.status,
			priority: params.priority,
			company_name: params.company_name,
			search: params.search,
			startDate: params.startDate,
			endDate: params.endDate,
			sortBy: params.sortBy,
			sortOrder: params.sortOrder,
		}

		for (const [key, value] of Object.entries(paramMap)) {
			if (value) {
				queryParams.append(key, value)
			}
		}

		return queryParams
	}

	async getJobApplications(params?: {
		page?: number
		limit?: number
		status?: JobStatus
		priority?: PriorityLevel
		company_name?: string
		search?: string
		startDate?: string
		endDate?: string
		sortBy?: string
		sortOrder?: "asc" | "desc"
	}): Promise<ApiResponse<PaginatedJobApplications>> {
		const queryParams = this.buildQueryParams(params)
		if (queryParams.get("status") === "All") {
			queryParams.delete("status")
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

	async getActivityTimeline(params?: {
		startDate?: string
		endDate?: string
	}): Promise<ApiResponse<TimelineActivity[]>> {
		const queryParams = new URLSearchParams()
		if (params?.startDate) {
			queryParams.append("startDate", params.startDate)
		}
		if (params?.endDate) {
			queryParams.append("endDate", params.endDate)
		}
		const queryString = queryParams.toString()
		const endpoint = `/api/activity/timeline${queryString ? `?${queryString}` : ""}`
		return this.request(endpoint, { method: "GET" })
	}

	async getDashboardAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
		return this.request("/api/analytics/dashboard", { method: "GET" })
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

	async createInterview(
		data: CreateInterviewInput
	): Promise<ApiResponse<Interview>> {
		return this.request("/api/interviews", {
			method: "POST",
			body: JSON.stringify(data),
		})
	}

	async getInterviews(): Promise<ApiResponse<Interview[]>> {
		return this.request("/api/interviews", {
			method: "GET",
		})
	}

	async getInterviewById(id: string): Promise<ApiResponse<Interview>> {
		return this.request(`/api/interviews/${id}`, {
			method: "GET",
		})
	}

	async getInterviewsByJobApplicationId(
		jobApplicationId: string
	): Promise<ApiResponse<Interview[]>> {
		return this.request(`/api/interviews/job-application/${jobApplicationId}`, {
			method: "GET",
		})
	}

	async getUpcomingInterviews(
		days?: number
	): Promise<ApiResponse<Interview[]>> {
		const queryParams = new URLSearchParams()
		if (days) {
			queryParams.append("days", days.toString())
		}
		const queryString = queryParams.toString()
		const endpoint = `/api/interviews/upcoming${queryString ? `?${queryString}` : ""}`

		return this.request(endpoint, {
			method: "GET",
		})
	}

	async updateInterview(
		id: string,
		data: UpdateInterviewInput
	): Promise<ApiResponse<Interview>> {
		return this.request(`/api/interviews/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		})
	}

	async deleteInterview(id: string): Promise<ApiResponse> {
		return this.request(`/api/interviews/${id}`, {
			method: "DELETE",
		})
	}

	// Application Contacts (recruiters/contacts per application)
	async createContact(
		data: CreateContactInput
	): Promise<ApiResponse<ApplicationContact>> {
		return this.request("/api/contacts", {
			method: "POST",
			body: JSON.stringify(data),
		})
	}

	async getContactsByJobApplicationId(
		jobApplicationId: string
	): Promise<ApiResponse<ApplicationContact[]>> {
		return this.request(`/api/contacts/job-application/${jobApplicationId}`, {
			method: "GET",
		})
	}

	async getContactById(id: string): Promise<ApiResponse<ApplicationContact>> {
		return this.request(`/api/contacts/${id}`, { method: "GET" })
	}

	async updateContact(
		id: string,
		data: UpdateContactInput
	): Promise<ApiResponse<ApplicationContact>> {
		return this.request(`/api/contacts/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		})
	}

	async deleteContact(id: string): Promise<ApiResponse> {
		return this.request(`/api/contacts/${id}`, { method: "DELETE" })
	}

	async addContactInteraction(
		id: string,
		data: AddInteractionInput
	): Promise<ApiResponse<ApplicationContact>> {
		return this.request(`/api/contacts/${id}/interactions`, {
			method: "POST",
			body: JSON.stringify(data),
		})
	}

	async createCompany(data: CreateCompanyInput): Promise<ApiResponse<Company>> {
		return this.request("/api/companies", {
			method: "POST",
			body: JSON.stringify(data),
		})
	}

	async getCompanies(params?: {
		page?: number
		limit?: number
		search?: string
		size?: CompanySize
		industry?: string
		funding_stage?: FundingStage
		sortBy?: string
		sortOrder?: "asc" | "desc"
	}): Promise<ApiResponse<PaginatedCompanies>> {
		const queryParams = new URLSearchParams()
		if (params) {
			if (params.page) {
				queryParams.append("page", params.page.toString())
			}
			if (params.limit) {
				queryParams.append("limit", params.limit.toString())
			}
			if (params.search) {
				queryParams.append("search", params.search)
			}
			if (params.size) {
				queryParams.append("size", params.size)
			}
			if (params.industry) {
				queryParams.append("industry", params.industry)
			}
			if (params.funding_stage) {
				queryParams.append("funding_stage", params.funding_stage)
			}
			if (params.sortBy) {
				queryParams.append("sortBy", params.sortBy)
			}
			if (params.sortOrder) {
				queryParams.append("sortOrder", params.sortOrder)
			}
		}
		const queryString = queryParams.toString()
		const endpoint = `/api/companies${queryString ? `?${queryString}` : ""}`

		return this.request(endpoint, {
			method: "GET",
		})
	}

	async getCompanyById(
		id: string,
		includeApplications?: boolean
	): Promise<ApiResponse<Company>> {
		const queryParams = new URLSearchParams()
		if (includeApplications) {
			queryParams.append("includeApplications", "true")
		}
		const queryString = queryParams.toString()
		const endpoint = `/api/companies/${id}${queryString ? `?${queryString}` : ""}`

		return this.request(endpoint, {
			method: "GET",
		})
	}

	async updateCompany(
		id: string,
		data: UpdateCompanyInput
	): Promise<ApiResponse<Company>> {
		return this.request(`/api/companies/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		})
	}

	async deleteCompany(id: string): Promise<ApiResponse> {
		return this.request(`/api/companies/${id}`, {
			method: "DELETE",
		})
	}

	// Resume Management APIs
	async createResume(
		file: File,
		data?: CreateResumeInput
	): Promise<ApiResponse<Resume>> {
		const formData = new FormData()
		formData.append("file", file)
		if (data?.description) {
			formData.append("description", data.description)
		}
		if (data?.file_name) {
			formData.append("file_name", data.file_name)
		}
		if (data?.file_size) {
			formData.append("file_size", data.file_size.toString())
		}

		return this.request("/api/resumes", {
			method: "POST",
			body: formData,
		})
	}

	async getResumes(): Promise<ApiResponse<Resume[]>> {
		return this.request("/api/resumes", {
			method: "GET",
		})
	}

	async getResumeById(id: string): Promise<ApiResponse<Resume>> {
		return this.request(`/api/resumes/${id}`, {
			method: "GET",
		})
	}

	async updateResume(
		id: string,
		data: UpdateResumeInput
	): Promise<ApiResponse<Resume>> {
		return this.request(`/api/resumes/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		})
	}

	async deleteResume(id: string): Promise<ApiResponse> {
		return this.request(`/api/resumes/${id}`, {
			method: "DELETE",
		})
	}

	async getResumeApplications(
		id: string
	): Promise<ApiResponse<ResumeApplication[]>> {
		return this.request(`/api/resumes/${id}/applications`, {
			method: "GET",
		})
	}

	async getResumeDownloadUrl(
		id: string
	): Promise<ApiResponse<{ url: string; file_name?: string }>> {
		return this.request(`/api/resumes/${id}/download`, {
			method: "GET",
		})
	}
}

export const apiClient = new ApiClient(API_BASE_URL)
