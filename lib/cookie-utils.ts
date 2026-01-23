/**
 * Client-side cookie utilities
 * These functions run in the browser and can set cookies that are readable by middleware
 */

// Time constants for cookie max age (7 days)
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS = 7
const MAX_AGE = DAYS * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE

/**
 * Set the isAuthenticated cookie on the client side
 * This cookie is used by the middleware to determine if a user is authenticated
 */
export function setAuthCookieClient(): void {
	try {
		const isProduction = process.env.NODE_ENV === "production"

		const cookieOptions = [
			`isAuthenticated=true`,
			`path=/`,
			`max-age=${MAX_AGE}`,
			isProduction ? `secure` : "",
			`sameSite=${isProduction ? "None" : "Lax"}`,
		]
			.filter(Boolean)
			.join("; ")

		document.cookie = cookieOptions
	} catch (error) {
		console.error("[setAuthCookieClient] Error setting cookie:", error)
	}
}

/**
 * Clear the isAuthenticated cookie on the client side
 */
export function clearAuthCookieClient(): void {
	try {
		document.cookie = "isAuthenticated=; path=/; max-age=0"
	} catch (error) {
		console.error("[clearAuthCookieClient] Error clearing cookie:", error)
	}
}

/**
 * Check if the isAuthenticated cookie exists and is set to "true"
 */
export function getAuthCookieClient(): boolean {
	try {
		const cookies = document.cookie.split("; ")
		const authCookie = cookies.find((row) => row.startsWith("isAuthenticated="))
		const value = authCookie?.split("=")[1]
		return value === "true"
	} catch (error) {
		console.error("[getAuthCookieClient] Error reading cookie:", error)
		return false
	}
}
