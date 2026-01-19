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
	async createBookmark(data: CreateBookmarkDTO): Promise<{ bookmark: Bookmark }> {
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
}

export const bookmarksApiClient = new BookmarksApiClient()
