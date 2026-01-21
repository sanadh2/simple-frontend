"use client"

import { format } from "date-fns"
import { Building2, Calendar, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JobApplication, JobStatus } from "@/lib/api"

interface RecentApplicationsProps {
	applications: JobApplication[]
}

const statusColors: Record<JobStatus, string> = {
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

export function RecentApplications({ applications }: RecentApplicationsProps) {
	if (applications.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Applications</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-8">
						No recent applications
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Applications</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{applications.map((app) => (
						<div
							key={app._id}
							className="block p-4 rounded-lg border hover:bg-accent transition-colors"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-1">
										<Building2 className="h-4 w-4 text-muted-foreground" />
										<span className="font-semibold">{app.company_name}</span>
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{app.job_title}
									</p>
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{format(new Date(app.application_date), "MMM d, yyyy")}
										</div>
									</div>
								</div>
								<div className="flex flex-col items-end gap-2">
									<Badge className={statusColors[app.status]}>
										{app.status}
									</Badge>
									{app.job_posting_url && (
										<a
											href={app.job_posting_url}
											target="_blank"
											rel="noopener noreferrer"
											onClick={(e) => e.stopPropagation()}
											className="text-muted-foreground hover:text-foreground"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
