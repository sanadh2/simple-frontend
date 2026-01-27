"use client"

import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import type {
	ApplicationContact,
	CreateContactInput,
	UpdateContactInput,
} from "@/lib/api"

const contactSchema = z.object({
	name: z.string().min(1, "Name is required"),
	role: z.string().optional(),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	phone: z.string().optional(),
	linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
	last_contacted_at: z.string().optional(),
	follow_up_reminder_at: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

const ISO_DATE_LENGTH = 10

const formatDateForInput = (date: string | undefined): string => {
	if (!date) {
		return ""
	}
	const d = new Date(date)
	if (Number.isNaN(d.getTime())) {
		return ""
	}
	return d.toISOString().slice(0, ISO_DATE_LENGTH)
}

interface ContactFormProps {
	jobApplicationId: string
	contact?: ApplicationContact | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess?: () => void
	onSubmit: (data: CreateContactInput | UpdateContactInput) => Promise<void>
	isSubmitting?: boolean
}

export default function ContactForm({
	jobApplicationId,
	contact,
	open,
	onOpenChange,
	onSuccess,
	onSubmit: submitFn,
	isSubmitting = false,
}: ContactFormProps) {
	const form = useForm<ContactFormValues>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			name: "",
			role: "",
			email: "",
			phone: "",
			linkedin_url: "",
			last_contacted_at: "",
			follow_up_reminder_at: "",
		},
	})

	const resetForm = useCallback(() => {
		form.reset(
			contact
				? {
						name: contact.name,
						role: contact.role ?? "",
						email: contact.email ?? "",
						phone: contact.phone ?? "",
						linkedin_url: contact.linkedin_url ?? "",
						last_contacted_at: formatDateForInput(contact.last_contacted_at),
						follow_up_reminder_at: formatDateForInput(
							contact.follow_up_reminder_at
						),
					}
				: {
						name: "",
						role: "",
						email: "",
						phone: "",
						linkedin_url: "",
						last_contacted_at: "",
						follow_up_reminder_at: "",
					}
		)
	}, [contact, form])

	useEffect(() => {
		if (open) {
			resetForm()
		}
	}, [open, resetForm])

	const onSubmit = async (data: ContactFormValues) => {
		const payload: CreateContactInput | UpdateContactInput = contact
			? {
					name: data.name,
					role: data.role ?? undefined,
					email: data.email ?? undefined,
					phone: data.phone ?? undefined,
					linkedin_url: data.linkedin_url ?? undefined,
					last_contacted_at: data.last_contacted_at
						? new Date(data.last_contacted_at).toISOString()
						: undefined,
					follow_up_reminder_at: data.follow_up_reminder_at
						? new Date(data.follow_up_reminder_at).toISOString()
						: undefined,
				}
			: {
					job_application_id: jobApplicationId,
					name: data.name,
					role: data.role ?? undefined,
					email: data.email ?? undefined,
					phone: data.phone ?? undefined,
					linkedin_url: data.linkedin_url ?? undefined,
					last_contacted_at: data.last_contacted_at
						? new Date(data.last_contacted_at).toISOString()
						: undefined,
					follow_up_reminder_at: data.follow_up_reminder_at
						? new Date(data.follow_up_reminder_at).toISOString()
						: undefined,
				}

		await submitFn(payload)
		onOpenChange(false)
		onSuccess?.()
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[min(90vw,500px)] max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{contact ? "Edit Contact" : "Add Contact / Recruiter"}
					</DialogTitle>
					<DialogDescription>
						{contact
							? "Update the contact details"
							: "Add a recruiter or contact for this application"}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col flex-1 min-h-0"
					>
						<div className="flex-1 overflow-y-auto space-y-4 pr-1">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name *</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Jane Smith" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Role</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Technical Recruiter"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="jane@company.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input placeholder="+1 234 567 8900" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="linkedin_url"
								render={({ field }) => (
									<FormItem>
										<FormLabel>LinkedIn</FormLabel>
										<FormControl>
											<Input
												placeholder="https://linkedin.com/in/..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="last_contacted_at"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last Contacted</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="follow_up_reminder_at"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Follow-up Reminder</FormLabel>
											<FormControl>
												<Input type="date" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
								{(() => {
									if (isSubmitting) {
										return "Saving..."
									}
									return contact ? "Update Contact" : "Add Contact"
								})()}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
