import { type NextRequest, NextResponse } from "next/server"

/**
 * Public routes that don't require authentication
 */
const publicRoutes = ["/auth"]

/**
 * API routes that should be excluded from authentication checks
 */
const apiRoutes = ["/api"]

/**
 * Static assets that should be excluded from authentication checks
 */
const staticRoutes = ["/_next", "/favicon.ico", "/logo.svg", "/.well-known"]

/**
 * Check if a pathname is a public route
 */
function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Check if a pathname is an API route
 */
function isApiRoute(pathname: string): boolean {
	return apiRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Check if a pathname is a static asset route
 */
function isStaticRoute(pathname: string): boolean {
	return staticRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Check if the pathname should be excluded from authentication checks
 */
function shouldSkipAuth(pathname: string): boolean {
	return isApiRoute(pathname) || isStaticRoute(pathname)
}

/**
 * Check if the user is authenticated by checking for the isAuthenticated cookie
 */
function isAuthenticated(request: NextRequest): boolean {
	const { cookies } = request

	// Check if the isAuthenticated cookie exists and is set to "true"
	const isAuthenticatedCookie = cookies.get("isAuthenticated")?.value === "true"

	return isAuthenticatedCookie
}

/**
 * Next.js Middleware
 * Validates all incoming requests and enforces authentication
 */
export async function proxy(request: NextRequest) {
	try {
		const { pathname } = request.nextUrl

		console.log("[Proxy Middleware] Request received:", {
			pathname,
			method: request.method,
			url: request.url,
		})

		if (shouldSkipAuth(pathname)) {
			console.log("[Proxy Middleware] Skipping auth check for:", pathname)
			return NextResponse.next()
		}

		if (isPublicRoute(pathname)) {
			console.log("[Proxy Middleware] Public route detected:", pathname)
			const authenticated = isAuthenticated(request)
			console.log("[Proxy Middleware] Authentication status:", authenticated)

			if (authenticated) {
				const redirectParam = request.nextUrl.searchParams.get("redirect")
				const redirectUrl =
					redirectParam && redirectParam !== "/auth" ? redirectParam : "/"
				console.log(
					"[Proxy Middleware] Authenticated user on public route, redirecting to:",
					redirectUrl
				)
				return NextResponse.redirect(new URL(redirectUrl, request.url))
			}

			console.log("[Proxy Middleware] Allowing access to public route")
			return NextResponse.next()
		}

		console.log("[Proxy Middleware] Protected route detected:", pathname)
		const authenticated = isAuthenticated(request)
		console.log("[Proxy Middleware] Authentication status:", authenticated)

		if (!authenticated) {
			const redirectUrl = new URL("/auth", request.url)
			redirectUrl.searchParams.set("redirect", pathname)
			console.log(
				"[Proxy Middleware] Not authenticated, redirecting to:",
				redirectUrl.toString()
			)
			return NextResponse.redirect(redirectUrl)
		}

		console.log(
			"[Proxy Middleware] Authenticated, allowing access to:",
			pathname
		)
		return NextResponse.next()
	} catch (error) {
		console.error("[Proxy Middleware] Error occurred:", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			pathname: request.nextUrl.pathname,
		})
		// On error, allow the request to proceed to avoid blocking users
		return NextResponse.next()
	}
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes - handled separately)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - logo.svg and other public assets
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
}
