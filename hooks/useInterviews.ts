import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
	apiClient,
	type CreateInterviewInput,
	type Interview,
	type UpdateInterviewInput,
} from "@/lib/api"

export const interviewKeys = {
	all: ["interviews"] as const,
	lists: () => [...interviewKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) =>
		[...interviewKeys.lists(), { filters }] as const,
	details: () => [...interviewKeys.all, "detail"] as const,
	detail: (id: string) => [...interviewKeys.details(), id] as const,
	byJobApplication: (jobApplicationId: string) =>
		[...interviewKeys.all, "jobApplication", jobApplicationId] as const,
	upcoming: (days?: number) =>
		[...interviewKeys.all, "upcoming", days] as const,
}

export function useInterviews() {
	return useQuery({
		queryKey: interviewKeys.lists(),
		queryFn: async () => {
			const response = await apiClient.getInterviews()
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch interviews")
			}
			return response.data
		},
	})
}

export function useInterview(id: string) {
	return useQuery({
		queryKey: interviewKeys.detail(id),
		queryFn: async () => {
			const response = await apiClient.getInterviewById(id)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch interview")
			}
			return response.data
		},
		enabled: !!id,
	})
}

export function useInterviewsByJobApplication(jobApplicationId: string) {
	return useQuery({
		queryKey: interviewKeys.byJobApplication(jobApplicationId),
		queryFn: async () => {
			const response =
				await apiClient.getInterviewsByJobApplicationId(jobApplicationId)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch interviews")
			}
			return response.data
		},
		enabled: !!jobApplicationId,
	})
}

export function useUpcomingInterviews(days?: number) {
	return useQuery({
		queryKey: interviewKeys.upcoming(days),
		queryFn: async () => {
			const response = await apiClient.getUpcomingInterviews(days)
			if (!response.success || !response.data) {
				throw new Error(
					response.message || "Failed to fetch upcoming interviews"
				)
			}
			return response.data
		},
	})
}

export function useCreateInterview() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateInterviewInput) => {
			const response = await apiClient.createInterview(data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to create interview")
			}
			return response.data
		},
		onMutate: async (newInterview) => {
			await queryClient.cancelQueries({
				queryKey: interviewKeys.byJobApplication(
					newInterview.job_application_id
				),
			})
			await queryClient.cancelQueries({
				queryKey: interviewKeys.upcoming(),
			})

			const previousByJobApp = queryClient.getQueryData<Interview[]>(
				interviewKeys.byJobApplication(newInterview.job_application_id)
			)
			const previousUpcoming = queryClient.getQueriesData<Interview[]>({
				queryKey: interviewKeys.upcoming(),
			})

			const getScheduledAt = (): string => {
				if (typeof newInterview.scheduled_at === "string") {
					return newInterview.scheduled_at
				}
				return newInterview.scheduled_at.toISOString()
			}

			const optimisticInterview: Interview = {
				_id: `temp-${Date.now()}`,
				job_application_id: newInterview.job_application_id,
				interview_type: newInterview.interview_type,
				scheduled_at: getScheduledAt(),
				interviewer_name: newInterview.interviewer_name,
				interviewer_role: newInterview.interviewer_role,
				interview_format: newInterview.interview_format,
				duration_minutes: newInterview.duration_minutes,
				notes: newInterview.notes,
				feedback: newInterview.feedback,
				preparation_checklist: newInterview.preparation_checklist ?? [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			if (previousByJobApp) {
				queryClient.setQueryData<Interview[]>(
					interviewKeys.byJobApplication(newInterview.job_application_id),
					(old) => (old ? [...old, optimisticInterview] : [optimisticInterview])
				)
			}

			previousUpcoming.forEach(([queryKey, upcomingData]) => {
				if (upcomingData) {
					const scheduledDate = new Date(optimisticInterview.scheduled_at)
					const now = new Date()
					const days = queryKey[queryKey.length - 1] as number | undefined
					const MILLISECONDS_PER_SECOND = 1000
					const SECONDS_PER_MINUTE = 60
					const MINUTES_PER_HOUR = 60
					const HOURS_PER_DAY = 24
					const maxDate = days
						? new Date(
								now.getTime() +
									days *
										HOURS_PER_DAY *
										MINUTES_PER_HOUR *
										SECONDS_PER_MINUTE *
										MILLISECONDS_PER_SECOND
							)
						: null

					if (!maxDate || scheduledDate <= maxDate) {
						queryClient.setQueryData<Interview[]>(queryKey, (old) =>
							old ? [...old, optimisticInterview] : [optimisticInterview]
						)
					}
				}
			})

			return { previousByJobApp, previousUpcoming }
		},
		onError: (error: Error, newInterview, context) => {
			if (context?.previousByJobApp) {
				queryClient.setQueryData(
					interviewKeys.byJobApplication(newInterview.job_application_id),
					context.previousByJobApp
				)
			}
			if (context?.previousUpcoming) {
				context.previousUpcoming.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			toast.error("Failed to create interview", {
				description: error.message,
			})
		},
		onSuccess: (data) => {
			queryClient.setQueriesData<Interview[]>(
				{
					queryKey: interviewKeys.byJobApplication(data.job_application_id),
				},
				(old) => {
					if (!old) {
						return old
					}
					return old.map((interview) =>
						interview._id.startsWith("temp-") ? data : interview
					)
				}
			)
			queryClient.setQueriesData<Interview[]>(
				{ queryKey: interviewKeys.upcoming() },
				(old) => {
					if (!old) {
						return old
					}
					return old.map((interview) =>
						interview._id.startsWith("temp-") ? data : interview
					)
				}
			)
			toast.success("Interview created successfully!")
		},
		onSettled: async (data) => {
			if (data) {
				await queryClient.invalidateQueries({
					queryKey: interviewKeys.byJobApplication(data.job_application_id),
				})
				await queryClient.invalidateQueries({
					queryKey: interviewKeys.upcoming(),
				})
			}
		},
	})
}

export function useUpdateInterview() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string
			data: UpdateInterviewInput
		}) => {
			const response = await apiClient.updateInterview(id, data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to update interview")
			}
			return response.data
		},
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({
				queryKey: interviewKeys.detail(id),
			})
			await queryClient.cancelQueries({
				queryKey: interviewKeys.all,
			})
			await queryClient.cancelQueries({
				queryKey: interviewKeys.upcoming(),
			})

			const previousDetailData = queryClient.getQueryData<Interview>(
				interviewKeys.detail(id)
			)
			const jobApplicationId = previousDetailData?.job_application_id
			const previousByJobApp = jobApplicationId
				? queryClient.getQueriesData<Interview[]>({
						queryKey: interviewKeys.byJobApplication(jobApplicationId),
					})
				: []
			const previousUpcoming = queryClient.getQueriesData<Interview[]>({
				queryKey: interviewKeys.upcoming(),
			})

			const getScheduledAt = (oldDate: string): string => {
				if (!data.scheduled_at) {
					return oldDate
				}
				if (typeof data.scheduled_at === "string") {
					return data.scheduled_at
				}
				return data.scheduled_at.toISOString()
			}

			if (previousDetailData) {
				queryClient.setQueryData<Interview>(interviewKeys.detail(id), (old) => {
					if (!old) {
						return old
					}
					return {
						...old,
						...data,
						scheduled_at: getScheduledAt(old.scheduled_at),
						preparation_checklist:
							data.preparation_checklist ?? old.preparation_checklist,
						updatedAt: new Date().toISOString(),
					}
				})
			}

			previousByJobApp.forEach(([queryKey, jobAppInterviews]) => {
				if (jobAppInterviews) {
					queryClient.setQueryData<Interview[]>(queryKey, (old) => {
						if (!old) {
							return old
						}
						return old.map((interview) => {
							if (interview._id === id) {
								return {
									...interview,
									...data,
									scheduled_at: getScheduledAt(interview.scheduled_at),
									preparation_checklist:
										data.preparation_checklist ??
										interview.preparation_checklist,
									updatedAt: new Date().toISOString(),
								}
							}
							return interview
						})
					})
				}
			})

			previousUpcoming.forEach(([queryKey, upcomingData]) => {
				if (upcomingData) {
					queryClient.setQueryData<Interview[]>(queryKey, (old) => {
						if (!old) {
							return old
						}
						return old.map((interview) => {
							if (interview._id === id) {
								return {
									...interview,
									...data,
									scheduled_at: getScheduledAt(interview.scheduled_at),
									preparation_checklist:
										data.preparation_checklist ??
										interview.preparation_checklist,
									updatedAt: new Date().toISOString(),
								}
							}
							return interview
						})
					})
				}
			})

			return { previousDetailData, previousByJobApp, previousUpcoming }
		},
		onError: (error: Error, variables, context) => {
			if (context?.previousDetailData) {
				queryClient.setQueryData(
					interviewKeys.detail(variables.id),
					context.previousDetailData
				)
			}
			if (context?.previousByJobApp) {
				context.previousByJobApp.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			if (context?.previousUpcoming) {
				context.previousUpcoming.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			toast.error("Failed to update interview", {
				description: error.message,
			})
		},
		onSuccess: (data) => {
			queryClient.setQueryData(interviewKeys.detail(data._id), data)
			queryClient.setQueriesData<Interview[]>(
				{
					queryKey: interviewKeys.byJobApplication(data.job_application_id),
				},
				(old) => {
					if (!old) {
						return old
					}
					return old.map((interview) =>
						interview._id === data._id ? data : interview
					)
				}
			)
			queryClient.setQueriesData<Interview[]>(
				{ queryKey: interviewKeys.upcoming() },
				(old) => {
					if (!old) {
						return old
					}
					return old.map((interview) =>
						interview._id === data._id ? data : interview
					)
				}
			)
			toast.success("Interview updated successfully!")
		},
		onSettled: async (data) => {
			if (data) {
				await queryClient.invalidateQueries({
					queryKey: interviewKeys.detail(data._id),
				})
				await queryClient.invalidateQueries({
					queryKey: interviewKeys.byJobApplication(data.job_application_id),
				})
				await queryClient.invalidateQueries({
					queryKey: interviewKeys.upcoming(),
				})
			}
		},
	})
}

export function useDeleteInterview() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.deleteInterview(id)
			if (!response.success) {
				throw new Error(response.message || "Failed to delete interview")
			}
			return id
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({
				queryKey: interviewKeys.detail(id),
			})
			await queryClient.cancelQueries({
				queryKey: interviewKeys.all,
			})
			await queryClient.cancelQueries({
				queryKey: interviewKeys.upcoming(),
			})

			const previousDetailData = queryClient.getQueryData<Interview>(
				interviewKeys.detail(id)
			)
			const jobApplicationId = previousDetailData?.job_application_id
			const previousByJobApp = jobApplicationId
				? queryClient.getQueriesData<Interview[]>({
						queryKey: interviewKeys.byJobApplication(jobApplicationId),
					})
				: ([] as Array<[unknown[], Interview[] | undefined]>)
			const previousUpcoming = queryClient.getQueriesData<Interview[]>({
				queryKey: interviewKeys.upcoming(),
			})

			if (previousDetailData && jobApplicationId) {
				queryClient.setQueryData<Interview[]>(
					interviewKeys.byJobApplication(jobApplicationId),
					(old) => (old ? old.filter((interview) => interview._id !== id) : [])
				)
			}

			previousByJobApp.forEach(([queryKey, jobAppInterviews]) => {
				if (jobAppInterviews) {
					queryClient.setQueryData<Interview[]>(queryKey, (old) =>
						old ? old.filter((interview) => interview._id !== id) : []
					)
				}
			})

			previousUpcoming.forEach(([queryKey, upcomingData]) => {
				if (upcomingData) {
					queryClient.setQueryData<Interview[]>(queryKey, (old) =>
						old ? old.filter((interview) => interview._id !== id) : []
					)
				}
			})

			queryClient.removeQueries({ queryKey: interviewKeys.detail(id) })

			return { previousDetailData, previousByJobApp, previousUpcoming }
		},
		onError: (error: Error, id, context) => {
			if (context?.previousDetailData) {
				const jobApplicationId = context.previousDetailData.job_application_id
				if (jobApplicationId) {
					const matchingData = context.previousByJobApp.find(
						([key]) => key[key.length - 1] === jobApplicationId
					)
					if (matchingData) {
						queryClient.setQueryData(
							interviewKeys.byJobApplication(jobApplicationId),
							matchingData[1] ?? []
						)
					}
				}
				queryClient.setQueryData(
					interviewKeys.detail(id),
					context.previousDetailData
				)
			}
			if (context?.previousByJobApp) {
				context.previousByJobApp.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			if (context?.previousUpcoming) {
				context.previousUpcoming.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			toast.error("Failed to delete interview", {
				description: error.message,
			})
		},
		onSuccess: () => {
			toast.success("Interview deleted successfully!")
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.all,
			})
		},
	})
}
