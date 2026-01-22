"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
	apiClient,
	type CreateResumeInput,
	type UpdateResumeInput,
} from "@/lib/api"

export const resumeKeys = {
	all: ["resumes"] as const,
	lists: () => [...resumeKeys.all, "list"] as const,
	details: () => [...resumeKeys.all, "detail"] as const,
	detail: (id: string) => [...resumeKeys.details(), id] as const,
	applications: (id: string) =>
		[...resumeKeys.detail(id), "applications"] as const,
}

export function useResumes() {
	return useQuery({
		queryKey: resumeKeys.lists(),
		queryFn: async () => {
			const response = await apiClient.getResumes()
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch resumes")
			}
			return response.data
		},
	})
}

export function useResume(id: string) {
	return useQuery({
		queryKey: resumeKeys.detail(id),
		queryFn: async () => {
			const response = await apiClient.getResumeById(id)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch resume")
			}
			return response.data
		},
		enabled: !!id,
	})
}

export function useCreateResume() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			file,
			data,
		}: {
			file: File
			data?: CreateResumeInput
		}) => {
			const response = await apiClient.createResume(file, data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to create resume")
			}
			return response.data
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: resumeKeys.lists() })
			toast.success("Resume uploaded successfully")
		},
		onError: (error: Error) => {
			toast.error("Failed to upload resume", {
				description: error.message,
			})
		},
	})
}

export function useUpdateResume() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string
			data: UpdateResumeInput
		}) => {
			const response = await apiClient.updateResume(id, data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to update resume")
			}
			return response.data
		},
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({ queryKey: resumeKeys.lists() })
			await queryClient.invalidateQueries({
				queryKey: resumeKeys.detail(variables.id),
			})
			toast.success("Resume updated successfully")
		},
		onError: (error: Error) => {
			toast.error("Failed to update resume", {
				description: error.message,
			})
		},
	})
}

export function useDeleteResume() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.deleteResume(id)
			if (!response.success) {
				throw new Error(response.message || "Failed to delete resume")
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: resumeKeys.lists() })
			toast.success("Resume deleted successfully")
		},
		onError: (error: Error) => {
			toast.error("Failed to delete resume", {
				description: error.message,
			})
		},
	})
}

export function useResumeApplications(id: string) {
	return useQuery({
		queryKey: resumeKeys.applications(id),
		queryFn: async () => {
			const response = await apiClient.getResumeApplications(id)
			if (!response.success || !response.data) {
				throw new Error(
					response.message || "Failed to fetch resume applications"
				)
			}
			return response.data
		},
		enabled: !!id,
	})
}
