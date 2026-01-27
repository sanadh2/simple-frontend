"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
	Building2,
	Calendar,
	ExternalLink,
	MapPin,
	Pencil,
	Tag,
	Trash2,
} from "lucide-react"

import ContactList from "@/components/ContactList"
import EditJobApplicationForm from "@/components/EditJobApplicationForm"
import InterviewList from "@/components/InterviewList"
import LoadingSpinner from "@/components/LoadingSpinner"
import StatusHistoryTimeline from "@/components/StatusHistoryTimeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useContactsByJobApplication } from "@/hooks/useContacts"
import { useInterviewsByJobApplication } from "@/hooks/useInterviews"
import { useDeleteJobApplication } from "@/hooks/useJobApplications"
import type { JobApplication, JobStatus, PriorityLevel } from "@/lib/api"

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

const priorityColors: Record<PriorityLevel, string> = {
	high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
	medium:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

const locationTypeLabels: Record<string, string> = {
	remote: "Remote",
	hybrid: "Hybrid",
	onsite: "Onsite",
}

const statusAtLabels: Record<Exclude<JobStatus, "All">, string> = {
	Wishlist: "Wishlisted at",
	Applied: "Applied at",
	"Interview Scheduled": "Interview scheduled at",
	Interviewing: "Interviewing at",
	Offer: "Offer at",
	Rejected: "Rejected at",
	Accepted: "Accepted at",
	Withdrawn: "Withdrawn at",
}

function getStatusAtDate(application: JobApplication): string | null {
	const { status, status_history, application_date, createdAt } = application
	if (status === "All") {
		return null
	}
	const fromHistory = status_history
		.filter((e) => e.status === status)
		.sort(
			(a, b) =>
				new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
		)[0]
	// Array [0] can be undefined when empty
	if (fromHistory != null) {
		return fromHistory.changed_at
	}
	if (status === "Applied" && application_date) {
		return application_date
	}
	return createdAt
}

interface JobApplicationsListProps {
	data?: {
		applications: JobApplication[]
		totalCount?: number
		currentPage?: number
		pageSize?: number
		totalPages?: number
	}
	isLoading?: boolean
	error?: Error | null
	refetch?: () => void
}

export default function JobApplicationsList({
	data,
	isLoading,
	error,
}: JobApplicationsListProps) {
	if (isLoading) {
		return <LoadingSpinner text="Loading job applications..." />
	}

	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-red-600 dark:text-red-400">
						Error loading job applications:{" "}
						{error instanceof Error ? error.message : String(error)}
					</p>
				</CardContent>
			</Card>
		)
	}

	if (!data?.applications || data.applications.length === 0) {
		return (
			<div className="text-center py-12">
				<Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
				<p className="text-gray-500 dark:text-gray-400 mb-4">
					No job applications yet
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{data.applications.map((application) => (
				<JobApplicationCard key={application._id} application={application} />
			))}
		</div>
	)
}

const getLocationText = (application: JobApplication): string => {
	if (application.location_type === "remote") {
		return "Remote"
	}
	const locationType = locationTypeLabels[application.location_type] || ""
	return application.location_city
		? `${locationType} - ${application.location_city}`
		: locationType
}

function JobApplicationCard({ application }: { application: JobApplication }) {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [showInterviews, setShowInterviews] = useState(false)
	const [showContacts, setShowContacts] = useState(false)
	const deleteJobApplication = useDeleteJobApplication()
	const { data: interviews = [], refetch: refetchInterviews } =
		useInterviewsByJobApplication(application._id)
	const { data: contacts = [], refetch: refetchContacts } =
		useContactsByJobApplication(application._id)

	const locationText = getLocationText(application)
	const statusAt =
		application.status !== "All" ? getStatusAtDate(application) : null
	const statusAtLabel =
		statusAt && application.status !== "All"
			? statusAtLabels[application.status]
			: null

	const handleDelete = async () => {
		await deleteJobApplication.mutateAsync(application._id, {
			onSuccess: () => {
				setIsDeleteOpen(false)
			},
		})
	}

	const handleDeleteDialogClose = () => {
		if (!deleteJobApplication.isPending) {
			setIsDeleteOpen(false)
		}
	}

	return (
		<>
			<div className="p-4 bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-3">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-blue-100 dark:bg-blue-900">
								<Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<Link
										href={`/job-applications/${application._id}`}
										className="font-semibold text-lg text-zinc-900 dark:text-white hover:underline"
									>
										{application.job_title}
									</Link>
									<Badge
										className={
											statusColors[
												application.status as Exclude<JobStatus, "All">
											]
										}
										variant="secondary"
									>
										{application.status}
									</Badge>
									<Badge
										className={priorityColors[application.priority]}
										variant="secondary"
									>
										{application.priority}
									</Badge>
								</div>
								<p className="text-zinc-600 dark:text-zinc-400 font-medium">
									{application.company_name}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
							{statusAt && statusAtLabel && (
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									<span>
										{statusAtLabel} {format(new Date(statusAt), "MMM d, yyyy")}
									</span>
								</div>
							)}
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4" />
								<span>{locationText}</span>
							</div>
							{application.salary_range && (
								<div className="flex items-center gap-2">
									<Tag className="w-4 h-4" />
									<span>{application.salary_range}</span>
								</div>
							)}
							{application.application_method && (
								<div className="flex items-center gap-2">
									<span className="text-xs">
										Via: {application.application_method}
									</span>
								</div>
							)}
						</div>

						{application.job_description && (
							<div className="text-sm text-zinc-600 dark:text-zinc-400">
								<p className="font-medium mb-1">Job Description:</p>
								<p className="line-clamp-2">{application.job_description}</p>
								<Link
									href={`/job-applications/${application._id}`}
									className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5 inline-block"
								>
									View full description →
								</Link>
							</div>
						)}
						{application.notes && (
							<div className="text-sm text-zinc-600 dark:text-zinc-400">
								<p className="font-medium mb-1">Notes:</p>
								<p className="line-clamp-2">{application.notes}</p>
								<Link
									href={`/job-applications/${application._id}`}
									className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5 inline-block"
								>
									View full notes →
								</Link>
							</div>
						)}

						<div className="flex flex-col gap-2">
							{application.status_history.length > 0 && (
								<button
									onClick={() => setShowHistory(!showHistory)}
									className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-left"
								>
									{showHistory
										? "Hide status history"
										: `View ${application.status_history.length} status change${
												application.status_history.length !== 1 ? "s" : ""
											}`}
								</button>
							)}
							<button
								onClick={() => setShowInterviews(!showInterviews)}
								className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-left"
							>
								{showInterviews
									? "Hide interviews"
									: `View ${interviews.length} interview${
											interviews.length !== 1 ? "s" : ""
										}`}
							</button>
							<button
								onClick={() => setShowContacts(!showContacts)}
								className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-left"
							>
								{showContacts
									? "Hide contacts"
									: `View ${contacts.length} contact${
											contacts.length !== 1 ? "s" : ""
										}`}
							</button>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap items-center gap-2">
							<Link
								href={`/job-applications/${application._id}`}
								className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
							>
								View details
							</Link>
							{application.job_posting_url && (
								<a
									href={application.job_posting_url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
								>
									<ExternalLink className="w-4 h-4" />
									View Posting
								</a>
							)}
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsEditOpen(true)}
								className="flex items-center gap-1"
							>
								<Pencil className="w-4 h-4" />
								Edit
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsDeleteOpen(true)}
								className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
							>
								<Trash2 className="w-4 h-4" />
								Delete
							</Button>
						</div>
					</div>
				</div>
			</div>

			<EditJobApplicationForm
				application={application}
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>

			<ConfirmDialog
				open={isDeleteOpen}
				onOpenChange={handleDeleteDialogClose}
				onConfirm={handleDelete}
				title="Delete Job Application"
				description={`Are you sure you want to delete "${application.job_title}" at ${application.company_name}? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={deleteJobApplication.isPending}
			/>

			{showHistory && (
				<div className="mt-4 pt-4 border-t">
					<StatusHistoryTimeline application={application} />
				</div>
			)}

			{showInterviews && (
				<div className="mt-4 pt-4 border-t">
					<InterviewList
						jobApplicationId={application._id}
						interviews={interviews}
						onUpdate={refetchInterviews}
					/>
				</div>
			)}

			{showContacts && (
				<div className="mt-4 pt-4 border-t">
					<ContactList
						jobApplicationId={application._id}
						onUpdate={refetchContacts}
					/>
				</div>
			)}
		</>
	)
}
