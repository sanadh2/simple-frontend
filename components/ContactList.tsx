"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
	Bell,
	Calendar,
	Edit,
	ExternalLink,
	Mail,
	MessageSquare,
	Phone,
	Trash2,
	User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	useAddContactInteraction,
	useContactsByJobApplication,
	useCreateContact,
	useDeleteContact,
	useUpdateContact,
} from "@/hooks/useContacts"
import type { ApplicationContact, CreateContactInput } from "@/lib/api"

import ContactForm from "./ContactForm"

const INTERACTION_TYPES = [
	{ value: "", label: "—" },
	{ value: "email", label: "Email" },
	{ value: "phone", label: "Phone" },
	{ value: "linkedin", label: "LinkedIn" },
	{ value: "meeting", label: "Meeting" },
	{ value: "other", label: "Other" },
]

interface ContactListProps {
	jobApplicationId: string
	onUpdate?: () => void
}

export default function ContactList({
	jobApplicationId,
	onUpdate: _onUpdate,
}: ContactListProps) {
	const { data: contacts = [] } = useContactsByJobApplication(jobApplicationId)
	const createContact = useCreateContact()
	const updateContact = useUpdateContact()
	const deleteContact = useDeleteContact()
	const addInteraction = useAddContactInteraction()

	const [formState, setFormState] = useState<{
		isOpen: boolean
		editing: ApplicationContact | null
	}>({ isOpen: false, editing: null })
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
	const [interactionTarget, setInteractionTarget] =
		useState<ApplicationContact | null>(null)
	const [interactionNotes, setInteractionNotes] = useState("")
	const [interactionType, setInteractionType] = useState("")
	const [interactionDate, setInteractionDate] = useState(
		format(new Date(), "yyyy-MM-dd")
	)

	const handleFormSuccess = () => {
		setFormState({ isOpen: false, editing: null })
	}

	const handleCreate = (data: CreateContactInput) => {
		createContact.mutate(data)
		return Promise.resolve()
	}

	const handleUpdate = (payload: {
		id: string
		data: Parameters<typeof updateContact.mutate>[0]["data"]
	}) => {
		updateContact.mutate(payload)
		return Promise.resolve()
	}

	const handleDeleteConfirm = () => {
		const id = deleteTarget
		if (!id) {
			return
		}
		setDeleteTarget(null)
		deleteContact.mutate(id)
	}

	const handleAddInteraction = () => {
		if (!interactionTarget) {
			return
		}
		const vars = {
			contactId: interactionTarget._id,
			data: {
				date: interactionDate
					? new Date(interactionDate).toISOString()
					: undefined,
				type: interactionType || undefined,
				notes: interactionNotes || undefined,
			},
		}
		setInteractionTarget(null)
		setInteractionNotes("")
		setInteractionType("")
		setInteractionDate(format(new Date(), "yyyy-MM-dd"))
		addInteraction.mutate(vars)
	}

	const openInteractionDialog = (contact: ApplicationContact) => {
		setInteractionTarget(contact)
		setInteractionNotes("")
		setInteractionType("")
		setInteractionDate(format(new Date(), "yyyy-MM-dd"))
	}

	if (contacts.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Contacts &amp; Recruiters</CardTitle>
					<CardDescription>
						No contacts yet. Add recruiters or hiring managers to track
						interactions and follow-ups.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={() => setFormState({ isOpen: true, editing: null })}
						className="w-full"
					>
						Add Contact
					</Button>
					<ContactForm
						jobApplicationId={jobApplicationId}
						contact={null}
						open={formState.isOpen}
						onOpenChange={(open) =>
							setFormState({ isOpen: open, editing: null })
						}
						onSuccess={handleFormSuccess}
						onSubmit={(d) => handleCreate(d as CreateContactInput)}
						isSubmitting={createContact.isPending}
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
						<CardTitle>Contacts &amp; Recruiters</CardTitle>
						<CardDescription>
							{contacts.length} contact{contacts.length !== 1 ? "s" : ""}{" "}
							{contacts.length !== 1 ? "linked" : "linked"} to this application
						</CardDescription>
					</div>
					<Button onClick={() => setFormState({ isOpen: true, editing: null })}>
						Add Contact
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{contacts.map((contact) => {
						const isOverdue =
							contact.follow_up_reminder_at &&
							new Date(contact.follow_up_reminder_at) < new Date()

						return (
							<div
								key={contact._id}
								className="border rounded-lg p-4 space-y-3"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<User className="h-4 w-4 text-muted-foreground shrink-0" />
											<span className="font-semibold">{contact.name}</span>
											{contact.role && (
												<span className="text-sm text-muted-foreground">
													({contact.role})
												</span>
											)}
										</div>
										<div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
											{contact.email && (
												<a
													href={`mailto:${contact.email}`}
													className="inline-flex items-center gap-1 hover:underline"
												>
													<Mail className="h-3 w-3" />
													{contact.email}
												</a>
											)}
											{contact.phone && (
												<span className="inline-flex items-center gap-1">
													<Phone className="h-3 w-3" />
													{contact.phone}
												</span>
											)}
											{contact.linkedin_url && (
												<a
													href={contact.linkedin_url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 hover:underline"
												>
													<ExternalLink className="h-3 w-3" />
													LinkedIn
												</a>
											)}
										</div>
										<div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
											{contact.last_contacted_at && (
												<span className="inline-flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													Last contacted:{" "}
													{format(
														new Date(contact.last_contacted_at),
														"MMM d, yyyy"
													)}
												</span>
											)}
											{contact.follow_up_reminder_at && (
												<span
													className={`inline-flex items-center gap-1 ${
														isOverdue
															? "text-amber-600 dark:text-amber-400"
															: ""
													}`}
												>
													<Bell className="h-3 w-3" />
													Follow-up:{" "}
													{format(
														new Date(contact.follow_up_reminder_at),
														"MMM d, yyyy"
													)}
													{isOverdue && " (overdue)"}
												</span>
											)}
										</div>
									</div>
									<div className="flex gap-1 shrink-0">
										<Button
											variant="ghost"
											size="sm"
											title="Log interaction"
											onClick={() => openInteractionDialog(contact)}
										>
											<MessageSquare className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												setFormState({ isOpen: true, editing: contact })
											}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setDeleteTarget(contact._id)}
											className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{contact.interaction_history.length > 0 && (
									<div className="pt-2 border-t">
										<p className="text-xs font-medium text-muted-foreground mb-1">
											Interaction history
										</p>
										<ul className="space-y-1 text-sm">
											{[...contact.interaction_history]
												.sort(
													(a, b) =>
														new Date(b.date).getTime() -
														new Date(a.date).getTime()
												)
												.slice(0, 5)
												.map((i) => (
													<li
														key={i.type?.toString() + i.date.toString()}
														className="flex gap-2"
													>
														<span className="text-muted-foreground shrink-0">
															{format(new Date(i.date), "MMM d")}
															{i.type && ` · ${i.type}`}:
														</span>
														<span className="line-clamp-1">
															{i.notes ?? "—"}
														</span>
													</li>
												))}
											{contact.interaction_history.length > 5 && (
												<li className="text-muted-foreground text-xs">
													+{contact.interaction_history.length - 5} more
												</li>
											)}
										</ul>
									</div>
								)}
							</div>
						)
					})}
				</div>

				<ContactForm
					jobApplicationId={jobApplicationId}
					contact={formState.editing}
					open={formState.isOpen}
					onOpenChange={(open) => setFormState({ isOpen: open, editing: null })}
					onSuccess={handleFormSuccess}
					onSubmit={
						formState.editing
							? (d) =>
									handleUpdate({
										id: formState.editing?._id ?? "",
										data: d,
									})
							: (d) => handleCreate(d as CreateContactInput)
					}
					isSubmitting={createContact.isPending || updateContact.isPending}
				/>

				<Dialog
					open={!!interactionTarget}
					onOpenChange={(open) => {
						if (!open) {
							setInteractionTarget(null)
						}
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Log Interaction</DialogTitle>
							<DialogDescription>
								Record a contact with {interactionTarget?.name}. This updates
								&quot;Last contacted&quot;.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-2">
							<div>
								<Label>Date</Label>
								<Input
									type="date"
									value={interactionDate}
									onChange={(e) => setInteractionDate(e.target.value)}
								/>
							</div>
							<div>
								<Label>Type</Label>
								<select
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									value={interactionType}
									onChange={(e) => setInteractionType(e.target.value)}
								>
									{INTERACTION_TYPES.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
							</div>
							<div>
								<Label>Notes</Label>
								<textarea
									className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									placeholder="e.g., Discussed next steps, sent follow-up..."
									value={interactionNotes}
									onChange={(e) => setInteractionNotes(e.target.value)}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setInteractionTarget(null)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleAddInteraction}
								disabled={addInteraction.isPending}
							>
								{addInteraction.isPending ? "Saving..." : "Add Interaction"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<ConfirmDialog
					open={!!deleteTarget}
					onOpenChange={(open) => {
						if (!open && !deleteContact.isPending) {
							setDeleteTarget(null)
						}
					}}
					onConfirm={handleDeleteConfirm}
					title="Delete Contact"
					description="Are you sure you want to delete this contact? Interaction history will be removed."
					confirmText="Delete"
					cancelText="Cancel"
					variant="destructive"
					isLoading={deleteContact.isPending}
				/>
			</CardContent>
		</Card>
	)
}
