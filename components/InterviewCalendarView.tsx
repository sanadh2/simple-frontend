"use client"

import { useCallback, useMemo, useState } from "react"
import {
	addMonths,
	addWeeks,
	endOfMonth,
	endOfWeek,
	format,
	isBefore,
	isSameDay,
	isSameMonth,
	parseISO,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subMonths,
	subWeeks,
} from "date-fns"
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Clock,
	Filter,
	MapPin,
	Phone,
	Video,
	X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	type Interview,
	type InterviewFormat,
	type InterviewType,
	type JobApplication,
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

// Improved color palette with better contrast and accessibility
const COMPANY_COLORS = [
	"bg-blue-600 hover:bg-blue-700",
	"bg-green-600 hover:bg-green-700",
	"bg-purple-600 hover:bg-purple-700",
	"bg-pink-600 hover:bg-pink-700",
	"bg-amber-600 hover:bg-amber-700",
	"bg-indigo-600 hover:bg-indigo-700",
	"bg-red-600 hover:bg-red-700",
	"bg-teal-600 hover:bg-teal-700",
	"bg-orange-600 hover:bg-orange-700",
	"bg-cyan-600 hover:bg-cyan-700",
]

const INTERVIEW_TYPE_COLORS: Record<InterviewType, string> = {
	phone_screen: "bg-blue-600 hover:bg-blue-700",
	technical: "bg-red-600 hover:bg-red-700",
	behavioral: "bg-green-600 hover:bg-green-700",
	system_design: "bg-purple-600 hover:bg-purple-700",
	hr: "bg-amber-600 hover:bg-amber-700",
	final: "bg-indigo-600 hover:bg-indigo-700",
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

// Constants
const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60
const MILLISECONDS_PER_SECOND = 1000
const MILLISECONDS_PER_DAY =
	HOURS_PER_DAY *
	MINUTES_PER_HOUR *
	SECONDS_PER_MINUTE *
	MILLISECONDS_PER_SECOND
const DAYS_PER_WEEK = 7
const MAX_UPCOMING_DISPLAY = 5
const MAX_INTERVIEWS_PER_DAY_MONTH = 3
const MAX_INTERVIEWS_PER_DAY_WEEK = 5
const DAYS_AHEAD_FOR_UPCOMING = 7

type ViewMode = "month" | "week"
type ColorMode = "company" | "type"

interface InterviewWithCompany extends Interview {
	company_name?: string
}

interface InterviewCalendarViewProps {
	interviews: Interview[]
	jobApplications: JobApplication[]
}

function getDayTextColorClass(
	isToday: boolean,
	isCurrentMonth: boolean
): string {
	if (isToday) {
		return "text-primary font-bold"
	}
	if (isCurrentMonth) {
		return "text-foreground"
	}
	return "text-muted-foreground"
}

interface CalendarFiltersProps {
	selectedCompany: string
	selectedType: string
	colorMode: ColorMode
	uniqueCompanies: string[]
	hasActiveFilters: boolean
	onCompanyChange: (value: string) => void
	onTypeChange: (value: string) => void
	onColorModeChange: (value: ColorMode) => void
	onClearFilters: () => void
}

function CalendarFilters({
	selectedCompany,
	selectedType,
	colorMode,
	uniqueCompanies,
	hasActiveFilters,
	onCompanyChange,
	onTypeChange,
	onColorModeChange,
	onClearFilters,
}: CalendarFiltersProps) {
	return (
		<div className="mb-6 flex flex-wrap items-center gap-3">
			<div className="flex items-center gap-2">
				<Filter className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm font-medium">Filters:</span>
			</div>
			<Select value={selectedCompany} onValueChange={onCompanyChange}>
				<SelectTrigger className="w-[160px] sm:w-[180px]">
					<SelectValue placeholder="All Companies" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Companies</SelectItem>
					{uniqueCompanies.map((company) => (
						<SelectItem key={company} value={company}>
							{company}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select value={selectedType} onValueChange={onTypeChange}>
				<SelectTrigger className="w-[160px] sm:w-[180px]">
					<SelectValue placeholder="All Types" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Types</SelectItem>
					{Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
						<SelectItem key={value} value={value}>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select
				value={colorMode}
				onValueChange={(v) => onColorModeChange(v as ColorMode)}
			>
				<SelectTrigger className="w-[140px] sm:w-[150px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="company">Color by Company</SelectItem>
					<SelectItem value="type">Color by Type</SelectItem>
				</SelectContent>
			</Select>
			{hasActiveFilters && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onClearFilters}
					aria-label="Clear all filters"
				>
					<X className="h-4 w-4 mr-1" />
					Clear Filters
				</Button>
			)}
		</div>
	)
}

interface CalendarDayCellProps {
	day: Date
	dayInterviews: InterviewWithCompany[]
	isCurrentMonth: boolean
	isToday: boolean
	isPast: boolean
	viewMode: ViewMode
	getInterviewColor: (interview: InterviewWithCompany) => string
	onInterviewClick: (interview: InterviewWithCompany) => void
}

function CalendarDayCell({
	day,
	dayInterviews,
	isCurrentMonth,
	isToday,
	isPast,
	viewMode,
	getInterviewColor,
	onInterviewClick,
}: CalendarDayCellProps) {
	const dateKey = format(day, "yyyy-MM-dd")
	const textColorClass = getDayTextColorClass(isToday, isCurrentMonth)
	const maxInterviews =
		viewMode === "week"
			? MAX_INTERVIEWS_PER_DAY_WEEK
			: MAX_INTERVIEWS_PER_DAY_MONTH

	return (
		<div
			key={dateKey}
			className={`min-h-[80px] sm:min-h-[100px] border-r border-b p-1 transition-colors ${
				!isCurrentMonth ? "bg-muted/20" : "bg-background"
			} ${isToday ? "bg-primary/5 ring-2 ring-primary/20" : ""} ${
				isPast ? "opacity-60" : ""
			}`}
			role="gridcell"
			aria-label={format(day, "EEEE, MMMM d, yyyy")}
		>
			<div className={`text-xs sm:text-sm font-medium mb-1 ${textColorClass}`}>
				{format(day, "d")}
			</div>
			<div className="space-y-0.5 sm:space-y-1">
				{dayInterviews.slice(0, maxInterviews).map((interview) => {
					const color = getInterviewColor(interview)
					const interviewTime = parseISO(interview.scheduled_at)
					const displayText =
						interview.company_name ??
						INTERVIEW_TYPE_LABELS[interview.interview_type]

					return (
						<button
							key={interview._id}
							onClick={() => onInterviewClick(interview)}
							className={`w-full text-left text-[10px] sm:text-xs p-1 rounded ${color} text-white hover:opacity-90 transition-all truncate shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary`}
							title={`${INTERVIEW_TYPE_LABELS[interview.interview_type]} - ${format(interviewTime, "h:mm a")}${interview.company_name ? ` - ${interview.company_name}` : ""}`}
							aria-label={`${INTERVIEW_TYPE_LABELS[interview.interview_type]} interview at ${format(interviewTime, "h:mm a")}${interview.company_name ? ` for ${interview.company_name}` : ""}`}
						>
							<span className="hidden sm:inline">
								{format(interviewTime, "h:mm")}{" "}
							</span>
							{displayText}
						</button>
					)
				})}
				{dayInterviews.length > maxInterviews && (
					<button
						onClick={() => {
							const firstInterview = dayInterviews[0] as
								| InterviewWithCompany
								| undefined
							if (firstInterview) {
								onInterviewClick(firstInterview)
							}
						}}
						className="text-[10px] sm:text-xs text-muted-foreground px-1 hover:text-foreground transition-colors"
						aria-label={`${dayInterviews.length - maxInterviews} more interviews on this day`}
					>
						+{dayInterviews.length - maxInterviews} more
					</button>
				)}
			</div>
		</div>
	)
}

interface UpcomingInterviewsListProps {
	interviews: InterviewWithCompany[]
	getInterviewColor: (interview: InterviewWithCompany) => string
	onInterviewClick: (interview: InterviewWithCompany) => void
}

function UpcomingInterviewsList({
	interviews,
	getInterviewColor,
	onInterviewClick,
}: UpcomingInterviewsListProps) {
	if (interviews.length === 0) {
		return null
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upcoming Interviews (Next 7 Days)</CardTitle>
				<CardDescription>
					{interviews.length} interview{interviews.length !== 1 ? "s" : ""}{" "}
					scheduled
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2 sm:space-y-3">
					{interviews.map((interview) => {
						const scheduledDate = parseISO(interview.scheduled_at)
						const FormatIcon = FORMAT_ICONS[interview.interview_format]
						const color = getInterviewColor(interview)

						return (
							<button
								key={interview._id}
								onClick={() => onInterviewClick(interview)}
								className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
								aria-label={`View details for ${INTERVIEW_TYPE_LABELS[interview.interview_type]} interview`}
							>
								<div className="flex items-start gap-3">
									<div
										className={`w-3 h-3 rounded-full mt-1 shrink-0 ${color.split(" ")[0]}`}
									/>
									<div className="flex-1 min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<FormatIcon className="h-4 w-4 text-muted-foreground shrink-0" />
											<span className="font-medium">
												{INTERVIEW_TYPE_LABELS[interview.interview_type]}
											</span>
											{interview.company_name && (
												<span className="text-sm text-muted-foreground">
													• {interview.company_name}
												</span>
											)}
										</div>
										<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
											<Clock className="h-3 w-3 shrink-0" />
											<span className="whitespace-nowrap">
												{format(
													scheduledDate,
													"EEEE, MMMM d, yyyy 'at' h:mm a"
												)}
											</span>
											{interview.duration_minutes && (
												<>
													<span>•</span>
													<span>{interview.duration_minutes} min</span>
												</>
											)}
										</div>
									</div>
								</div>
							</button>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}

interface InterviewDetailDialogProps {
	interview: InterviewWithCompany | null
	onClose: () => void
}

function InterviewDetailDialog({
	interview,
	onClose,
}: InterviewDetailDialogProps) {
	if (!interview) {
		return null
	}

	const FormatIcon = FORMAT_ICONS[interview.interview_format]

	return (
		<Dialog open={!!interview} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<FormatIcon className="h-5 w-5 text-muted-foreground shrink-0" />
						<DialogTitle>
							{INTERVIEW_TYPE_LABELS[interview.interview_type]}
						</DialogTitle>
					</div>
					<DialogDescription>
						{interview.company_name ?? "Interview Details"}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 mt-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Date & Time
							</div>
							<p className="mt-1 text-sm">
								{format(
									parseISO(interview.scheduled_at),
									"EEEE, MMMM d, yyyy 'at' h:mm a"
								)}
							</p>
						</div>
						{interview.duration_minutes && (
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									Duration
								</div>
								<p className="mt-1 text-sm">
									{interview.duration_minutes} minutes
								</p>
							</div>
						)}
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Format
							</div>
							<p className="mt-1 text-sm capitalize">
								{interview.interview_format.replace("_", " ")}
							</p>
						</div>
						{interview.interviewer_name && (
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									Interviewer
								</div>
								<p className="mt-1 text-sm">
									{interview.interviewer_name}
									{interview.interviewer_role &&
										` • ${interview.interviewer_role}`}
								</p>
							</div>
						)}
					</div>
					{interview.notes && (
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Notes
							</div>
							<p className="mt-1 text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
								{interview.notes}
							</p>
						</div>
					)}
					{interview.feedback && (
						<div>
							<div className="text-sm font-medium text-muted-foreground">
								Feedback
							</div>
							<p className="mt-1 text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
								{interview.feedback}
							</p>
						</div>
					)}
					{interview.preparation_checklist &&
						interview.preparation_checklist.length > 0 && (
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									Preparation Checklist
								</div>
								<ul className="mt-1 list-disc list-inside space-y-1 text-sm bg-muted/50 p-3 rounded-md">
									{interview.preparation_checklist.map((item) => (
										<li key={`${interview._id}-${item}`}>{item}</li>
									))}
								</ul>
							</div>
						)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

function useInterviewData(
	interviews: Interview[],
	jobApplications: JobApplication[],
	selectedCompany: string,
	selectedType: string
) {
	const companyMap = useMemo(() => {
		const map = new Map<string, string>()
		jobApplications.forEach((app) => {
			map.set(app._id, app.company_name)
		})
		return map
	}, [jobApplications])

	const enrichedInterviews = useMemo(() => {
		return interviews.map((interview) => ({
			...interview,
			company_name: companyMap.get(interview.job_application_id),
		}))
	}, [interviews, companyMap])

	const uniqueCompanies = useMemo(() => {
		const companies = new Set<string>()
		enrichedInterviews.forEach((interview) => {
			if (interview.company_name) {
				companies.add(interview.company_name)
			}
		})
		return Array.from(companies).sort()
	}, [enrichedInterviews])

	const filteredInterviews = useMemo(() => {
		return enrichedInterviews.filter((interview) => {
			if (
				selectedCompany !== "all" &&
				interview.company_name !== selectedCompany
			) {
				return false
			}
			if (selectedType !== "all" && interview.interview_type !== selectedType) {
				return false
			}
			return true
		})
	}, [enrichedInterviews, selectedCompany, selectedType])

	const interviewsByDate = useMemo(() => {
		const map = new Map<string, InterviewWithCompany[]>()
		filteredInterviews.forEach((interview) => {
			const dateKey = format(
				startOfDay(parseISO(interview.scheduled_at)),
				"yyyy-MM-dd"
			)
			if (!map.has(dateKey)) {
				map.set(dateKey, [])
			}
			map.get(dateKey)?.push(interview)
		})
		map.forEach((dayInterviews) => {
			dayInterviews.sort(
				(a, b) =>
					parseISO(a.scheduled_at).getTime() -
					parseISO(b.scheduled_at).getTime()
			)
		})
		return map
	}, [filteredInterviews])

	const upcomingInterviews = useMemo(() => {
		const now = startOfDay(new Date())
		const nextWeek = new Date(
			now.getTime() + DAYS_AHEAD_FOR_UPCOMING * MILLISECONDS_PER_DAY
		)
		return filteredInterviews
			.filter((interview) => {
				const interviewDate = startOfDay(parseISO(interview.scheduled_at))
				return interviewDate >= now && interviewDate <= nextWeek
			})
			.sort(
				(a, b) =>
					parseISO(a.scheduled_at).getTime() -
					parseISO(b.scheduled_at).getTime()
			)
			.slice(0, MAX_UPCOMING_DISPLAY)
	}, [filteredInterviews])

	return {
		filteredInterviews,
		uniqueCompanies,
		interviewsByDate,
		upcomingInterviews,
	}
}

export default function InterviewCalendarView({
	interviews,
	jobApplications,
}: InterviewCalendarViewProps) {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [viewMode, setViewMode] = useState<ViewMode>("month")
	const [colorMode, setColorMode] = useState<ColorMode>("company")
	const [selectedInterview, setSelectedInterview] =
		useState<InterviewWithCompany | null>(null)
	const [selectedCompany, setSelectedCompany] = useState<string>("all")
	const [selectedType, setSelectedType] = useState<string>("all")

	const {
		filteredInterviews,
		uniqueCompanies,
		interviewsByDate,
		upcomingInterviews,
	} = useInterviewData(
		interviews,
		jobApplications,
		selectedCompany,
		selectedType
	)

	const getInterviewsForDate = useCallback(
		(date: Date): InterviewWithCompany[] => {
			const dateKey = format(startOfDay(date), "yyyy-MM-dd")
			return interviewsByDate.get(dateKey) ?? []
		},
		[interviewsByDate]
	)

	const getInterviewColor = useCallback(
		(interview: InterviewWithCompany): string => {
			if (colorMode === "company") {
				if (!interview.company_name) {
					return "bg-gray-600 hover:bg-gray-700"
				}
				const index = uniqueCompanies.indexOf(interview.company_name)
				return (
					COMPANY_COLORS[index % COMPANY_COLORS.length] ?? COMPANY_COLORS[0]
				)
			}
			return INTERVIEW_TYPE_COLORS[interview.interview_type]
		},
		[colorMode, uniqueCompanies]
	)

	const calendarDays = useMemo(() => {
		if (viewMode === "month") {
			const monthStart = startOfMonth(currentDate)
			const monthEnd = endOfMonth(currentDate)
			const calendarStart = startOfWeek(monthStart)
			const calendarEnd = endOfWeek(monthEnd)

			const days: Date[] = []
			let day = new Date(calendarStart)
			while (day <= calendarEnd) {
				days.push(new Date(day))
				day = new Date(day.getTime() + MILLISECONDS_PER_DAY)
			}
			return days
		}
		const weekStart = startOfWeek(currentDate)
		const days: Date[] = []
		for (let i = 0; i < DAYS_PER_WEEK; i++) {
			days.push(new Date(weekStart.getTime() + i * MILLISECONDS_PER_DAY))
		}
		return days
	}, [currentDate, viewMode])

	const navigatePrevious = useCallback(() => {
		setCurrentDate((prev) =>
			viewMode === "month" ? subMonths(prev, 1) : subWeeks(prev, 1)
		)
	}, [viewMode])

	const navigateNext = useCallback(() => {
		setCurrentDate((prev) =>
			viewMode === "month" ? addMonths(prev, 1) : addWeeks(prev, 1)
		)
	}, [viewMode])

	const navigateToday = useCallback(() => {
		setCurrentDate(new Date())
	}, [])

	const handleInterviewClick = useCallback(
		(interview: InterviewWithCompany) => {
			setSelectedInterview(interview)
		},
		[]
	)

	const clearFilters = useCallback(() => {
		setSelectedCompany("all")
		setSelectedType("all")
	}, [])

	const hasActiveFilters = selectedCompany !== "all" || selectedType !== "all"

	if (interviews.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Interview Calendar</CardTitle>
					<CardDescription>
						No interviews scheduled. Add interviews to see them here.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							Your interview calendar will appear here once you schedule
							interviews.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle>Interview Calendar</CardTitle>
							<CardDescription>
								{filteredInterviews.length} interview
								{filteredInterviews.length !== 1 ? "s" : ""} scheduled
								{hasActiveFilters && " (filtered)"}
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setViewMode(viewMode === "month" ? "week" : "month")
								}
								aria-label={`Switch to ${viewMode === "month" ? "week" : "month"} view`}
							>
								{viewMode === "month" ? "Week View" : "Month View"}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={navigateToday}
								aria-label="Go to today"
							>
								Today
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<CalendarFilters
						selectedCompany={selectedCompany}
						selectedType={selectedType}
						colorMode={colorMode}
						uniqueCompanies={uniqueCompanies}
						hasActiveFilters={hasActiveFilters}
						onCompanyChange={setSelectedCompany}
						onTypeChange={setSelectedType}
						onColorModeChange={setColorMode}
						onClearFilters={clearFilters}
					/>

					<div className="flex items-center justify-between mb-4">
						<Button
							variant="outline"
							size="sm"
							onClick={navigatePrevious}
							aria-label={`Go to previous ${viewMode}`}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<h2 className="text-lg sm:text-xl font-semibold text-center">
							{viewMode === "month"
								? format(currentDate, "MMMM yyyy")
								: `Week of ${format(calendarDays[0], "MMM d")} - ${format(calendarDays[6], "MMM d, yyyy")}`}
						</h2>
						<Button
							variant="outline"
							size="sm"
							onClick={navigateNext}
							aria-label={`Go to next ${viewMode}`}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>

					<div className="border rounded-lg overflow-hidden">
						<div className="grid grid-cols-7 bg-muted/50">
							{DAYS_OF_WEEK.map((day) => (
								<div
									key={day}
									className="p-2 text-center text-xs sm:text-sm font-medium border-r last:border-r-0"
									role="columnheader"
								>
									<span className="hidden sm:inline">{day}</span>
									<span className="sm:hidden">{day[0]}</span>
								</div>
							))}
						</div>

						<div className="grid grid-cols-7">
							{calendarDays.map((day) => {
								const dayInterviews = getInterviewsForDate(day)
								const isCurrentMonth = isSameMonth(day, currentDate)
								const isToday = isSameDay(day, new Date())
								const isPast = isBefore(day, startOfDay(new Date()))

								return (
									<CalendarDayCell
										key={format(day, "yyyy-MM-dd")}
										day={day}
										dayInterviews={dayInterviews}
										isCurrentMonth={isCurrentMonth}
										isToday={isToday}
										isPast={isPast}
										viewMode={viewMode}
										getInterviewColor={getInterviewColor}
										onInterviewClick={handleInterviewClick}
									/>
								)
							})}
						</div>
					</div>

					{filteredInterviews.length === 0 && hasActiveFilters && (
						<div className="mt-6 text-center py-8">
							<Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm text-muted-foreground">
								No interviews match your current filters.
							</p>
							<Button
								variant="link"
								size="sm"
								onClick={clearFilters}
								className="mt-2"
							>
								Clear filters
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			<UpcomingInterviewsList
				interviews={upcomingInterviews}
				getInterviewColor={getInterviewColor}
				onInterviewClick={handleInterviewClick}
			/>

			<InterviewDetailDialog
				interview={selectedInterview}
				onClose={() => setSelectedInterview(null)}
			/>
		</div>
	)
}
