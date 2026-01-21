import { env } from "@/env"

import { fetchWithAuth } from "./fetchWithAuth"
const API_BASE_URL = env.NEXT_PUBLIC_API_URL

export interface Log {
	_id: string
	timestamp: string
	level: "info" | "warn" | "error" | "debug"
	correlation_id: string
	message: string
	user_id?: string
	meta?: Record<string, unknown>
}

export interface PaginatedLogs {
	logs: Log[]
	totalCount: number
	currentPage: number
	pageSize: number
	totalPages: number
}

export interface LogStatistics {
	totalLogs: number
	levelBreakdown: Array<{
		level: string
		count: number
	}>
}

export interface LogTrend {
	date: string
	totalCount: number
	levels: Array<{
		level: string
		count: number
	}>
}

export interface LogFilters {
	page?: number
	limit?: number
	level?: string
	correlation_id?: string
	userId?: string
	message?: string
	startDate?: string
	endDate?: string
}

class LogsApiClient {
	async getLogs(filters: LogFilters = {}): Promise<PaginatedLogs> {
		const params = new URLSearchParams()

		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				params.append(key, value.toString())
			}
		})

		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/logs?${params.toString()}`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to fetch logs") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getLogsBycorrelation_id(correlation_id: string): Promise<Log[]> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/logs/correlation/${correlation_id}`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to fetch logs") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getLogStatistics(): Promise<LogStatistics> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/logs/statistics`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to fetch statistics") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getRecentErrors(limit = 20): Promise<Log[]> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/logs/errors?limit=${limit}`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to fetch errors") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async getLogTrends(days = 7): Promise<LogTrend[]> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/logs/trends?days=${days}`,
			{ method: "GET" }
		)

		if (!response.ok) {
			const error = new Error("Failed to fetch trends") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}

	async clearOldLogs(days = 30): Promise<{ deletedCount: number }> {
		const response = await fetchWithAuth(
			`${API_BASE_URL}/api/logs/clear?days=${days}`,
			{ method: "DELETE" }
		)

		if (!response.ok) {
			const error = new Error("Failed to clear logs") as Error & {
				status: number
			}
			error.status = response.status
			throw error
		}

		const result = await response.json()
		return result.data
	}
}

export const logsApiClient = new LogsApiClient()
