import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const publicRoutes = ["/auth"]

function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some((route) => pathname.startsWith(route))
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Get all cookies for debugging
	const allCookies = request.cookies.getAll()
	const cookieNames = allCookies.map((c) => c.name)
	const isAuthenticatedCookie =
		request.cookies.get("isAuthenticated")?.value === "true"
	const hasAccessToken = !!request.cookies.get("accessToken")?.value
	const hasRefreshToken = !!request.cookies.get("refreshToken")?.value
	const hasSessionId = !!request.cookies.get("sessionId")?.value

	const isAuthenticated = isAuthenticatedCookie || hasAccessToken

	// Debug logging
	console.log("[Proxy Middleware] Request details:", {
		pathname,
		isPublicRoute: isPublicRoute(pathname),
		cookieNames,
		cookieCount: allCookies.length,
		isAuthenticatedCookie,
		hasAccessToken,
		hasRefreshToken,
		hasSessionId,
		isAuthenticated,
		userAgent: request.headers.get("user-agent")?.substring(0, 50),
		referer: request.headers.get("referer"),
	})

	if (isPublicRoute(pathname)) {
		console.log("[Proxy Middleware] Public route, allowing access:", pathname)
		return NextResponse.next()
	}

	if (!isAuthenticated) {
		const redirectUrl = new URL("/auth", request.url)
		redirectUrl.searchParams.set("redirect", pathname)
		console.log("[Proxy Middleware] Not authenticated, redirecting to /auth:", {
			originalPath: pathname,
			redirectUrl: redirectUrl.toString(),
			reason:
				!isAuthenticatedCookie && !hasAccessToken
					? "No auth cookies found"
					: "Unknown",
		})
		return NextResponse.redirect(redirectUrl)
	}

	console.log("[Proxy Middleware] Authenticated, allowing access:", pathname)
	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - logo.svg and other public assets
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
}
