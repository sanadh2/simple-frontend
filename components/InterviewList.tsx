"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
	Calendar,
	Clock,
	Edit,
	MapPin,
	Phone,
	Trash2,
	User,
	Video,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { upcomingScheduledEmailsKeys } from "@/hooks/useUpcomingScheduledEmails"
import {
	type Interview,
	type InterviewFormat,
	type InterviewType,
} from "@/lib/api"
import { apiClient } from "@/lib/api"

import InterviewForm from "./InterviewForm"

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

interface InterviewListProps {
	jobApplicationId: string
	interviews: Interview[]
	onUpdate?: () => void
}

export default function InterviewList({
	jobApplicationId,
	interviews,
	onUpdate,
}: InterviewListProps) {
	const queryClient = useQueryClient()
	const [formState, setFormState] = useState<{
		isOpen: boolean
		editingInterview: Interview | null
	}>({
		isOpen: false,
		editingInterview: null,
	})
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [interviewToDelete, setInterviewToDelete] = useState<string | null>(
		null
	)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDeleteClick = (interviewId: string) => {
		setInterviewToDelete(interviewId)
		setIsDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!interviewToDelete) {
			return
		}

		setIsDeleting(true)
		try {
			await apiClient.deleteInterview(interviewToDelete)
			toast.success("Interview deleted successfully")
			await queryClient.invalidateQueries({
				queryKey: upcomingScheduledEmailsKeys.all,
			})
			onUpdate?.()
		} catch (error) {
			toast.error("Failed to delete interview", {
				description: error instanceof Error ? error.message : "Unknown error",
			})
			throw error
		} finally {
			setIsDeleting(false)
			setInterviewToDelete(null)
		}
	}

	const handleDeleteDialogClose = () => {
		if (!isDeleting) {
			setIsDeleteDialogOpen(false)
			setInterviewToDelete(null)
		}
	}

	const handleEdit = (interview: Interview) => {
		setFormState({
			isOpen: true,
			editingInterview: interview,
		})
	}

	const handleFormClose = () => {
		setFormState({
			isOpen: false,
			editingInterview: null,
		})
	}

	const handleFormSuccess = async () => {
		handleFormClose()
		await queryClient.invalidateQueries({
			queryKey: upcomingScheduledEmailsKeys.all,
		})
		onUpdate?.()
	}

	const sortedInterviews = [...interviews].sort(
		(a, b) =>
			new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
	)

	if (sortedInterviews.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Interviews</CardTitle>
					<CardDescription>
						No interviews scheduled yet. Add your first interview below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={() =>
							setFormState({ isOpen: true, editingInterview: null })
						}
						className="w-full"
					>
						Add Interview
					</Button>
					<InterviewForm
						key={`${jobApplicationId}-${formState.editingInterview?._id ?? "new"}-${formState.isOpen}`}
						jobApplicationId={jobApplicationId}
						interview={formState.editingInterview ?? undefined}
						open={formState.isOpen}
						onOpenChange={(open) =>
							setFormState({ isOpen: open, editingInterview: null })
						}
						onSuccess={handleFormSuccess}
					/>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Interviews</CardTitle>
						<CardDescription>
							{sortedInterviews.length} interview
							{sortedInterviews.length !== 1 ? "s" : ""} scheduled
						</CardDescription>
					</div>
					<Button
						onClick={() =>
							setFormState({ isOpen: true, editingInterview: null })
						}
					>
						Add Interview
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{sortedInterviews.map((interview) => {
						const FormatIcon = FORMAT_ICONS[interview.interview_format]
						const scheduledDate = new Date(interview.scheduled_at)
						const isPast = scheduledDate < new Date()

						return (
							<div
								key={interview._id}
								className={`border p-4 ${isPast ? "opacity-60" : ""}`}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<FormatIcon className="h-4 w-4 text-muted-foreground" />
											<span className="font-semibold">
												{INTERVIEW_TYPE_LABELS[interview.interview_type]}
											</span>
											{isPast && (
												<span className="text-xs text-muted-foreground">
													(Completed)
												</span>
											)}
										</div>

										<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{format(scheduledDate, "MMM d, yyyy")}
											</div>
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{format(scheduledDate, "h:mm a")}
											</div>
											{interview.duration_minutes && (
												<span>{interview.duration_minutes} min</span>
											)}
										</div>

										{(interview.interviewer_name ??
											interview.interviewer_role) && (
											<div className="flex items-center gap-1 text-sm text-muted-foreground">
												<User className="h-3 w-3" />
												{interview.interviewer_name}
												{interview.interviewer_name &&
													interview.interviewer_role &&
													" • "}
												{interview.interviewer_role}
											</div>
										)}

										{interview.notes && (
											<div className="text-sm">
												<span className="font-medium">Notes: </span>
												<span className="text-muted-foreground">
													{interview.notes}
												</span>
											</div>
										)}

										{interview.feedback && (
											<div className="text-sm">
												<span className="font-medium">Feedback: </span>
												<span className="text-muted-foreground">
													{interview.feedback}
												</span>
											</div>
										)}

										{interview.preparation_checklist &&
											interview.preparation_checklist.length > 0 && (
												<div className="text-sm">
													<span className="font-medium">
														Preparation Checklist:
													</span>
													<ul className="list-disc list-inside mt-1 text-muted-foreground">
														{interview.preparation_checklist.map((item) => (
															<li key={item}>{item}</li>
														))}
													</ul>
												</div>
											)}
									</div>

									<div className="flex gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEdit(interview)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDeleteClick(interview._id)}
											disabled={isDeleting}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						)
					})}
				</div>

				<InterviewForm
					key={`${jobApplicationId}-${formState.editingInterview?._id ?? "new"}-${formState.isOpen}`}
					jobApplicationId={jobApplicationId}
					interview={formState.editingInterview ?? undefined}
					open={formState.isOpen}
					onOpenChange={(open) => {
						if (!open) {
							handleFormClose()
						}
					}}
					onSuccess={handleFormSuccess}
				/>

				<ConfirmDialog
					open={isDeleteDialogOpen}
					onOpenChange={handleDeleteDialogClose}
					onConfirm={handleDeleteConfirm}
					title="Delete Interview"
					description="Are you sure you want to delete this interview? This action cannot be undone."
					confirmText="Delete"
					cancelText="Cancel"
					variant="destructive"
					isLoading={isDeleting}
				/>
			</CardContent>
		</Card>
	)
}
