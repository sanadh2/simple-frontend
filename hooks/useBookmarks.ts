"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
	type BookmarkFilters,
	bookmarksApiClient,
	type CreateBookmarkDTO,
	type UpdateBookmarkDTO,
} from "@/lib/bookmarks-api"

export const bookmarkKeys = {
	all: ["bookmarks"] as const,
	lists: () => [...bookmarkKeys.all, "list"] as const,
	list: (filters: BookmarkFilters) =>
		[...bookmarkKeys.lists(), filters] as const,
	detail: (id: string) => [...bookmarkKeys.all, "detail", id] as const,
	tags: () => [...bookmarkKeys.all, "tags"] as const,
}

export function useBookmarks(filters: BookmarkFilters = {}) {
	return useQuery({
		queryKey: bookmarkKeys.list(filters),
		queryFn: () => bookmarksApiClient.getBookmarks(filters),
		staleTime: 1000 * 30,
	})
}

export function useBookmark(id: string) {
	return useQuery({
		queryKey: bookmarkKeys.detail(id),
		queryFn: () => bookmarksApiClient.getBookmarkById(id),
		enabled: !!id,
	})
}

export function useTags() {
	return useQuery({
		queryKey: bookmarkKeys.tags(),
		queryFn: () => bookmarksApiClient.getAllTags(),
		staleTime: 1000 * 60 * 5,
	})
}

export function useCreateBookmark() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateBookmarkDTO) =>
			bookmarksApiClient.createBookmark(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
		},
	})
}

export function useUpdateBookmark() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBookmarkDTO }) =>
			bookmarksApiClient.updateBookmark(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
			queryClient.invalidateQueries({
				queryKey: bookmarkKeys.detail(variables.id),
			})
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
		},
	})
}

export function useDeleteBookmark() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => bookmarksApiClient.deleteBookmark(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
		},
	})
}

export function useRegenerateTags() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => bookmarksApiClient.regenerateTags(id),
		onSuccess: (data, id) => {
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.detail(id) })
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
			return data
		},
	})
}

export function useJobStatus(jobId: string | null, enabled: boolean = true) {
	return useQuery({
		queryKey: ["bookmark-job", jobId],
		queryFn: () => {
			if (!jobId) throw new Error("Job ID is required")
			return bookmarksApiClient.getJobStatus(jobId)
		},
		enabled: enabled && !!jobId,
		refetchInterval: (query) => {
			const data = query.state.data
			if (
				data?.state === "completed" ||
				(data?.state === "failed" && !data?.canRetry)
			) {
				return false
			}
			return 2000
		},
	})
}

export function useRetryJob() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (jobId: string) => bookmarksApiClient.retryJob(jobId),
		onSuccess: (_, jobId) => {
			queryClient.invalidateQueries({ queryKey: ["bookmark-job", jobId] })
		},
	})
}
