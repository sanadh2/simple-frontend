"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import {
	ArrowLeft,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
	useDeleteJobApplication,
	useJobApplication,
} from "@/hooks/useJobApplications"
import type { JobStatus, PriorityLevel } from "@/lib/api"

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

const locationLabels: Record<string, string> = {
	remote: "Remote",
	hybrid: "Hybrid",
	onsite: "Onsite",
}

export default function JobApplicationDetailPage() {
	const params = useParams()
	const router = useRouter()
	const id = typeof params?.id === "string" ? params.id : ""
	const { data: application, isLoading, error } = useJobApplication(id)
	const deleteJob = useDeleteJobApplication()
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)

	if (isLoading) {
		return <LoadingSpinner text="Loading application..." />
	}

	if (error || !application) {
		return (
			<div className="container mx-auto py-8 px-4">
				<Link
					href="/job-applications"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to applications
				</Link>
				<Card>
					<CardContent className="pt-6">
						<p className="text-red-600 dark:text-red-400">
							{error instanceof Error ? error.message : "Application not found"}
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	const app = application
	let locationText: string
	if (app.location_type === "remote") {
		locationText = "Remote"
	} else if (app.location_city) {
		locationText = `${locationLabels[app.location_type] ?? app.location_type} – ${app.location_city}`
	} else {
		locationText = locationLabels[app.location_type] ?? app.location_type
	}

	const handleDelete = async () => {
		await deleteJob.mutateAsync(app._id, {
			onSuccess: () => {
				setIsDeleteOpen(false)
				router.push("/job-applications")
			},
		})
	}

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
			<div className="flex items-center justify-between gap-4">
				<Link
					href="/job-applications"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to applications
				</Link>
				<div className="flex gap-2">
					{app.job_posting_url && (
						<a
							href={app.job_posting_url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
						>
							<ExternalLink className="h-4 w-4" />
							View posting
						</a>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsEditOpen(true)}
						className="flex items-center gap-1"
					>
						<Pencil className="h-4 w-4" />
						Edit
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsDeleteOpen(true)}
						className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
					>
						<Trash2 className="h-4 w-4" />
						Delete
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-start gap-3">
						<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
							<Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="flex-1 min-w-0">
							<CardTitle className="text-xl">{app.job_title}</CardTitle>
							<p className="text-muted-foreground font-medium mt-1">
								{app.company_name}
							</p>
							<div className="flex flex-wrap gap-2 mt-2">
								<Badge
									className={
										statusColors[app.status as Exclude<JobStatus, "All">]
									}
									variant="secondary"
								>
									{app.status}
								</Badge>
								<Badge
									className={priorityColors[app.priority]}
									variant="secondary"
								>
									{app.priority}
								</Badge>
								{app.application_method && (
									<Badge variant="outline">{app.application_method}</Badge>
								)}
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Meta row */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 shrink-0" />
							<span>
								Applied: {format(new Date(app.application_date), "PPP")}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<MapPin className="h-4 w-4 shrink-0" />
							<span>{locationText}</span>
						</div>
						{app.salary_range && (
							<div className="flex items-center gap-2">
								<Tag className="h-4 w-4 shrink-0" />
								<span>{app.salary_range}</span>
							</div>
						)}
					</div>

					{/* Job description - full, scrollable */}
					{app.job_description && (
						<div>
							<h3 className="font-semibold text-foreground mb-2">
								Job Description
							</h3>
							<div
								className="rounded-lg border bg-muted/30 dark:bg-muted/10 p-4 max-h-112 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap"
								style={{ wordBreak: "break-word" }}
							>
								{app.job_description}
							</div>
						</div>
					)}

					{/* Notes */}
					{app.notes && (
						<div>
							<h3 className="font-semibold text-foreground mb-2">Notes</h3>
							<div className="rounded-lg border bg-muted/30 dark:bg-muted/10 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
								{app.notes}
							</div>
						</div>
					)}

					{/* Resume / Cover letter */}
					{(app.resume_url ?? app.cover_letter_url) && (
						<div className="flex flex-wrap gap-4">
							{app.resume_url && (
								<a
									href={app.resume_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
								>
									Resume
								</a>
							)}
							{app.cover_letter_url && (
								<a
									href={app.cover_letter_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
								>
									Cover letter
								</a>
							)}
						</div>
					)}

					{/* Status history */}
					{app.status_history.length > 0 && (
						<div>
							<h3 className="font-semibold text-foreground mb-2">
								Status History
							</h3>
							<StatusHistoryTimeline application={app} />
						</div>
					)}

					{/* Timestamps */}
					<div className="text-xs text-muted-foreground border-t pt-4">
						Created {format(new Date(app.createdAt), "PPp")}
						{app.updatedAt !== app.createdAt && (
							<> · Updated {format(new Date(app.updatedAt), "PPp")}</>
						)}
					</div>
				</CardContent>
			</Card>

			<EditJobApplicationForm
				application={app}
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>

			<ConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				onConfirm={handleDelete}
				title="Delete Job Application"
				description={`Are you sure you want to delete "${app.job_title}" at ${app.company_name}? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={deleteJob.isPending}
			/>
		</div>
	)
}
