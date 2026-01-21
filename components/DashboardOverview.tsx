"use client"

import { useMemo } from "react"
import { Briefcase } from "lucide-react"

import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline"
import { ApplicationsByStatusChart } from "@/components/dashboard/ApplicationsByStatusChart"
import { QuickStats } from "@/components/dashboard/QuickStats"
import { RecentApplications } from "@/components/dashboard/RecentApplications"
import InterviewCalendar from "@/components/InterviewCalendar"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInterviews } from "@/hooks/useInterviews"
import { useJobApplications } from "@/hooks/useJobApplications"
import type { JobApplication, JobStatus } from "@/lib/api"

const PERCENTAGE_MULTIPLIER = 100
const RECENT_APPLICATIONS_LIMIT = 10
const ACTIVITIES_LIMIT = 50

export default function DashboardOverview() {
	const { data, isLoading, error } = useJobApplications({ limit: 1000 })
	const { data: interviewsData, isLoading: isLoadingInterviews } =
		useInterviews()

	const stats = useMemo(() => {
		if (!data?.applications) {
			return {
				totalApplications: 0,
				statusBreakdown: {} as Record<JobStatus, number>,
				responseRate: 0,
				interviewRate: 0,
				recentApplications: [] as JobApplication[],
				activities: [] as Array<{
					type: string
					date: string
					description: string
					application: JobApplication
				}>,
			}
		}

		const { applications } = data
		const totalApplications = applications.length

		// Calculate status breakdown
		const statusBreakdown = applications.reduce(
			(acc, app) => {
				acc[app.status] = (acc[app.status] || 0) + 1
				return acc
			},
			{} as Record<JobStatus, number>
		)

		// Calculate response rate (applications that moved beyond "Applied" or "Wishlist")
		const appliedCount = applications.filter(
			(app) => app.status !== "Wishlist"
		).length
		const respondedCount = applications.filter(
			(app) =>
				app.status !== "Wishlist" &&
				app.status !== "Applied" &&
				app.status !== "Withdrawn"
		).length
		const responseRate =
			appliedCount > 0
				? (respondedCount / appliedCount) * PERCENTAGE_MULTIPLIER
				: 0

		// Calculate interview rate (applications that reached interview stage)
		const interviewCount = applications.filter(
			(app) =>
				app.status === "Interview Scheduled" ||
				app.status === "Interviewing" ||
				app.status === "Offer" ||
				app.status === "Accepted"
		).length
		const interviewRate =
			appliedCount > 0
				? (interviewCount / appliedCount) * PERCENTAGE_MULTIPLIER
				: 0

		// Get recent applications
		const recentApplications = [...applications]
			.sort(
				(a, b) =>
					new Date(b.application_date).getTime() -
					new Date(a.application_date).getTime()
			)
			.slice(0, RECENT_APPLICATIONS_LIMIT)

		// Build activity timeline from status history
		const activities: Array<{
			type: string
			date: string
			description: string
			application: JobApplication
		}> = []

		applications.forEach((app) => {
			// Add application creation
			activities.push({
				type: "created",
				date: app.createdAt,
				description: `Applied to ${app.company_name} - ${app.job_title}`,
				application: app,
			})

			// Add status changes
			app.status_history
				.sort(
					(a, b) =>
						new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
				)
				.forEach((history) => {
					activities.push({
						type: "status_change",
						date: history.changed_at,
						description: `Status changed to ${history.status} for ${app.company_name}`,
						application: app,
					})
				})
		})

		// Sort activities by date (most recent first)
		activities.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		)

		return {
			totalApplications,
			statusBreakdown,
			responseRate,
			interviewRate,
			recentApplications,
			activities: activities.slice(0, ACTIVITIES_LIMIT),
		}
	}, [data])

	if (isLoading || isLoadingInterviews) {
		return <LoadingSpinner text="Loading dashboard..." />
	}

	if (error) {
		return (
			<div className="container mx-auto p-4">
				<Card>
					<CardContent className="pt-6">
						<p className="text-red-600 dark:text-red-400">
							Error loading dashboard: {error.message}
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-4 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Overview of your job application activity
					</p>
				</div>
			</div>

			{/* Total Applications Count */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Briefcase className="h-5 w-5" />
						Total Applications
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-4xl font-bold">{stats.totalApplications}</div>
					<p className="text-sm text-muted-foreground mt-2">
						Total job applications tracked
					</p>
				</CardContent>
			</Card>

			{/* Quick Stats */}
			<QuickStats
				responseRate={stats.responseRate}
				interviewRate={stats.interviewRate}
			/>

			{/* Applications by Status Chart */}
			<ApplicationsByStatusChart statusBreakdown={stats.statusBreakdown} />

			{/* Recent Applications and Timeline */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RecentApplications applications={stats.recentApplications} />
				<ActivityTimeline activities={stats.activities} />
			</div>

			{/* Interview Calendar */}
			<InterviewCalendar interviews={interviewsData ?? []} />
		</div>
	)
}
