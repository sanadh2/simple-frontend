"use client"

import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	type CreateInterviewInput,
	type Interview,
	type InterviewFormat,
	type InterviewType,
	type UpdateInterviewInput,
} from "@/lib/api"
import { apiClient } from "@/lib/api"

const interviewSchema = z.object({
	job_application_id: z.string().min(1, "Job application ID is required"),
	interview_type: z.enum([
		"phone_screen",
		"technical",
		"behavioral",
		"system_design",
		"hr",
		"final",
	]),
	scheduled_at: z.string().min(1, "Scheduled date and time is required"),
	interviewer_name: z.string().optional(),
	interviewer_role: z.string().optional(),
	interview_format: z.enum(["phone", "video", "in_person"]),
	duration_minutes: z.number().min(1).optional(),
	notes: z.string().optional(),
	feedback: z.string().optional(),
	preparation_checklist: z.array(z.string()).optional(),
})

type InterviewFormValues = z.infer<typeof interviewSchema>

const INTERVIEW_TYPE_OPTIONS: { value: InterviewType; label: string }[] = [
	{ value: "phone_screen", label: "Phone Screen" },
	{ value: "technical", label: "Technical" },
	{ value: "behavioral", label: "Behavioral" },
	{ value: "system_design", label: "System Design" },
	{ value: "hr", label: "HR" },
	{ value: "final", label: "Final" },
]

const INTERVIEW_FORMAT_OPTIONS: { value: InterviewFormat; label: string }[] = [
	{ value: "phone", label: "Phone" },
	{ value: "video", label: "Video" },
	{ value: "in_person", label: "In Person" },
]

const DATETIME_LOCAL_LENGTH = 16

const formatDateTimeLocal = (date: string): string => {
	return new Date(date).toISOString().slice(0, DATETIME_LOCAL_LENGTH)
}

const getSubmitButtonText = (
	isSubmitting: boolean,
	isEditing: boolean
): string => {
	if (isSubmitting) {
		return isEditing ? "Updating..." : "Creating..."
	}
	return isEditing ? "Update Interview" : "Create Interview"
}

interface InterviewFormProps {
	jobApplicationId: string
	interview?: Interview
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess?: () => void
}

export default function InterviewForm({
	jobApplicationId,
	interview,
	open,
	onOpenChange,
	onSuccess,
}: InterviewFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [checklistItems, setChecklistItems] = useState<string[]>(
		interview?.preparation_checklist ?? []
	)
	const [newChecklistItem, setNewChecklistItem] = useState("")

	const getDefaultValues: () => InterviewFormValues = useCallback(() => {
		if (!interview) {
			return {
				job_application_id: jobApplicationId,
				interview_type: "phone_screen",
				scheduled_at: "",
				interviewer_name: "",
				interviewer_role: "",
				interview_format: "video",
				duration_minutes: undefined,
				notes: "",
				feedback: "",
				preparation_checklist: [],
			}
		}
		return {
			job_application_id: jobApplicationId,
			interview_type: interview.interview_type,
			scheduled_at: interview.scheduled_at
				? formatDateTimeLocal(interview.scheduled_at)
				: "",
			interviewer_name: interview.interviewer_name ?? "",
			interviewer_role: interview.interviewer_role ?? "",
			interview_format: interview.interview_format,
			duration_minutes: interview.duration_minutes,
			notes: interview.notes ?? "",
			feedback: interview.feedback ?? "",
			preparation_checklist: interview.preparation_checklist ?? [],
		}
	}, [interview, jobApplicationId])

	const form = useForm<InterviewFormValues>({
		resolver: zodResolver(interviewSchema),
		defaultValues: getDefaultValues(),
	})

	const addChecklistItem = () => {
		const trimmedItem = newChecklistItem.trim()
		if (!trimmedItem) {
			return
		}

		// Check for duplicates (case-insensitive)
		const isDuplicate = checklistItems.some(
			(item) => item.toLowerCase() === trimmedItem.toLowerCase()
		)

		if (isDuplicate) {
			toast.error("This item already exists in the checklist")
			return
		}

		const updated = [...checklistItems, trimmedItem]
		setChecklistItems(updated)
		form.setValue("preparation_checklist", updated)
		setNewChecklistItem("")
	}

	const removeChecklistItem = (index: number) => {
		const updated = checklistItems.filter((_, i) => i !== index)
		setChecklistItems(updated)
		form.setValue("preparation_checklist", updated)
	}

	const handleSubmitSuccess = () => {
		onOpenChange(false)
		form.reset()
		setChecklistItems([])
		onSuccess?.()
	}

	const submitInterview = async (
		payload: CreateInterviewInput | UpdateInterviewInput
	) => {
		if (interview) {
			await apiClient.updateInterview(interview._id, payload)
			toast.success("Interview updated successfully")
		} else {
			await apiClient.createInterview(payload as CreateInterviewInput)
			toast.success("Interview created successfully")
		}
	}

	const onSubmit = async (data: InterviewFormValues) => {
		setIsSubmitting(true)
		try {
			const payload: CreateInterviewInput | UpdateInterviewInput = {
				...data,
				preparation_checklist: checklistItems,
				scheduled_at: new Date(data.scheduled_at).toISOString(),
			}

			await submitInterview(payload)
			handleSubmitSuccess()
		} catch (error) {
			const action = interview ? "update" : "create"
			toast.error(`Failed to ${action} interview`, {
				description: error instanceof Error ? error.message : "Unknown error",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className=" max-w-[min(90vw,500px)] max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{interview ? "Edit Interview" : "Add Interview"}
					</DialogTitle>
					<DialogDescription>
						{interview
							? "Update the interview details"
							: "Schedule a new interview for this job application"}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col flex-1 min-h-0"
					>
						<div className="flex-1 overflow-y-auto space-y-6 pr-1">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="interview_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Interview Type *</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select interview type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{INTERVIEW_TYPE_OPTIONS.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="interview_format"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Interview Format *</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select format" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{INTERVIEW_FORMAT_OPTIONS.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="scheduled_at"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Date & Time *</FormLabel>
											<FormControl>
												<Input type="datetime-local" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="duration_minutes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (minutes)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="e.g., 60"
													value={field.value ?? ""}
													onChange={(e) =>
														field.onChange(
															e.target.value
																? parseInt(e.target.value, 10)
																: undefined
														)
													}
													onBlur={field.onBlur}
													name={field.name}
													ref={field.ref}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="interviewer_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Interviewer Name</FormLabel>
											<FormControl>
												<Input placeholder="e.g., John Doe" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="interviewer_role"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Interviewer Role</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Senior Engineer" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Notes</FormLabel>
										<FormControl>
											<textarea
												{...field}
												rows={4}
												className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder="Add any notes or preparation details..."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="feedback"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Feedback (after interview)</FormLabel>
										<FormControl>
											<textarea
												{...field}
												rows={4}
												className="flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder="Add feedback after the interview..."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-2">
								<Label>Preparation Checklist</Label>
								<div className="flex gap-2">
									<Input
										value={newChecklistItem}
										onChange={(e) => setNewChecklistItem(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault()
												addChecklistItem()
											}
										}}
										placeholder="Add checklist item..."
										className="flex-1"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={addChecklistItem}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								{checklistItems.length > 0 && (
									<div className="space-y-2 mt-2">
										{checklistItems.map((item, index) => (
											<div
												key={`checklist-item-${item}`}
												className="flex items-center gap-2 p-2 bg-muted"
											>
												<span className="flex-1 text-sm">{item}</span>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeChecklistItem(index)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						<DialogFooter className="mt-4 shrink-0 border-t pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{getSubmitButtonText(isSubmitting, !!interview)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
