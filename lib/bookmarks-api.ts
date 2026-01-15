import { fetchWithAuth } from "./fetchWithAuth"
import { env } from "@/env"
const API_BASE_URL = env.NEXT_PUBLIC_API_URL

export interface Bookmark {
	_id: string
	userId: string
	url: string
	title: string
	description?: string
	tags: string[]
	aiGenerated: boolean
	favicon?: string
	createdAt: string
	updatedAt: string
}

export interface BookmarksResponse {
	bookmarks: Bookmark[]
	totalCount: number
	hasMore: boolean
}

export interface CreateBookmarkDTO {
	url: string
	title: string
	description?: string
	tags?: string[]
	useAI?: boolean
}

export interface UpdateBookmarkDTO {
	title?: string
	description?: string
	tags?: string[]
}

export interface BookmarkFilters {
	tag?: string
	search?: string
	limit?: number
	skip?: number
}

class BookmarksApiClient {
	async createBookmark(data: CreateBookmarkDTO): Promise<Bookmark> {
		const response = await fetchWithAuth(`${API_BASE_URL}/api/bookmarks`, {
			method: "POST",
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			const error = new Error("Failed to create bookmark") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getBookmarks(
		filters: BookmarkFilters = {}
	): Promise<BookmarksResponse> {
		const params = new URLSearchParams()

		if (filters.tag) params.append("tag", filters.tag)
		if (filters.search) params.append("search", filters.search)
		if (filters.limit) params.append("limit", filters.limit.toString())
		if (filters.skip) params.append("skip", filters.skip.toString())

		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks?${params.toString()}`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to fetch bookmarks") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getBookmarkById(id: string): Promise<Bookmark> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks/${id}`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to fetch bookmark") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async updateBookmark(id: string, data: UpdateBookmarkDTO): Promise<Bookmark> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks/${id}`,
			{
				method: "PUT",
				body: JSON.stringify(data),
			}
		)

		if (!response.ok) {
			const error = new Error("Failed to update bookmark") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async deleteBookmark(id: string): Promise<void> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks/${id}`,
			{
				method: "DELETE",
			}
		)

		if (!response.ok) {
			const error = new Error("Failed to delete bookmark") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}
	}

	async getAllTags(): Promise<string[]> {
		const response = await fetchWithAuth(`${API_BASE_URL}/api/bookmarks/tags`, {
			method: "GET",
		})

		if (!response.ok) {
			const error = new Error("Failed to fetch tags") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async regenerateTags(
		id: string
	): Promise<{ jobId: string; bookmark: Bookmark; status: string }> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks/${id}/regenerate-tags`,
			{ method: "POST" }
		)

		if (!response.ok) {
			const error = new Error("Failed to regenerate tags") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getJobStatus(jobId: string): Promise<{
		jobId: string
		state: string
		progress: number
		result: {
			bookmarkId?: string
			tags?: string[]
			summary?: string
			attempts?: number
		} | null
		failedReason: string | null
		attemptsMade: number
		maxAttempts: number
		remainingAttempts: number
		isRetryable: boolean | undefined
		canRetry: boolean
	}> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks/jobs/${jobId}`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to get job status") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async retryJob(jobId: string): Promise<{
		jobId: string
		state: string
		attemptsMade: number
		maxAttempts: number
	}> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks/jobs/${jobId}/retry`,
			{ method: "POST" }
		)

		if (!response.ok) {
			const error = new Error("Failed to retry job") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getActiveJobForBookmark(bookmarkId: string): Promise<{
		jobId: string
		state: string
		progress: number
		result: {
			bookmarkId?: string
			tags?: string[]
			summary?: string
			attempts?: number
		} | null
		failedReason: string | null
		attemptsMade: number
		maxAttempts: number
		remainingAttempts: number
		isRetryable: boolean | undefined
		canRetry: boolean
	} | null> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/bookmarks/${bookmarkId}/jobs/active`,
			{ method: "GET" }
		)

		if (!response.ok) {
			if (response.status === 404) {
				return null
			}
			const error = new Error("Failed to get active job") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}
}

export const bookmarksApiClient = new BookmarksApiClient()
