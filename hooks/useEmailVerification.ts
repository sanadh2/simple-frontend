"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"

import { authKeys } from "./useAuth"

export function useSendVerificationOTP() {
	return useMutation({
		mutationFn: async () => {
			const response = await apiClient.sendVerificationOTP()
			if (!response.success) {
				throw new Error(response.message || "Failed to send verification code")
			}
			return response
		},
		onSuccess: () => {
			toast.success("Verification code sent!", {
				description: "Please check your email for the verification code.",
			})
		},
		onError: (error: Error) => {
			toast.error("Failed to send verification code", {
				description: error.message,
			})
		},
	})
}

export function useVerifyEmail() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (otp: string) => {
			const response = await apiClient.verifyEmail(otp)
			if (!response.success) {
				throw new Error(response.message || "Failed to verify email")
			}
			return response
		},
		onSuccess: async () => {
			toast.success("Email verified!", {
				description: "Your email has been successfully verified.",
			})
			await queryClient.invalidateQueries({ queryKey: authKeys.profile() })
			await queryClient.invalidateQueries({ queryKey: authKeys.all })
		},
		onError: (error: Error) => {
			toast.error("Verification failed", {
				description: error.message,
			})
		},
	})
}

export function useVerifyEmailAfterRegistration() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
			const response = await apiClient.verifyEmailAfterRegistration(email, otp)
			if (!response.success) {
				throw new Error(response.message || "Failed to verify email")
			}
			return response
		},
		onSuccess: () => {
			queryClient.setQueryData(authKeys.profile(), null)
			queryClient.removeQueries({ queryKey: authKeys.all })
			toast.success("Email verified!", {
				description: "Please log in to continue.",
			})
		},
		onError: (error: Error) => {
			toast.error("Verification failed", {
				description: error.message,
			})
		},
	})
}

export function useVerifyEmailAndLogin() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
			const response = await apiClient.verifyEmailAndLogin(email, otp)
			if (!response.success || !response.data) {
				throw new Error(response.message || "Failed to verify email and login")
			}
			return response.data
		},
		onSuccess: async (data) => {
			queryClient.setQueryData(authKeys.profile(), data.user)
			await queryClient.invalidateQueries({ queryKey: authKeys.all })
		},
		onError: (error: Error) => {
			toast.error("Verification failed", {
				description: error.message,
			})
		},
	})
}
