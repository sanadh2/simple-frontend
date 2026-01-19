"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDeleteBookmark } from "@/hooks/useBookmarks"
import { Bookmark } from "@/lib/bookmarks-api"

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
	const [showConfirm, setShowConfirm] = useState(false)
	const deleteBookmark = useDeleteBookmark()

	const handleDelete = () => {
		deleteBookmark.mutate(bookmark._id)
		setShowConfirm(false)
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
				</div>

				<div className="flex items-center justify-between pt-2 border-t">
					<span className="text-xs text-gray-400">
						{new Date(bookmark.createdAt).toLocaleDateString()}
					</span>

					<div className="flex gap-2">
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
