"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format, formatDistanceToNow, subDays } from "date-fns"
import {
	Calendar,
	CheckCircle2,
	FileText,
	Mail,
	MessageSquare,
	Video,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useActivityTimeline } from "@/hooks/useActivityTimeline"
import type { ActivityType, TimelineActivity } from "@/lib/api"

const PRESETS = [
	{ value: "7", label: "Last 7 days" },
	{ value: "30", label: "Last 30 days" },
	{ value: "90", label: "Last 90 days" },
	{ value: "all", label: "All time" },
	{ value: "custom", label: "Custom range" },
] as const

const DISPLAYED_ACTIVITIES_LIMIT = 50

function getIcon(type: ActivityType) {
	switch (type) {
		case "application_submitted":
			return FileText
		case "status_change":
			return CheckCircle2
		case "interview_completed":
			return Video
		case "follow_up_sent":
			return Mail
		default:
			return MessageSquare
	}
}

function getFilterParams(
	preset: string,
	customStart: string,
	customEnd: string
): { startDate?: string; endDate?: string } {
	if (preset === "all") {
		return {}
	}
	if (preset === "custom") {
		const p: { startDate?: string; endDate?: string } = {}
		if (customStart) {
			p.startDate = customStart
		}
		if (customEnd) {
			p.endDate = customEnd
		}
		return p
	}
	const days = parseInt(preset, 10)
	if (Number.isNaN(days) || days < 1) {
		return {}
	}
	const end = new Date()
	const start = subDays(end, days)
	const endStr = format(end, "yyyy-MM-dd")
	const startStr = format(start, "yyyy-MM-dd")
	return { startDate: startStr, endDate: endStr }
}

export function ActivityTimeline() {
	const [preset, setPreset] = useState<string>("30")
	const [customStart, setCustomStart] = useState("")
	const [customEnd, setCustomEnd] = useState("")

	const filterParams = useMemo(
		() => getFilterParams(preset, customStart, customEnd),
		[preset, customStart, customEnd]
	)

	const {
		data: activities = [],
		isLoading,
		error,
	} = useActivityTimeline(filterParams)

	const displayList = activities.slice(0, DISPLAYED_ACTIVITIES_LIMIT)
	const hasMore = activities.length > DISPLAYED_ACTIVITIES_LIMIT

	const handlePresetChange = (value: string) => {
		setPreset(value)
		if (value !== "custom") {
			setCustomStart("")
			setCustomEnd("")
		}
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle>Activity Timeline</CardTitle>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<Select value={preset} onValueChange={handlePresetChange}>
							<SelectTrigger className="w-full sm:w-[180px]">
								<SelectValue placeholder="Date range" />
							</SelectTrigger>
							<SelectContent>
								{PRESETS.map((p) => (
									<SelectItem key={p.value} value={p.value}>
										{p.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{preset === "custom" && (
							<div className="flex flex-wrap items-center gap-2">
								<div className="flex items-center gap-1">
									<Label
										htmlFor="tl-start"
										className="text-muted-foreground text-xs whitespace-nowrap"
									>
										From
									</Label>
									<Input
										id="tl-start"
										type="date"
										value={customStart}
										onChange={(e) => setCustomStart(e.target.value)}
										className="h-8 w-[140px]"
									/>
								</div>
								<div className="flex items-center gap-1">
									<Label
										htmlFor="tl-end"
										className="text-muted-foreground text-xs whitespace-nowrap"
									>
										To
									</Label>
									<Input
										id="tl-end"
										type="date"
										value={customEnd}
										onChange={(e) => setCustomEnd(e.target.value)}
										className="h-8 w-[140px]"
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{error && (
					<p className="text-destructive text-sm py-4 text-center">
						{error.message}
					</p>
				)}
				{isLoading && (
					<div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
						<Calendar className="mr-2 h-4 w-4 animate-pulse" />
						Loading…
					</div>
				)}
				{!isLoading && !error && activities.length === 0 && (
					<p className="text-muted-foreground text-sm text-center py-8">
						No activity in this range
					</p>
				)}
				{!isLoading && !error && displayList.length > 0 && (
					<div className="space-y-4">
						{displayList.map((activity: TimelineActivity, index: number) => {
							const isLast = index === displayList.length - 1
							const Icon = getIcon(activity.type)
							const key = `${activity.job_application_id}-${activity.date}-${activity.type}`

							return (
								<div key={key} className="relative">
									{!isLast && (
										<div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
									)}
									<div className="flex gap-4">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
											<Icon className="text-muted-foreground h-4 w-4" />
										</div>
										<div className="min-w-0 flex-1 space-y-1 pb-4">
											<p className="text-sm font-medium">
												<Link
													href="/job-applications"
													className="hover:underline focus:underline"
												>
													{activity.description}
												</Link>
											</p>
											<p className="text-muted-foreground text-xs">
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
						{hasMore && (
							<p className="text-muted-foreground text-center text-xs">
								Showing {DISPLAYED_ACTIVITIES_LIMIT} of {activities.length}
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
