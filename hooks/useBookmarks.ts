"use client"

import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query"

import {
	type BookmarkFilters,
	bookmarksApiClient,
	type CreateBookmarkDTO,
	type UpdateBookmarkDTO,
	type Bookmark,
	type BookmarksResponse,
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
		onMutate: async (newBookmark) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() })

			// Snapshot previous values for rollback
			const previousQueries = queryClient.getQueriesData({
				queryKey: bookmarkKeys.lists(),
			})

			// Optimistically create a temporary bookmark
			const tempBookmark: Bookmark = {
				_id: `temp-${Date.now()}`,
				userId: "",
				url: newBookmark.url,
				title: newBookmark.title,
				description: newBookmark.description,
				tags: newBookmark.tags || [],
				aiGenerated: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			// Optimistically update all list queries
			queryClient.setQueriesData<BookmarksResponse>(
				{ queryKey: bookmarkKeys.lists() },
				(old) => {
					if (!old) return old
					return {
						...old,
						bookmarks: [tempBookmark, ...old.bookmarks],
						totalCount: old.totalCount + 1,
					}
				}
			)

			// Update tags if new tags are added
			if (newBookmark.tags && newBookmark.tags.length > 0) {
				queryClient.setQueryData<string[]>(bookmarkKeys.tags(), (old) => {
					if (!old) return newBookmark.tags || []
					const newTags = newBookmark.tags || []
					const existingTags = new Set(old)
					newTags.forEach((tag) => existingTags.add(tag))
					return Array.from(existingTags).sort()
				})
			}

			return { previousQueries }
		},
		onError: (_error, _variables, context) => {
			// Rollback on error
			if (context?.previousQueries) {
				context.previousQueries.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data)
				})
			}
		},
		onSuccess: (data) => {
			// Replace temp bookmark with real one from server
			queryClient.setQueriesData<BookmarksResponse>(
				{ queryKey: bookmarkKeys.lists() },
				(old) => {
					if (!old) return old
					return {
						...old,
						bookmarks: old.bookmarks.map((b) =>
							b._id.startsWith("temp-") ? data.bookmark : b
						),
					}
				}
			)

			// Update tags with server response
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
		},
		onSettled: () => {
			// Refetch to ensure consistency (optional, can be removed for better performance)
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
		},
	})
}

export function useUpdateBookmark() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateBookmarkDTO }) =>
			bookmarksApiClient.updateBookmark(id, data),
		onMutate: async ({ id, data }) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() })
			await queryClient.cancelQueries({ queryKey: bookmarkKeys.detail(id) })

			// Snapshot previous values
			const previousQueries = queryClient.getQueriesData({
				queryKey: bookmarkKeys.lists(),
			})
			const previousDetail = queryClient.getQueryData<Bookmark>(
				bookmarkKeys.detail(id)
			)

			// Optimistically update list queries
			queryClient.setQueriesData<BookmarksResponse>(
				{ queryKey: bookmarkKeys.lists() },
				(old) => {
					if (!old) return old
					return {
						...old,
						bookmarks: old.bookmarks.map((bookmark) =>
							bookmark._id === id
								? { ...bookmark, ...data, updatedAt: new Date().toISOString() }
								: bookmark
						),
					}
				}
			)

			// Optimistically update detail query
			if (previousDetail) {
				queryClient.setQueryData<Bookmark>(bookmarkKeys.detail(id), {
					...previousDetail,
					...data,
					updatedAt: new Date().toISOString(),
				})
			}

			// Update tags if tags changed
			if (data.tags) {
				queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
			}

			return { previousQueries, previousDetail }
		},
		onError: (_error, variables, context) => {
			// Rollback on error
			if (context?.previousQueries) {
				context.previousQueries.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data)
				})
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(
					bookmarkKeys.detail(variables.id),
					context.previousDetail
				)
			}
		},
		onSuccess: (updatedBookmark, variables) => {
			// Update with real data from server
			queryClient.setQueriesData<BookmarksResponse>(
				{ queryKey: bookmarkKeys.lists() },
				(old) => {
					if (!old) return old
					return {
						...old,
						bookmarks: old.bookmarks.map((bookmark) =>
							bookmark._id === variables.id ? updatedBookmark : bookmark
						),
					}
				}
			)

			// Update detail query
			queryClient.setQueryData(
				bookmarkKeys.detail(variables.id),
				updatedBookmark
			)

			// Update tags if they changed
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
		},
	})
}

export function useDeleteBookmark() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => bookmarksApiClient.deleteBookmark(id),
		onMutate: async (id) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: bookmarkKeys.lists() })
			await queryClient.cancelQueries({ queryKey: bookmarkKeys.detail(id) })

			// Snapshot previous values
			const previousQueries = queryClient.getQueriesData({
				queryKey: bookmarkKeys.lists(),
			})
			const previousDetail = queryClient.getQueryData<Bookmark>(
				bookmarkKeys.detail(id)
			)

			// Optimistically remove from list queries
			queryClient.setQueriesData<BookmarksResponse>(
				{ queryKey: bookmarkKeys.lists() },
				(old) => {
					if (!old) return old
					return {
						...old,
						bookmarks: old.bookmarks.filter((bookmark) => bookmark._id !== id),
						totalCount: Math.max(0, old.totalCount - 1),
					}
				}
			)

			// Remove detail query
			queryClient.removeQueries({ queryKey: bookmarkKeys.detail(id) })

			// Update tags (invalidate to refetch, as we don't know which tags to remove)
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })

			return { previousQueries, previousDetail }
		},
		onError: (_error, id, context) => {
			// Rollback on error
			if (context?.previousQueries) {
				context.previousQueries.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data)
				})
			}
			if (context?.previousDetail) {
				queryClient.setQueryData(bookmarkKeys.detail(id), context.previousDetail)
			}
		},
		onSuccess: () => {
			// Ensure tags are up to date
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })
		},
	})
}

