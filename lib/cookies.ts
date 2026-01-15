import { env } from "@/env"

export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null

	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift() || null
	}
	return null
}

export function setCookie(
	name: string,
	value: string,
	options: {
		maxAge?: number
		path?: string
		secure?: boolean
		sameSite?: "strict" | "lax" | "none"
	} = {}
): void {
	if (typeof document === "undefined") return

	const {
		maxAge = 15 * 60,
		path = "/",
		secure = env.NODE_ENV === "production",
		sameSite = "strict",
	} = options

	let cookie = `${name}=${value}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`

	if (secure) {
		cookie += "; Secure"
	}

	document.cookie = cookie
}

export function deleteCookie(name: string, path = "/"): void {
	if (typeof document === "undefined") return

	document.cookie = `${name}=; path=${path}; max-age=0`
}
