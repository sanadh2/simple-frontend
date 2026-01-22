"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
	clearAuthCookies,
	getCurrentUser,
	serverApiClient,
	setAuthCookies,
} from "@/lib/auth-server"

export interface ActionResponse<T = unknown> {
	success: boolean
	message?: string
	data?: T
	error?: string
}

export async function loginAction(
	email: string,
	password: string
): Promise<ActionResponse> {
	try {
		const response = await serverApiClient.login(email, password)

		if (response.success && response.data) {
			console.log("loginAction response.data", response.data)
			await setAuthCookies()

			revalidatePath("/")
			revalidatePath("/auth")

			return {
				success: true,
				message: "Login successful",
				data: response.data.user,
			}
		}

		return {
			success: false,
			error: response.message || "Login failed",
		}
	} catch (error) {
		console.error("Login action error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Login failed",
		}
	}
}

export async function registerAction(
	email: string,
	password: string,
	first_name: string,
	last_name: string
): Promise<ActionResponse> {
	try {
		const response = await serverApiClient.register(
			email,
			password,
			first_name,
			last_name
		)

		if (response.success && response.data) {
			console.log("registerAction response.data", response.data)
			await setAuthCookies()

			revalidatePath("/")
			revalidatePath("/auth")

			return {
				success: true,
				message: "Registration successful",
				data: response.data.user,
			}
		}

		return {
			success: false,
			error: response.message || "Registration failed",
		}
	} catch (error) {
		console.error("Registration action error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Registration failed",
		}
	}
}

export async function logoutAction(
	redirectPath?: string
): Promise<ActionResponse> {
	try {
		await serverApiClient.logout()

		await clearAuthCookies()

		revalidatePath("/")
		revalidatePath("/auth")

		// Redirect to /auth with redirect param
		const path = redirectPath && redirectPath !== "/auth" ? redirectPath : "/"
		const redirectUrl = `/auth?redirect=${encodeURIComponent(path)}`
		redirect(redirectUrl)
	} catch (error) {
		console.error("Logout action error:", error)

		await clearAuthCookies()
		revalidatePath("/")
		revalidatePath("/auth")

		// Redirect to /auth with redirect param
		const path = redirectPath && redirectPath !== "/auth" ? redirectPath : "/"
		const redirectUrl = `/auth?redirect=${encodeURIComponent(path)}`
		redirect(redirectUrl)
	}
}

export async function getProfileAction(): Promise<ActionResponse> {
	try {
		const user = await getCurrentUser()

		if (user) {
			return {
				success: true,
				data: user,
			}
		}

		return {
			success: false,
			error: "Not authenticated",
		}
	} catch (error) {
		console.error("Get profile action error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to get profile",
		}
	}
}

export async function refreshTokenAction(): Promise<ActionResponse> {
	try {
		const response = await serverApiClient.refreshToken()

		if (response.success && response.data) {
			console.log("refreshTokenAction response.data", response.data)
			await setAuthCookies()

			revalidatePath("/")
			revalidatePath("/auth")

			return {
				success: true,
				message: "Token refreshed successfully",
			}
		}

		return {
			success: false,
			error: "Token refresh failed",
		}
	} catch (error) {
		console.error("Refresh token action error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Token refresh failed",
		}
	}
}

export async function checkAuthAction(): Promise<
	ActionResponse<{ authenticated: boolean }>
> {
	try {
		const user = await getCurrentUser()

		return {
			success: true,
			data: { authenticated: user !== null },
		}
	} catch (error) {
		console.error("Check auth action error:", error)
		return {
			success: true,
			data: { authenticated: false },
		}
	}
}
