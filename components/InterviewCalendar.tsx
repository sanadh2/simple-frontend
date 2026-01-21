"use client"

import { useMemo } from "react"
import { format, isSameDay, startOfDay } from "date-fns"
import { Calendar, Clock, MapPin, Phone, Video } from "lucide-react"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	type Interview,
	type InterviewFormat,
	type InterviewType,
} from "@/lib/api"

const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
	phone_screen: "Phone Screen",
	technical: "Technical",
	behavioral: "Behavioral",
	system_design: "System Design",
	hr: "HR",
	final: "Final",
}

const FORMAT_ICONS: Record<InterviewFormat, typeof Phone> = {
	phone: Phone,
	video: Video,
	in_person: MapPin,
}

const ID_DISPLAY_LENGTH = 8

interface InterviewCalendarProps {
	interviews: Interview[]
}

export default function InterviewCalendar({
	interviews,
}: InterviewCalendarProps) {
	const groupedInterviews = useMemo(() => {
		const groups: Record<string, Interview[]> = {}

		interviews.forEach((interview) => {
			const dateKey = format(
				startOfDay(new Date(interview.scheduled_at)),
				"yyyy-MM-dd"
			)
			if (!(dateKey in groups)) {
				groups[dateKey] = []
			}
			groups[dateKey].push(interview)
		})

		// Sort interviews within each day
		Object.keys(groups).forEach((key) => {
			groups[key].sort(
				(a, b) =>
					new Date(a.scheduled_at).getTime() -
					new Date(b.scheduled_at).getTime()
			)
		})

		// Sort days
		return Object.keys(groups)
			.sort()
			.reduce<Record<string, Interview[]>>((acc, key) => {
				acc[key] = groups[key]
				return acc
			}, {})
	}, [interviews])

	const upcomingInterviews = useMemo(() => {
		const now = new Date()
		return interviews.filter(
			(interview) => new Date(interview.scheduled_at) >= now
		)
	}, [interviews])

	const pastInterviews = useMemo(() => {
		const now = new Date()
		return interviews.filter(
			(interview) => new Date(interview.scheduled_at) < now
		)
	}, [interviews])

	if (interviews.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Interview Calendar</CardTitle>
					<CardDescription>
						No interviews scheduled. Add interviews to see them here.
					</CardDescription>
				</CardHeader>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Interview Calendar</CardTitle>
					<CardDescription>
						{upcomingInterviews.length} upcoming, {pastInterviews.length} past
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{Object.keys(groupedInterviews).map((dateKey) => {
							const date = new Date(dateKey)
							const dayInterviews = groupedInterviews[dateKey]
							const isToday = isSameDay(date, new Date())
							const isPast = date < startOfDay(new Date())

							return (
								<div key={dateKey} className="space-y-2">
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<h3
											className={`font-semibold ${
												isToday ? "text-primary" : ""
											} ${isPast ? "opacity-60" : ""}`}
										>
											{isToday ? "Today" : format(date, "EEEE, MMMM d, yyyy")}
										</h3>
									</div>
									<div className="ml-6 space-y-2">
										{dayInterviews.map((interview) => {
											const FormatIcon =
												FORMAT_ICONS[interview.interview_format]
											const scheduledDate = new Date(interview.scheduled_at)
											const interviewIsPast = scheduledDate < new Date()

											return (
												<div
													key={interview._id}
													className={`flex items-start gap-3 p-3 border ${
														interviewIsPast ? "opacity-60" : ""
													}`}
												>
													<FormatIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className="font-medium">
																{
																	INTERVIEW_TYPE_LABELS[
																		interview.interview_type
																	]
																}
															</span>
															{interview.duration_minutes && (
																<span className="text-xs text-muted-foreground">
																	{interview.duration_minutes} min
																</span>
															)}
														</div>
														<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
															<Clock className="h-3 w-3" />
															{format(scheduledDate, "h:mm a")}
															{interview.interviewer_name && (
																<>
																	<span>•</span>
																	<span>{interview.interviewer_name}</span>
																</>
															)}
														</div>
														{interview.job_application_id && (
															<div className="text-xs text-muted-foreground mt-1">
																Job Application ID:{" "}
																{interview.job_application_id.slice(
																	-ID_DISPLAY_LENGTH
																)}
															</div>
														)}
													</div>
												</div>
											)
										})}
									</div>
								</div>
							)
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
