"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
	bookmarkKeys,
	useDeleteBookmark,
	useJobStatus,
	useRegenerateTags,
	useRetryJob,
} from "@/hooks/useBookmarks"
import { Bookmark } from "@/lib/bookmarks-api"

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
	const [showConfirm, setShowConfirm] = useState(false)
	const [currentJobId, setCurrentJobId] = useState<string | null>(null)
	const [hasCheckedActiveJob, setHasCheckedActiveJob] = useState(false)
	const queryClient = useQueryClient()
	const deleteBookmark = useDeleteBookmark()
	const regenerateTags = useRegenerateTags()
	const retryJob = useRetryJob()
	const jobStatus = useJobStatus(currentJobId, !!currentJobId)

	useEffect(() => {
		if (!hasCheckedActiveJob && !currentJobId) {
			const checkActiveJob = async () => {
				try {
					const { bookmarksApiClient } = await import("@/lib/bookmarks-api")
					const activeJob = await bookmarksApiClient.getActiveJobForBookmark(
						bookmark._id
					)
					if (
						activeJob &&
						(activeJob.state === "waiting" || activeJob.state === "active")
					) {
						setCurrentJobId(activeJob.jobId)
					}
				} catch (error) {
					console.error("Failed to check active job:", error)
				} finally {
					setHasCheckedActiveJob(true)
				}
			}
			checkActiveJob()
		}
	}, [bookmark._id, hasCheckedActiveJob, currentJobId])

	useEffect(() => {
		if (jobStatus.data?.state === "completed") {
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() })
			queryClient.invalidateQueries({
				queryKey: bookmarkKeys.detail(bookmark._id),
			})
			queryClient.invalidateQueries({ queryKey: bookmarkKeys.tags() })

			const timer = setTimeout(() => {
				setCurrentJobId(null)
				regenerateTags.reset()
			}, 2000)

			return () => clearTimeout(timer)
		}

		if (jobStatus.data?.state === "failed" && !jobStatus.data.canRetry) {
			const timer = setTimeout(() => {
				setCurrentJobId(null)
				regenerateTags.reset()
			}, 5000)

			return () => clearTimeout(timer)
		}
	}, [
		jobStatus.data?.state,
		jobStatus.data?.canRetry,
		bookmark._id,
		queryClient,
		regenerateTags,
	])

	const handleDelete = () => {
		deleteBookmark.mutate(bookmark._id)
		setShowConfirm(false)
	}

	const handleRegenerateTags = () => {
		if (
			currentJobId &&
			jobStatus.data?.state === "failed" &&
			jobStatus.data.canRetry
		) {
			retryJob.mutate(currentJobId, {
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["bookmark-job", currentJobId],
					})
				},
			})
		} else {
			regenerateTags.mutate(bookmark._id, {
				onSuccess: (data) => {
					if (data?.jobId) {
						setCurrentJobId(data.jobId)
					}
				},
			})
		}
	}

	const getStatusBadge = () => {
		if (!currentJobId) return null

		if (jobStatus.isLoading) {
			return (
				<Badge
					variant="outline"
					className="bg-gray-50 text-gray-700 border-gray-200"
				>
					⏳ Checking status...
				</Badge>
			)
		}

		if (jobStatus.error || !jobStatus.data) {
			return (
				<Badge
					variant="outline"
					className="bg-red-50 text-red-700 border-red-200"
				>
					❌ Status unavailable
				</Badge>
			)
		}

		const state = jobStatus.data.state

		if (state === "waiting") {
			return (
				<Badge
					variant="outline"
					className="bg-blue-50 text-blue-700 border-blue-200"
				>
					⏳ Queued
				</Badge>
			)
		}

		if (state === "active") {
			return (
				<Badge
					variant="outline"
					className="bg-yellow-50 text-yellow-700 border-yellow-200"
				>
					⚡ Processing...
				</Badge>
			)
		}

		if (state === "completed") {
			return (
				<Badge
					variant="outline"
					className="bg-green-50 text-green-700 border-green-200"
				>
					✅ Completed
				</Badge>
			)
		}

		if (state === "failed") {
			return (
				<Badge
					variant="outline"
					className="bg-red-50 text-red-700 border-red-200"
				>
					❌ Failed{" "}
					{jobStatus.data.attemptsMade > 0
						? `(Attempt ${jobStatus.data.attemptsMade}/${jobStatus.data.maxAttempts})`
						: ""}
				</Badge>
			)
		}

		if (state === "delayed") {
			return (
				<Badge
					variant="outline"
					className="bg-purple-50 text-purple-700 border-purple-200"
				>
					⏰ Delayed
				</Badge>
			)
		}

		return null
	}

	const getButtonText = () => {
		if (regenerateTags.isPending) return "Starting..."
		if (retryJob.isPending) return "Retrying..."

		if (!currentJobId) return "🔄 Regenerate Tags"

		if (jobStatus.isLoading) return "Checking..."

		if (jobStatus.error || !jobStatus.data) return "Status Error"

		const state = jobStatus.data.state

		if (state === "waiting") return "⏳ Queued"
		if (state === "active") return "⚡ Processing..."
		if (state === "completed") return "🔄 Regenerate Tags"
		if (state === "failed")
			return jobStatus.data.canRetry ? "🔄 Retry" : "🔄 Regenerate Tags"
		if (state === "delayed") return "⏰ Delayed"

		return "🔄 Regenerate Tags"
	}

	const isButtonDisabled = () => {
		if (regenerateTags.isPending || retryJob.isPending) return true

		if (!currentJobId) return false

		if (jobStatus.isLoading) return true

		if (!jobStatus.data) return false

		const state = jobStatus.data.state
		if (state === "failed" && jobStatus.data.canRetry) return false
		return state === "waiting" || state === "active" || state === "delayed"
	}

	return (
		<Card className="p-4">
			<div className="space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<a
							href={bookmark.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-lg font-semibold hover:text-blue-600 transition-colors"
						>
							{bookmark.title}
						</a>
						<p className="text-sm text-gray-500 mt-1 truncate">
							{bookmark.url}
						</p>
					</div>
				</div>

				{bookmark.description && (
					<p className="text-sm text-gray-600">{bookmark.description}</p>
				)}

				<div className="flex flex-wrap gap-2 items-center">
					{bookmark.tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
					{bookmark.aiGenerated && (
						<Badge variant="outline" className="text-xs">
							AI
						</Badge>
					)}
					{getStatusBadge()}
				</div>

				<div className="flex items-center justify-between pt-2 border-t">
					<span className="text-xs text-gray-400">
						{new Date(bookmark.createdAt).toLocaleDateString()}
					</span>

					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRegenerateTags}
							disabled={isButtonDisabled()}
						>
							{getButtonText()}
						</Button>

						{!showConfirm ? (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowConfirm(true)}
								className="text-red-500 hover:text-red-700"
							>
								Delete
							</Button>
						) : (
							<div className="flex gap-1">
								<Button
									variant="destructive"
									size="sm"
									onClick={handleDelete}
									disabled={deleteBookmark.isPending}
								>
									{deleteBookmark.isPending ? "Deleting..." : "Confirm"}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowConfirm(false)}
								>
									Cancel
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</Card>
	)
}
