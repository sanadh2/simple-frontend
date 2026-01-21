"use client"

import { useState } from "react"
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

import EditJobApplicationForm from "@/components/EditJobApplicationForm"
import LoadingSpinner from "@/components/LoadingSpinner"
import StatusHistoryTimeline from "@/components/StatusHistoryTimeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	useDeleteJobApplication,
	useJobApplications,
} from "@/hooks/useJobApplications"
import type { JobApplication, JobStatus, PriorityLevel } from "@/lib/api"

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

interface JobApplicationsListProps {
	filters?: {
		search?: string
		status?: JobStatus
		startDate?: string
		endDate?: string
		sortBy?: string
		sortOrder?: "asc" | "desc"
		limit?: number
	}
}

export default function JobApplicationsList({
	filters,
}: JobApplicationsListProps) {
	const { data, isLoading, error } = useJobApplications(filters)

	if (isLoading) {
		return <LoadingSpinner text="Loading job applications..." />
	}

	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-red-600 dark:text-red-400">
						Error loading job applications: {error.message}
					</p>
				</CardContent>
			</Card>
		)
	}

	if (!data || data.applications.length === 0) {
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

function JobApplicationCard({ application }: { application: JobApplication }) {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const deleteJobApplication = useDeleteJobApplication()

	const locationText =
		application.location_type === "remote"
			? "Remote"
			: `${locationTypeLabels[application.location_type]}${
					application.location_city ? ` - ${application.location_city}` : ""
				}`

	const handleDelete = async () => {
		await deleteJobApplication.mutateAsync(application._id, {
			onSuccess: () => {
				setIsDeleteOpen(false)
			},
		})
	}

	return (
		<>
			<div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-3">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-blue-100 dark:bg-blue-900">
								<Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
										{application.job_title}
									</h3>
									<Badge
										className={statusColors[application.status]}
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
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								<span>
									Applied:{" "}
									{format(
										new Date(application.application_date),
										"MMM d, yyyy"
									)}
								</span>
							</div>
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
							</div>
						)}
						{application.notes && (
							<div className="text-sm text-zinc-600 dark:text-zinc-400">
								<p className="font-medium mb-1">Notes:</p>
								<p className="line-clamp-2">{application.notes}</p>
							</div>
						)}

						{application.status_history.length > 0 && (
							<button
								onClick={() => setShowHistory(!showHistory)}
								className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
							>
								{showHistory
									? "Hide status history"
									: `View ${application.status_history.length} status change${
											application.status_history.length !== 1 ? "s" : ""
										}`}
							</button>
						)}
					</div>

					<div className="flex flex-col gap-2">
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

			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Job Application</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this job application? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							<strong>{application.job_title}</strong> at{" "}
							<strong>{application.company_name}</strong>
						</p>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteOpen(false)}
							disabled={deleteJobApplication.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteJobApplication.isPending}
						>
							{deleteJobApplication.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{showHistory && (
				<div className="mt-4 pt-4 border-t">
					<StatusHistoryTimeline application={application} />
				</div>
			)}
		</>
	)
}
