"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { X, FileText } from "lucide-react"

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
import type {
	JobApplication,
	JobStatus,
	LocationType,
	PriorityLevel,
	UpdateJobApplicationInput,
} from "@/lib/api"
import { apiClient } from "@/lib/api"
import { useUpdateJobApplication } from "@/hooks/useJobApplications"

const jobApplicationSchema = z.object({
	company_name: z.string().min(1, "Company name is required"),
	job_title: z.string().min(1, "Job title is required"),
	job_description: z.string().optional(),
	notes: z.string().optional(),
	application_date: z.string().min(1, "Application date is required"),
	status: z.enum([
		"Wishlist",
		"Applied",
		"Interview Scheduled",
		"Interviewing",
		"Offer",
		"Rejected",
		"Accepted",
		"Withdrawn",
	]),
	salary_range: z.string().optional(),
	location_type: z.enum(["remote", "hybrid", "onsite"]),
	location_city: z.string().optional(),
	job_posting_url: z
		.string()
		.refine(
			(val) => !val || z.string().url().safeParse(val).success,
			"Invalid URL format"
		)
		.optional()
		.or(z.literal("")),
	application_method: z.string().optional(),
	priority: z.enum(["high", "medium", "low"]),
	resume_url: z
		.string()
		.refine(
			(val) => !val || z.string().url().safeParse(val).success,
			"Invalid URL format"
		)
		.optional()
		.or(z.literal("")),
	cover_letter_url: z
		.string()
		.refine(
			(val) => !val || z.string().url().safeParse(val).success,
			"Invalid URL format"
		)
		.optional()
		.or(z.literal("")),
})

type JobApplicationFormValues = z.infer<typeof jobApplicationSchema>

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
	{ value: "Wishlist", label: "Wishlist" },
	{ value: "Applied", label: "Applied" },
	{ value: "Interview Scheduled", label: "Interview Scheduled" },
	{ value: "Interviewing", label: "Interviewing" },
	{ value: "Offer", label: "Offer" },
	{ value: "Rejected", label: "Rejected" },
	{ value: "Accepted", label: "Accepted" },
	{ value: "Withdrawn", label: "Withdrawn" },
]

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string }[] = [
	{ value: "high", label: "High" },
	{ value: "medium", label: "Medium" },
	{ value: "low", label: "Low" },
]

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string }[] = [
	{ value: "remote", label: "Remote" },
	{ value: "hybrid", label: "Hybrid" },
	{ value: "onsite", label: "Onsite" },
]

interface EditJobApplicationFormProps {
	application: JobApplication
	open: boolean
	onOpenChange: (open: boolean) => void
}

export default function EditJobApplicationForm({
	application,
	open,
	onOpenChange,
}: EditJobApplicationFormProps) {
	const updateJobApplication = useUpdateJobApplication()

	const form = useForm<JobApplicationFormValues>({
		resolver: zodResolver(jobApplicationSchema),
		defaultValues: {
			company_name: application.company_name,
			job_title: application.job_title,
			job_description: application.job_description || "",
			notes: application.notes || "",
			application_date: new Date(application.application_date)
				.toISOString()
				.split("T")[0],
			status: application.status,
			salary_range: application.salary_range || "",
			location_type: application.location_type,
			location_city: application.location_city || "",
			job_posting_url: application.job_posting_url || "",
			application_method: application.application_method || "",
			priority: application.priority,
		},
	})

	useEffect(() => {
		if (open) {
			form.reset({
				company_name: application.company_name,
				job_title: application.job_title,
				job_description: application.job_description || "",
				notes: application.notes || "",
				application_date: new Date(application.application_date)
					.toISOString()
					.split("T")[0],
				status: application.status,
				salary_range: application.salary_range || "",
				location_type: application.location_type,
				location_city: application.location_city || "",
				job_posting_url: application.job_posting_url || "",
				application_method: application.application_method || "",
				priority: application.priority,
			})
		}
	}, [open, application, form])

	const onSubmit = (data: JobApplicationFormValues) => {
		const payload: UpdateJobApplicationInput = {
			company_name: data.company_name,
			job_title: data.job_title,
			job_description: data.job_description || undefined,
			notes: data.notes || undefined,
			application_date: data.application_date,
			status: data.status,
			salary_range: data.salary_range || undefined,
			location_type: data.location_type,
			location_city: data.location_city || undefined,
			job_posting_url: data.job_posting_url || undefined,
			application_method: data.application_method || undefined,
			priority: data.priority,
		}

        updateJobApplication.mutate(
			{ id: application._id, data: payload },
			{ onSuccess: () => { onOpenChange(false) } }
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Job Application</DialogTitle>
					<DialogDescription>
						Update the details of your job application
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="company_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name *</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Google" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="job_title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Job Title *</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Software Engineer" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="application_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Application Date *</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status *</FormLabel>
										<FormControl>
											<select
												{...field}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{STATUS_OPTIONS.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Priority *</FormLabel>
										<FormControl>
											<select
												{...field}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{PRIORITY_OPTIONS.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="location_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Location Type *</FormLabel>
										<FormControl>
											<select
												{...field}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{LOCATION_TYPE_OPTIONS.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="location_city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>City</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., San Francisco"
												{...field}
												disabled={form.watch("location_type") === "remote"}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="salary_range"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Salary Range</FormLabel>
										<FormControl>
											<Input placeholder="e.g., $100k - $150k" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="application_method"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Application Method</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Company website, LinkedIn, Referral"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="job_posting_url"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Job Posting URL</FormLabel>
										<FormControl>
											<Input
												type="url"
												placeholder="https://..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="job_description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Job Description</FormLabel>
									<FormControl>
										<textarea
											{...field}
											rows={4}
											className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											placeholder="Paste or describe the job posting details..."
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
											className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											placeholder="Add your personal notes, reminders, or thoughts about this application..."
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={updateJobApplication.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateJobApplication.isPending}>
								{updateJobApplication.isPending ? "Updating..." : "Update Application"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
