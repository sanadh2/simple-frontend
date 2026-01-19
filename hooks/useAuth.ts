"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"

export const authKeys = {
	all: ["auth"] as const,
	profile: () => [...authKeys.all, "profile"] as const,
}

export function useProfile() {
	return useQuery({
		queryKey: authKeys.profile(),
		queryFn: async () => {
			try {
				const response = await apiClient.getProfile()
				return response.success && response.data ? response.data.user : null
			} catch (error) {
				// Check if it's a 401 (unauthorized) - don't try to refresh if user is logged out
				const isUnauthorized = error instanceof Error && "status" in error && error.status === 401
				
				if (isUnauthorized) {
					// User is not authenticated, return null without trying to refresh
					// This prevents unnecessary token refresh attempts that could trigger redirects
					return null
				}

				// For other errors, try to refresh token
				try {
					const refreshResponse = await apiClient.refreshToken()
					if (refreshResponse.success && refreshResponse.data) {
						const profileResponse = await apiClient.getProfile()
						return profileResponse.success && profileResponse.data
							? profileResponse.data.user
							: null
					}
				} catch {
					// Token refresh failed, return null (component will handle showing login form)
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
			if ("user" in data) {
				queryClient.setQueryData(authKeys.profile(), data.user)
			}
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
			if (!data.user.isEmailVerified) {
				toast.info("Verification email sent", {
					description: "Please check your email to verify your account.",
				})
			}
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
			// Clear auth data immediately
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
			// Cancel any in-flight queries to prevent them from triggering redirects
			queryClient.cancelQueries({ queryKey: authKeys.profile() })
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
			// Clear auth data immediately
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
			// Cancel any in-flight queries to prevent them from triggering redirects
			queryClient.cancelQueries({ queryKey: authKeys.profile() })
		},
		onError: () => {
			// Clear auth data even on error
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
			queryClient.cancelQueries({ queryKey: authKeys.profile() })
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
