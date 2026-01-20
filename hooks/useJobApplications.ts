"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
	apiClient,
	type CreateJobApplicationInput,
	type JobApplication,
	type JobStatus,
	type PaginatedJobApplications,
	type PriorityLevel,
	type UpdateJobApplicationInput,
} from "@/lib/api"

export const jobApplicationKeys = {
	all: ["job-applications"] as const,
	lists: () => [...jobApplicationKeys.all, "list"] as const,
	list: (filters?: {
		page?: number
		limit?: number
		status?: JobStatus
		priority?: PriorityLevel
		company_name?: string
		startDate?: string
		endDate?: string
	}) => [...jobApplicationKeys.lists(), filters] as const,
	details: () => [...jobApplicationKeys.all, "detail"] as const,
	detail: (id: string) => [...jobApplicationKeys.details(), id] as const,
}

export function useJobApplications(params?: {
	page?: number
	limit?: number
	status?: JobStatus
	priority?: PriorityLevel
	company_name?: string
	startDate?: string
	endDate?: string
}) {
	return useQuery({
		queryKey: jobApplicationKeys.list(params),
		queryFn: async () => {
			const response = await apiClient.getJobApplications(params)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch job applications")
			}
			return response.data
		},
	})
}

export function useJobApplication(id: string) {
	return useQuery({
		queryKey: jobApplicationKeys.detail(id),
		queryFn: async () => {
			const response = await apiClient.getJobApplicationById(id)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch job application")
			}
			return response.data
		},
		enabled: !!id,
	})
}

export function useCreateJobApplication() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateJobApplicationInput) => {
			const response = await apiClient.createJobApplication(data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to create job application")
			}
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() })
			toast.success("Job application created successfully!")
		},
		onError: (error: Error) => {
			toast.error("Failed to create job application", {
				description: error.message,
			})
		},
	})
}

export function useUpdateJobApplication() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string
			data: UpdateJobApplicationInput
		}) => {
			const response = await apiClient.updateJobApplication(id, data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to update job application")
			}
			return response.data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() })
			queryClient.invalidateQueries({
				queryKey: jobApplicationKeys.detail(data._id),
			})
			toast.success("Job application updated successfully!")
		},
		onError: (error: Error) => {
			toast.error("Failed to update job application", {
				description: error.message,
			})
		},
	})
}

export function useDeleteJobApplication() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.deleteJobApplication(id)
			if (!response.success) {
				throw new Error(response.message || "Failed to delete job application")
			}
			return id
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() })
			toast.success("Job application deleted successfully!")
		},
		onError: (error: Error) => {
			toast.error("Failed to delete job application", {
				description: error.message,
			})
		},
	})
}
