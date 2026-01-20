"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"

const HTTP_UNAUTHORIZED = 401
const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const STALE_TIME_MINUTES = 5

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
				const isUnauthorized =
					error instanceof Error &&
					"status" in error &&
					error.status === HTTP_UNAUTHORIZED

				if (isUnauthorized) {
					return null
				}

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
		staleTime:
			MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES,
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
			if (!response.success) {
				throw new Error(response.message || "Login failed")
			}
			if (!response.data) {
				throw new Error("Login failed: No data received")
			}
			return response.data
		},
		onSuccess: (data) => {
			if ("user" in data) {
				queryClient.setQueryData(authKeys.profile(), data.user)
			} else if ("requiresVerification" in data) {
				queryClient.setQueryData(authKeys.profile(), null)
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
			first_name,
			last_name,
		}: {
			email: string
			password: string
			first_name: string
			last_name: string
		}) => {
			const response = await apiClient.register(
				email,
				password,
				first_name,
				last_name
			)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Registration failed")
			}
			return response.data
		},
		onSuccess: () => {
			queryClient.setQueryData(authKeys.profile(), null)
			toast.success("Registration successful!", {
				description:
					"Please check your email for verification code. You can now log in.",
			})
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
		onSuccess: async () => {
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
			await queryClient.cancelQueries({ queryKey: authKeys.profile() })
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
		onSuccess: async () => {
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
			await queryClient.cancelQueries({ queryKey: authKeys.profile() })
		},
		onError: async () => {
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
			await queryClient.cancelQueries({ queryKey: authKeys.profile() })
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
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.profile() })
		},
	})
}

export function useUploadProfilePicture() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (file: File) => {
			const response = await apiClient.uploadProfilePicture(file)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to upload profile picture")
			}
			return response.data.user
		},
		onSuccess: async (user) => {
			queryClient.setQueryData(authKeys.profile(), user)
			await queryClient.refetchQueries({ queryKey: authKeys.profile() })
			toast.success("Profile picture uploaded successfully!")
		},
		onError: (error) => {
			toast.error("Failed to upload profile picture", {
				description: error instanceof Error ? error.message : "Unknown error",
			})
		},
	})
}

export function useUpdateProfile() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: {
			first_name?: string
			last_name?: string
			currentRole?: string | null
			yearsOfExperience?: number | null
		}) => {
			const response = await apiClient.updateProfile(data)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to update profile")
			}
			return response.data.user
		},
		onSuccess: async (user) => {
			queryClient.setQueryData(authKeys.profile(), user)
			await queryClient.refetchQueries({ queryKey: authKeys.profile() })
			toast.success("Profile updated successfully!")
		},
		onError: (error) => {
			toast.error("Failed to update profile", {
				description: error instanceof Error ? error.message : "Unknown error",
			})
		},
	})
}

export function useRequestPasswordReset() {
	return useMutation({
		mutationFn: async (email: string) => {
			const response = await apiClient.requestPasswordReset(email)
			if (!response.success) {
				throw new Error(response.message || "Failed to request password reset")
			}
			return response
		},
		onSuccess: () => {
			toast.success("Password reset code sent!", {
				description: "Please check your email for the verification code.",
			})
		},
		onError: (error) => {
			toast.error("Failed to send password reset code", {
				description: error instanceof Error ? error.message : "Unknown error",
			})
		},
	})
}

export function useResetPassword() {
	return useMutation({
		mutationFn: async ({
			email,
			otp,
			newPassword,
		}: {
			email: string
			otp: string
			newPassword: string
		}) => {
			const response = await apiClient.resetPassword(email, otp, newPassword)
			if (!response.success) {
				throw new Error(response.message || "Failed to reset password")
			}
			return response
		},
		onSuccess: () => {
			toast.success("Password reset successfully!", {
				description: "You can now log in with your new password.",
			})
		},
		onError: (error) => {
			toast.error("Failed to reset password", {
				description: error instanceof Error ? error.message : "Unknown error",
			})
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
