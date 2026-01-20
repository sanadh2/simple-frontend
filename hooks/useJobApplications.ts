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
		onMutate: async (newApplication) => {
			await queryClient.cancelQueries({
				queryKey: jobApplicationKeys.lists(),
			})

			const previousData = queryClient.getQueriesData<PaginatedJobApplications>(
				{
					queryKey: jobApplicationKeys.lists(),
				}
			)

			previousData.forEach(([queryKey, data]) => {
				if (data) {
					const optimisticApplication: JobApplication = {
						_id: `temp-${Date.now()}`,
						user_id: "",
						company_name: newApplication.company_name,
						job_title: newApplication.job_title,
						job_description: newApplication.job_description,
						notes: newApplication.notes,
						application_date:
							typeof newApplication.application_date === "string"
								? newApplication.application_date
								: newApplication.application_date.toISOString(),
						status: newApplication.status,
						status_history: [
							{
								status: newApplication.status,
								changed_at: new Date().toISOString(),
							},
						],
						salary_range: newApplication.salary_range,
						location_type: newApplication.location_type,
						location_city: newApplication.location_city,
						job_posting_url: newApplication.job_posting_url,
						application_method: newApplication.application_method,
						priority: newApplication.priority,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}

					queryClient.setQueryData<PaginatedJobApplications>(
						queryKey,
						(old) => {
							if (!old) {
								return old
							}
							return {
								...old,
								applications: [optimisticApplication, ...old.applications],
								totalCount: old.totalCount + 1,
							}
						}
					)
				}
			})

			return { previousData }
		},
		onError: (error: Error, _newApplication, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			toast.error("Failed to create job application", {
				description: error.message,
			})
		},
		onSuccess: (data) => {
			queryClient.setQueriesData<PaginatedJobApplications>(
				{ queryKey: jobApplicationKeys.lists() },
				(old) => {
					if (!old) {
						return old
					}
					return {
						...old,
						applications: old.applications.map((app) =>
							app._id.startsWith("temp-") ? data : app
						),
					}
				}
			)
			toast.success("Job application created successfully!")
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: jobApplicationKeys.lists(),
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
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({
				queryKey: jobApplicationKeys.lists(),
			})
			await queryClient.cancelQueries({
				queryKey: jobApplicationKeys.detail(id),
			})

			const previousListData =
				queryClient.getQueriesData<PaginatedJobApplications>({
					queryKey: jobApplicationKeys.lists(),
				})
			const previousDetailData = queryClient.getQueryData<JobApplication>(
				jobApplicationKeys.detail(id)
			)

			previousListData.forEach(([queryKey, listData]) => {
				if (listData) {
					queryClient.setQueryData<PaginatedJobApplications>(
						queryKey,
						(old) => {
							if (!old) {
								return old
							}
							return {
								...old,
								applications: old.applications.map((app) => {
									if (app._id === id) {
										const getApplicationDate = (): string => {
											if (!data.application_date) {
												return app.application_date
											}
											if (typeof data.application_date === "string") {
												return data.application_date
											}
											return data.application_date.toISOString()
										}

										const updatedApp = {
											...app,
											...data,
											application_date: getApplicationDate(),
										}

										if (
											data.status !== undefined &&
											data.status !== app.status
										) {
											updatedApp.status_history = [
												...app.status_history,
												{
													status: data.status,
													changed_at: new Date().toISOString(),
												},
											]
										}

										return updatedApp
									}
									return app
								}),
							}
						}
					)
				}
			})

			if (previousDetailData) {
				queryClient.setQueryData<JobApplication>(
					jobApplicationKeys.detail(id),
					(old) => {
						if (!old) {
							return old
						}
						const getApplicationDate = (): string => {
							if (!data.application_date) {
								return old.application_date
							}
							if (typeof data.application_date === "string") {
								return data.application_date
							}
							return data.application_date.toISOString()
						}

						const updated = {
							...old,
							...data,
							application_date: getApplicationDate(),
						}

						if (data.status !== undefined && data.status !== old.status) {
							updated.status_history = [
								...old.status_history,
								{
									status: data.status,
									changed_at: new Date().toISOString(),
								},
							]
						}

						return updated
					}
				)
			}

			return { previousListData, previousDetailData }
		},
		onError: (error: Error, _variables, context) => {
			if (context?.previousListData) {
				context.previousListData.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			if (context?.previousDetailData) {
				queryClient.setQueryData(
					jobApplicationKeys.detail(_variables.id),
					context.previousDetailData
				)
			}
			toast.error("Failed to update job application", {
				description: error.message,
			})
		},
		onSuccess: (data) => {
			queryClient.setQueriesData<PaginatedJobApplications>(
				{ queryKey: jobApplicationKeys.lists() },
				(old) => {
					if (!old) {
						return old
					}
					return {
						...old,
						applications: old.applications.map((app) =>
							app._id === data._id ? data : app
						),
					}
				}
			)
			queryClient.setQueryData(jobApplicationKeys.detail(data._id), data)
			toast.success("Job application updated successfully!")
		},
		onSettled: async (_data, _error, variables) => {
			await queryClient.invalidateQueries({
				queryKey: jobApplicationKeys.lists(),
			})
			await queryClient.invalidateQueries({
				queryKey: jobApplicationKeys.detail(variables.id),
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
		onMutate: async (id) => {
			await queryClient.cancelQueries({
				queryKey: jobApplicationKeys.lists(),
			})
			await queryClient.cancelQueries({
				queryKey: jobApplicationKeys.detail(id),
			})

			const previousListData =
				queryClient.getQueriesData<PaginatedJobApplications>({
					queryKey: jobApplicationKeys.lists(),
				})
			const previousDetailData = queryClient.getQueryData<JobApplication>(
				jobApplicationKeys.detail(id)
			)

			previousListData.forEach(([queryKey, listData]) => {
				if (listData) {
					queryClient.setQueryData<PaginatedJobApplications>(
						queryKey,
						(old) => {
							if (!old) {
								return old
							}
							return {
								...old,
								applications: old.applications.filter((app) => app._id !== id),
								totalCount: Math.max(0, old.totalCount - 1),
							}
						}
					)
				}
			})

			queryClient.removeQueries({ queryKey: jobApplicationKeys.detail(id) })

			return { previousListData, previousDetailData }
		},
		onError: (error: Error, id, context) => {
			if (context?.previousListData) {
				context.previousListData.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			if (context?.previousDetailData) {
				queryClient.setQueryData(
					jobApplicationKeys.detail(id),
					context.previousDetailData
				)
			}
			toast.error("Failed to delete job application", {
				description: error.message,
			})
		},
		onSuccess: () => {
			toast.success("Job application deleted successfully!")
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: jobApplicationKeys.lists(),
			})
		},
	})
}
