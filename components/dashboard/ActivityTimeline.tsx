"use client"

import { format, formatDistanceToNow } from "date-fns"
import { CheckCircle2, Clock, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JobApplication } from "@/lib/api"

const DISPLAYED_ACTIVITIES_LIMIT = 20

interface Activity {
	type: string
	date: string
	description: string
	application: JobApplication
}

interface ActivityTimelineProps {
	activities: Activity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
	if (activities.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Activity Timeline</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						No recent activity
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Activity Timeline</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities
						.slice(0, DISPLAYED_ACTIVITIES_LIMIT)
						.map((activity, index) => {
							const displayedActivities = activities.slice(
								0,
								DISPLAYED_ACTIVITIES_LIMIT
							)
							const isLast = index === displayedActivities.length - 1

							let Icon = Clock
							if (activity.type === "created") {
								Icon = FileText
							} else if (activity.type === "status_change") {
								Icon = CheckCircle2
							}

							const activityKey = `${activity.application._id}-${activity.date}-${activity.type}`

							return (
								<div key={activityKey} className="relative">
									{!isLast && (
										<div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
									)}
									<div className="flex gap-4">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
											<Icon className="h-4 w-4 text-muted-foreground" />
										</div>
										<div className="flex-1 space-y-1 pb-4">
											<p className="text-sm font-medium">
												{activity.description}
											</p>
											<p className="text-xs text-muted-foreground">
												{format(
													new Date(activity.date),
													"MMM d, yyyy 'at' h:mm a"
												)}{" "}
												·{" "}
												{formatDistanceToNow(new Date(activity.date), {
													addSuffix: true,
												})}
											</p>
										</div>
									</div>
								</div>
							)
						})}
				</div>
			</CardContent>
		</Card>
	)
}
