/**
 * Client-side cookie utilities
 * These functions run in the browser and can set cookies that are readable by middleware
 */

/**
 * Set the isAuthenticated cookie on the client side
 * This cookie is used by the middleware to determine if a user is authenticated
 */
export function setAuthCookieClient(): void {
	try {
		const isProduction = process.env.NODE_ENV === "production"
		const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds

		// Build cookie string with all options
		const cookieOptions = [
			`isAuthenticated=true`,
			`path=/`,
			`max-age=${maxAge}`,
			isProduction ? `secure` : "",
			`sameSite=${isProduction ? "None" : "Lax"}`,
		]
			.filter(Boolean)
			.join("; ")

		document.cookie = cookieOptions

		console.log("[setAuthCookieClient] Cookie set successfully:", {
			options: cookieOptions,
			isProduction,
		})

		// Verify the cookie was set
		const verifyCookie = document.cookie
			.split("; ")
			.find((row) => row.startsWith("isAuthenticated="))
		console.log("[setAuthCookieClient] Cookie verification:", {
			exists: !!verifyCookie,
			value: verifyCookie?.split("=")[1],
		})
	} catch (error) {
		console.error("[setAuthCookieClient] Error setting cookie:", error)
	}
}

/**
 * Clear the isAuthenticated cookie on the client side
 */
export function clearAuthCookieClient(): void {
	try {
		// Set cookie with max-age=0 to delete it
		document.cookie = "isAuthenticated=; path=/; max-age=0"
		console.log("[clearAuthCookieClient] Cookie cleared")
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
