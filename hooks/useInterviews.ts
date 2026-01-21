import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { type CreateInterviewInput, type UpdateInterviewInput } from "@/lib/api"
import { apiClient } from "@/lib/api"

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
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.lists(),
			})
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.byJobApplication(data.job_application_id),
			})
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.upcoming(),
			})
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
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.detail(data._id),
			})
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.lists(),
			})
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.byJobApplication(data.job_application_id),
			})
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.upcoming(),
			})
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
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.lists(),
			})
			await queryClient.invalidateQueries({
				queryKey: interviewKeys.all,
			})
		},
	})
}
