import type { QueryClient } from "@tanstack/react-query"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { upcomingScheduledEmailsKeys } from "@/hooks/useUpcomingScheduledEmails"
import {
	type AddInteractionInput,
	apiClient,
	type ApplicationContact,
	type CreateContactInput,
	type UpdateContactInput,
} from "@/lib/api"

export const contactKeys = {
	all: ["contacts"] as const,
	lists: () => [...contactKeys.all, "list"] as const,
	byJobApplication: (jobApplicationId: string) =>
		[...contactKeys.all, "jobApplication", jobApplicationId] as const,
	detail: (id: string) => [...contactKeys.all, "detail", id] as const,
}

function findContactInCache(
	queryClient: QueryClient,
	contactId: string
): {
	jobApplicationId: string
	queryKey: readonly unknown[]
	previous: ApplicationContact[]
} | null {
	const pairs = queryClient.getQueriesData<ApplicationContact[]>({
		queryKey: contactKeys.all,
	})
	for (const [queryKey, arr] of pairs) {
		if (Array.isArray(arr)) {
			const c = arr.find((x) => x._id === contactId)
			if (c && queryKey[2]) {
				return {
					jobApplicationId: queryKey[2] as string,
					queryKey,
					previous: arr,
				}
			}
		}
	}
	return null
}

export function useContactsByJobApplication(jobApplicationId: string) {
	return useQuery({
		queryKey: contactKeys.byJobApplication(jobApplicationId),
		queryFn: async () => {
			const response =
				await apiClient.getContactsByJobApplicationId(jobApplicationId)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch contacts")
			}
			return response.data
		},
		enabled: !!jobApplicationId,
	})
}

export function useContact(id: string) {
	return useQuery({
		queryKey: contactKeys.detail(id),
		queryFn: async () => {
			const response = await apiClient.getContactById(id)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch contact")
			}
			return response.data
		},
		enabled: !!id,
	})
}

export function useCreateContact() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateContactInput) => {
			const response = await apiClient.createContact(data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to create contact")
			}
			return response.data
		},
		onMutate: async (newContact) => {
			await queryClient.cancelQueries({
				queryKey: contactKeys.byJobApplication(newContact.job_application_id),
			})

			const previous = queryClient.getQueryData<ApplicationContact[]>(
				contactKeys.byJobApplication(newContact.job_application_id)
			)

			const optimistic: ApplicationContact = {
				_id: `temp-${Date.now()}`,
				job_application_id: newContact.job_application_id,
				name: newContact.name,
				role: newContact.role,
				email: newContact.email,
				phone: newContact.phone,
				linkedin_url: newContact.linkedin_url,
				last_contacted_at: newContact.last_contacted_at
					? new Date(newContact.last_contacted_at).toISOString()
					: undefined,
				follow_up_reminder_at: newContact.follow_up_reminder_at
					? new Date(newContact.follow_up_reminder_at).toISOString()
					: undefined,
				interaction_history: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			queryClient.setQueryData<ApplicationContact[]>(
				contactKeys.byJobApplication(newContact.job_application_id),
				(old) => (old ? [...old, optimistic] : [optimistic])
			)

			return { previous }
		},
		onError: (error: Error, newContact, context) => {
			if (context?.previous !== undefined) {
				queryClient.setQueryData(
					contactKeys.byJobApplication(newContact.job_application_id),
					context.previous
				)
			}
			toast.error("Failed to add contact", { description: error.message })
		},
		onSuccess: (data) => {
			queryClient.setQueryData<ApplicationContact[]>(
				contactKeys.byJobApplication(data.job_application_id),
				(old) => {
					if (!old) {
						return old
					}
					return old.map((c) => (c._id.startsWith("temp-") ? data : c))
				}
			)
			toast.success("Contact added successfully!")
		},
		onSettled: async (data) => {
			if (data) {
				await queryClient.invalidateQueries({
					queryKey: contactKeys.byJobApplication(data.job_application_id),
				})
				await queryClient.invalidateQueries({
					queryKey: upcomingScheduledEmailsKeys.all,
				})
			}
		},
	})
}

export function useUpdateContact() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string
			data: UpdateContactInput
		}) => {
			const response = await apiClient.updateContact(id, data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to update contact")
			}
			return response.data
		},
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: contactKeys.all })

			const previousDetail = queryClient.getQueryData<ApplicationContact>(
				contactKeys.detail(id)
			)
			const found = findContactInCache(queryClient, id)

			if (found) {
				queryClient.setQueryData<ApplicationContact[]>(
					found.queryKey,
					(old) => {
						if (!old) {
							return old
						}
						const now = new Date().toISOString()
						return old.map((c) =>
							c._id === id
								? {
										...c,
										...data,
										last_contacted_at:
											data.last_contacted_at !== undefined
												? new Date(data.last_contacted_at).toISOString()
												: c.last_contacted_at,
										follow_up_reminder_at:
											data.follow_up_reminder_at !== undefined
												? new Date(data.follow_up_reminder_at).toISOString()
												: c.follow_up_reminder_at,
										updatedAt: now,
									}
								: c
						)
					}
				)
			}

			if (previousDetail) {
				queryClient.setQueryData<ApplicationContact>(
					contactKeys.detail(id),
					(old) => {
						if (!old) {
							return old
						}
						const now = new Date().toISOString()
						return {
							...old,
							...data,
							last_contacted_at:
								data.last_contacted_at !== undefined
									? new Date(data.last_contacted_at).toISOString()
									: old.last_contacted_at,
							follow_up_reminder_at:
								data.follow_up_reminder_at !== undefined
									? new Date(data.follow_up_reminder_at).toISOString()
									: old.follow_up_reminder_at,
							updatedAt: now,
						}
					}
				)
			}

			return { previousDetail, found }
		},
		onError: (error: Error, variables, context) => {
			if (context?.previousDetail !== undefined) {
				queryClient.setQueryData(
					contactKeys.detail(variables.id),
					context.previousDetail
				)
			}
			if (context?.found) {
				queryClient.setQueryData(context.found.queryKey, context.found.previous)
			}
			toast.error("Failed to update contact", { description: error.message })
		},
		onSuccess: (data) => {
			queryClient.setQueryData(contactKeys.detail(data._id), data)
			queryClient.setQueryData<ApplicationContact[]>(
				contactKeys.byJobApplication(data.job_application_id),
				(old) => {
					if (!old) {
						return old
					}
					return old.map((c) => (c._id === data._id ? data : c))
				}
			)
			toast.success("Contact updated successfully!")
		},
		onSettled: async (data) => {
			if (data) {
				await queryClient.invalidateQueries({
					queryKey: contactKeys.detail(data._id),
				})
				await queryClient.invalidateQueries({
					queryKey: contactKeys.byJobApplication(data.job_application_id),
				})
				await queryClient.invalidateQueries({
					queryKey: upcomingScheduledEmailsKeys.all,
				})
			}
		},
	})
}

export function useDeleteContact() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.deleteContact(id)
			if (!response.success) {
				throw new Error(response.message || "Failed to delete contact")
			}
			return id
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: contactKeys.all })

			const previousDetail = queryClient.getQueryData<ApplicationContact>(
				contactKeys.detail(id)
			)
			const found = findContactInCache(queryClient, id)

			if (found) {
				queryClient.setQueryData<ApplicationContact[]>(found.queryKey, (old) =>
					old ? old.filter((c) => c._id !== id) : []
				)
			}
			queryClient.removeQueries({ queryKey: contactKeys.detail(id) })

			return { previousDetail, found }
		},
		onError: (error: Error, id, context) => {
			if (context?.previousDetail !== undefined) {
				queryClient.setQueryData(contactKeys.detail(id), context.previousDetail)
			}
			if (context?.found) {
				queryClient.setQueryData(context.found.queryKey, context.found.previous)
			}
			toast.error("Failed to delete contact", { description: error.message })
		},
		onSuccess: () => {
			toast.success("Contact deleted successfully!")
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: contactKeys.all })
			await queryClient.invalidateQueries({
				queryKey: upcomingScheduledEmailsKeys.all,
			})
		},
	})
}

export function useAddContactInteraction() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			contactId,
			data,
		}: {
			contactId: string
			data: AddInteractionInput
		}) => {
			const response = await apiClient.addContactInteraction(contactId, data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to add interaction")
			}
			return response.data
		},
		onMutate: async ({ contactId, data }) => {
			await queryClient.cancelQueries({ queryKey: contactKeys.all })

			const previousDetail = queryClient.getQueryData<ApplicationContact>(
				contactKeys.detail(contactId)
			)
			const found = findContactInCache(queryClient, contactId)

			const interactionDate = data.date ? new Date(data.date) : new Date()
			const newInteraction = {
				date: interactionDate.toISOString(),
				type: data.type,
				notes: data.notes,
			}

			if (found) {
				queryClient.setQueryData<ApplicationContact[]>(
					found.queryKey,
					(old) => {
						if (!old) {
							return old
						}
						return old.map((c) =>
							c._id === contactId
								? {
										...c,
										interaction_history: [
											...c.interaction_history,
											newInteraction,
										],
										last_contacted_at: interactionDate.toISOString(),
										updatedAt: new Date().toISOString(),
									}
								: c
						)
					}
				)
			}

			if (previousDetail) {
				queryClient.setQueryData<ApplicationContact>(
					contactKeys.detail(contactId),
					(old) => {
						if (!old) {
							return old
						}
						return {
							...old,
							interaction_history: [...old.interaction_history, newInteraction],
							last_contacted_at: interactionDate.toISOString(),
							updatedAt: new Date().toISOString(),
						}
					}
				)
			}

			return { previousDetail, found }
		},
		onError: (error: Error, variables, context) => {
			if (context?.previousDetail !== undefined) {
				queryClient.setQueryData(
					contactKeys.detail(variables.contactId),
					context.previousDetail
				)
			}
			if (context?.found) {
				queryClient.setQueryData(context.found.queryKey, context.found.previous)
			}
			toast.error("Failed to add interaction", { description: error.message })
		},
		onSuccess: (data) => {
			queryClient.setQueryData(contactKeys.detail(data._id), data)
			queryClient.setQueryData<ApplicationContact[]>(
				contactKeys.byJobApplication(data.job_application_id),
				(old) => {
					if (!old) {
						return old
					}
					return old.map((c) => (c._id === data._id ? data : c))
				}
			)
			toast.success("Interaction recorded!")
		},
		onSettled: async (data) => {
			if (data) {
				await queryClient.invalidateQueries({
					queryKey: contactKeys.byJobApplication(data.job_application_id),
				})
				await queryClient.invalidateQueries({
					queryKey: contactKeys.detail(data._id),
				})
			}
		},
	})
}
