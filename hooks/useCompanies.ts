"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
	apiClient,
	type CompanySize,
	type CreateCompanyInput,
	type FundingStage,
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
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
			toast.success("Company created successfully!")
		},
		onError: (error: Error) => {
			toast.error("Failed to create company", {
				description: error.message,
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
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
			queryClient.setQueryData(companyKeys.detail(data._id), data)
			toast.success("Company updated successfully!")
		},
		onError: (error: Error) => {
			toast.error("Failed to update company", {
				description: error.message,
			})
		},
		onSettled: async (_data, _error, variables) => {
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
		onSuccess: async (id) => {
			await queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
			queryClient.removeQueries({ queryKey: companyKeys.detail(id) })
			toast.success("Company deleted successfully!")
		},
		onError: (error: Error) => {
			toast.error("Failed to delete company", {
				description: error.message,
			})
		},
	})
}
