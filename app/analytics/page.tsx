"use client"

import { redirect } from "next/navigation"
import {
	BarChart3,
	Calendar,
	Clock,
	MessageSquare,
	TrendingUp,
} from "lucide-react"

import { ApplicationFunnelChart } from "@/components/analytics/ApplicationFunnelChart"
import { BestTimesCharts } from "@/components/analytics/BestTimesCharts"
import { MetricCard } from "@/components/analytics/MetricCard"
import { SalaryRangeChart } from "@/components/analytics/SalaryRangeChart"
import { SuccessByMethodChart } from "@/components/analytics/SuccessByMethodChart"
import ErrorFallback from "@/components/ErrorBoundaryFallback"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useProfile } from "@/hooks/useAuth"
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics"

export default function AnalyticsDashboardPage() {
	const { data: user, isLoading: isAuthLoading } = useProfile()
	const { data, isLoading, error, refetch } = useDashboardAnalytics()

	if (isAuthLoading) {
		return <LoadingSpinner text="Checking authentication..." />
	}

	if (!user) {
		redirect("/auth")
	}

	if (isLoading) {
		return <LoadingSpinner text="Loading analytics..." />
	}

	if (error) {
		return <ErrorFallback error={error} onRetry={() => refetch()} />
	}

	if (!data) {
		return null
	}

	const {
		funnel,
		responseRate,
		interviewConversionRate,
		avgTimeToHearBackDays,
		avgTimeBetweenInterviewRoundsDays,
		successByApplicationMethod,
		bestDaysToApply,
		bestHoursToApply,
		salaryRange,
	} = data

	return (
		<div className="container mx-auto p-4 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
						<BarChart3 className="h-8 w-8" />
						Analytics Dashboard
					</h1>
					<p className="text-muted-foreground">
						Application funnel, response rates, best times to apply, and salary
						insights
					</p>
				</div>
			</div>

			{/* Application Funnel */}
			<ApplicationFunnelChart funnel={funnel} />

			{/* Key metrics */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					title="Response Rate"
					value={`${responseRate}%`}
					subtitle="% of applications that got a response"
					icon={MessageSquare}
				/>
				<MetricCard
					title="Interview Conversion"
					value={`${interviewConversionRate}%`}
					subtitle="% of interviews that led to an offer"
					icon={TrendingUp}
				/>
				<MetricCard
					title="Avg. Time to Hear Back"
					value={
						avgTimeToHearBackDays != null
							? `${avgTimeToHearBackDays} days`
							: "—"
					}
					subtitle="From application to first response"
					icon={Clock}
				/>
				<MetricCard
					title="Avg. Time Between Rounds"
					value={
						avgTimeBetweenInterviewRoundsDays != null
							? `${avgTimeBetweenInterviewRoundsDays} days`
							: "—"
					}
					subtitle="Between consecutive interview rounds"
					icon={Calendar}
				/>
			</div>

			{/* Success by application method */}
			<SuccessByMethodChart data={successByApplicationMethod} />

			{/* Best days and hours to apply */}
			<BestTimesCharts
				bestDays={bestDaysToApply}
				bestHours={bestHoursToApply}
			/>

			{/* Salary range analysis */}
			<SalaryRangeChart salaryRange={salaryRange} />
		</div>
	)
}
