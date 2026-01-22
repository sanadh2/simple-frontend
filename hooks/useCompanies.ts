"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
	apiClient,
	type Company,
	type CompanySize,
	type CreateCompanyInput,
	type FundingStage,
	type PaginatedCompanies,
	type UpdateCompanyInput,
} from "@/lib/api"

export const companyKeys = {
	all: ["companies"] as const,
	lists: () => [...companyKeys.all, "list"] as const,
	list: (filters?: {
		page?: number
		limit?: number
		search?: string
		size?: CompanySize
		industry?: string
		funding_stage?: FundingStage
		sortBy?: string
		sortOrder?: "asc" | "desc"
	}) => [...companyKeys.lists(), filters] as const,
	details: () => [...companyKeys.all, "detail"] as const,
	detail: (id: string) => [...companyKeys.details(), id] as const,
}

export function useCompanies(params?: {
	page?: number
	limit?: number
	search?: string
	size?: CompanySize
	industry?: string
	funding_stage?: FundingStage
	sortBy?: string
	sortOrder?: "asc" | "desc"
}) {
	return useQuery({
		queryKey: companyKeys.list(params),
		queryFn: async () => {
			const response = await apiClient.getCompanies(params)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch companies")
			}
			return response.data
		},
	})
}

export function useCompany(id: string, includeApplications?: boolean) {
	return useQuery({
		queryKey: [...companyKeys.detail(id), includeApplications],
		queryFn: async () => {
			const response = await apiClient.getCompanyById(id, includeApplications)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to fetch company")
			}
			return response.data
		},
		enabled: !!id,
	})
}

export function useCreateCompany() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateCompanyInput) => {
			const response = await apiClient.createCompany(data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to create company")
			}
			return response.data
		},
		onMutate: async (newCompany) => {
			await queryClient.cancelQueries({
				queryKey: companyKeys.lists(),
			})

			const previousData = queryClient.getQueriesData<PaginatedCompanies>({
				queryKey: companyKeys.lists(),
			})

			const optimisticCompany: Company = {
				_id: `temp-${Date.now()}`,
				user_id: "",
				name: newCompany.name,
				size: newCompany.size,
				industry: newCompany.industry,
				funding_stage: newCompany.funding_stage,
				glassdoor_url: newCompany.glassdoor_url,
				culture_notes: newCompany.culture_notes,
				pros: newCompany.pros ?? [],
				cons: newCompany.cons ?? [],
				interview_process_overview: newCompany.interview_process_overview,
				application_count: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			previousData.forEach(([queryKey, data]) => {
				if (data) {
					queryClient.setQueryData<PaginatedCompanies>(queryKey, (old) => {
						if (!old) {
							return old
						}
						return {
							...old,
							companies: [optimisticCompany, ...old.companies],
							totalCount: old.totalCount + 1,
						}
					})
				}
			})

			return { previousData }
		},
		onError: (error: Error, _newCompany, context) => {
			if (context?.previousData) {
				context.previousData.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			toast.error("Failed to create company", {
				description: error.message,
			})
		},
		onSuccess: (data) => {
			queryClient.setQueriesData<PaginatedCompanies>(
				{ queryKey: companyKeys.lists() },
				(old) => {
					if (!old) {
						return old
					}
					return {
						...old,
						companies: old.companies.map((company) =>
							company._id.startsWith("temp-") ? data : company
						),
					}
				}
			)
			toast.success("Company created successfully!")
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: companyKeys.lists(),
			})
		},
	})
}

export function useUpdateCompany() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string
			data: UpdateCompanyInput
		}) => {
			const response = await apiClient.updateCompany(id, data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to update company")
			}
			return response.data
		},
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({
				queryKey: companyKeys.lists(),
			})
			await queryClient.cancelQueries({
				queryKey: companyKeys.detail(id),
			})

			const previousListData = queryClient.getQueriesData<PaginatedCompanies>({
				queryKey: companyKeys.lists(),
			})
			const previousDetailData = queryClient.getQueryData<Company>(
				companyKeys.detail(id)
			)

			previousListData.forEach(([queryKey, listData]) => {
				if (listData) {
					queryClient.setQueryData<PaginatedCompanies>(queryKey, (old) => {
						if (!old) {
							return old
						}
						return {
							...old,
							companies: old.companies.map((company) => {
								if (company._id === id) {
									return {
										...company,
										...data,
										pros: data.pros ?? company.pros,
										cons: data.cons ?? company.cons,
										updatedAt: new Date().toISOString(),
									}
								}
								return company
							}),
						}
					})
				}
			})

			if (previousDetailData) {
				queryClient.setQueryData<Company>(companyKeys.detail(id), (old) => {
					if (!old) {
						return old
					}
					return {
						...old,
						...data,
						pros: data.pros ?? old.pros,
						cons: data.cons ?? old.cons,
						updatedAt: new Date().toISOString(),
					}
				})
			}

			return { previousListData, previousDetailData }
		},
		onError: (error: Error, variables, context) => {
			if (context?.previousListData) {
				context.previousListData.forEach(([queryKey, data]) => {
					if (data) {
						queryClient.setQueryData(queryKey, data)
					}
				})
			}
			if (context?.previousDetailData) {
				queryClient.setQueryData(
					companyKeys.detail(variables.id),
					context.previousDetailData
				)
			}
			toast.error("Failed to update company", {
				description: error.message,
			})
		},
		onSuccess: (data) => {
			queryClient.setQueriesData<PaginatedCompanies>(
				{ queryKey: companyKeys.lists() },
				(old) => {
					if (!old) {
						return old
					}
					return {
						...old,
						companies: old.companies.map((company) =>
							company._id === data._id ? data : company
						),
					}
				}
			)
			queryClient.setQueryData(companyKeys.detail(data._id), data)
			toast.success("Company updated successfully!")
		},
		onSettled: async (_data, _error, variables) => {
			await queryClient.invalidateQueries({
				queryKey: companyKeys.lists(),
			})
			await queryClient.invalidateQueries({
				queryKey: companyKeys.detail(variables.id),
			})
		},
	})
}

export function useDeleteCompany() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.deleteCompany(id)
			if (!response.success) {
				throw new Error(response.message || "Failed to delete company")
			}
			return id
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({
				queryKey: companyKeys.lists(),
			})
			await queryClient.cancelQueries({
				queryKey: companyKeys.detail(id),
			})

			const previousListData = queryClient.getQueriesData<PaginatedCompanies>({
				queryKey: companyKeys.lists(),
			})
			const previousDetailData = queryClient.getQueryData<Company>(
				companyKeys.detail(id)
			)

			previousListData.forEach(([queryKey, listData]) => {
				if (listData) {
					queryClient.setQueryData<PaginatedCompanies>(queryKey, (old) => {
						if (!old) {
							return old
						}
						return {
							...old,
							companies: old.companies.filter((company) => company._id !== id),
							totalCount: Math.max(0, old.totalCount - 1),
						}
					})
				}
			})

			queryClient.removeQueries({ queryKey: companyKeys.detail(id) })

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
					companyKeys.detail(id),
					context.previousDetailData
				)
			}
			toast.error("Failed to delete company", {
				description: error.message,
			})
		},
		onSuccess: () => {
			toast.success("Company deleted successfully!")
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: companyKeys.lists(),
			})
		},
	})
}
