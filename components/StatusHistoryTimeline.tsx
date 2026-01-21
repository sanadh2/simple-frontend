"use client"

import { format, formatDistanceToNow } from "date-fns"
import { CheckCircle2, Circle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import type { JobApplication, JobStatus } from "@/lib/api"

const statusColors: Record<Exclude<JobStatus, "All">, string> = {
	Wishlist: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
	Applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	"Interview Scheduled":
		"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
	Interviewing:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	Offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
	Accepted:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
	Withdrawn:
		"bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
}

interface StatusHistoryTimelineProps {
	application: JobApplication
}

export default function StatusHistoryTimeline({
	application,
}: StatusHistoryTimelineProps) {
	const statusHistory = application.status_history

	if (statusHistory.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Status History</CardTitle>
					<CardDescription>No status changes recorded yet</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	const sortedHistory = [...statusHistory].sort(
		(a, b) =>
			new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Status History</CardTitle>
				<CardDescription>
					Track of all status changes for this application
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="relative">
					<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

					<div className="space-y-6">
						{sortedHistory.map((entry, index) => {
							const isLatest = index === 0
							const date = new Date(entry.changed_at)
							const isToday =
								format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

							return (
								<div
									key={`${entry.status}-${entry.changed_at}`}
									className="relative flex gap-4"
								>
									<div className="relative z-10 shrink-0">
										<div
											className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
												isLatest
													? "bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400"
													: "bg-white border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700"
											}`}
										>
											{isLatest ? (
												<CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
											) : (
												<Circle className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
											)}
										</div>
									</div>

									<div className="flex-1 pb-6">
										<div className="flex items-center gap-2 mb-1">
											<Badge
												className={
													statusColors[
														entry.status as Exclude<JobStatus, "All">
													]
												}
												variant="secondary"
											>
												{entry.status}
											</Badge>
											{isLatest && (
												<span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
													Current
												</span>
											)}
										</div>
										<div className="text-sm text-zinc-600 dark:text-zinc-400">
											{isToday ? (
												<span>
													{formatDistanceToNow(date, { addSuffix: true })}
												</span>
											) : (
												<span>{format(date, "MMM d, yyyy 'at' h:mm a")}</span>
											)}
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
