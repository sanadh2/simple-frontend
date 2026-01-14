"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api"

export const authKeys = {
	all: ["auth"] as const,
	profile: () => [...authKeys.all, "profile"] as const,
}

export function useProfile() {
	return useQuery({
		queryKey: authKeys.profile(),
		queryFn: async () => {
			if (typeof window === "undefined") return null

			try {
				const response = await apiClient.getProfile()
				return response.success && response.data ? response.data.user : null
			} catch {
				try {
					const refreshResponse = await apiClient.refreshToken()
					if (refreshResponse.success && refreshResponse.data) {
						const profileResponse = await apiClient.getProfile()
						return profileResponse.success && profileResponse.data
							? profileResponse.data.user
							: null
					}
				} catch {
					// Token refresh failed, user will be redirected
				}
				return null
			}
		},
		staleTime: 1000 * 60 * 5,
		retry: false,
	})
}

export function useLogin() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			email,
			password,
		}: {
			email: string
			password: string
		}) => {
			const response = await apiClient.login(email, password)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Login failed")
			}
			return response.data
		},
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.profile(), data.user)
		},
	})
}

export function useRegister() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			email,
			password,
			firstName,
			lastName,
		}: {
			email: string
			password: string
			firstName: string
			lastName: string
		}) => {
			const response = await apiClient.register(
				email,
				password,
				firstName,
				lastName
			)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Registration failed")
			}
			return response.data
		},
		onSuccess: (data) => {
			queryClient.setQueryData(authKeys.profile(), data.user)
		},
	})
}

export function useLogout() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			try {
				await apiClient.logout()
			} catch (error) {
				console.error("Logout error:", error)
			}
		},
		onSuccess: () => {
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
		},
	})
}

export function useLogoutAll() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			try {
				await apiClient.logoutAll()
			} catch (error) {
				console.error("Logout all error:", error)
			}
		},
		onSuccess: () => {
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
		},
		onError: () => {
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
		},
	})
}

export function useRefreshToken() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			const response = await apiClient.refreshToken()
			if (!response.success || !response.data) {
				throw new Error("Token refresh failed")
			}
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.profile() })
		},
	})
}

export function useAuthMutations() {
	const login = useLogin()
	const register = useRegister()
	const logout = useLogout()
	const logoutAll = useLogoutAll()
	const refreshToken = useRefreshToken()

	return {
		login,
		register,
		logout,
		logoutAll,
		refreshToken,
	}
}
