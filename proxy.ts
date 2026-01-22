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
	const { pathname } = request.nextUrl

	if (shouldSkipAuth(pathname)) {
		return NextResponse.next()
	}

	if (isPublicRoute(pathname)) {
		if (isAuthenticated(request)) {
			const redirectParam = request.nextUrl.searchParams.get("redirect")
			const redirectUrl =
				redirectParam && redirectParam !== "/auth" ? redirectParam : "/"
			return NextResponse.redirect(new URL(redirectUrl, request.url))
		}
		return NextResponse.next()
	}

	const authenticated = isAuthenticated(request)

	if (!authenticated) {
		const redirectUrl = new URL("/auth", request.url)
		redirectUrl.searchParams.set("redirect", pathname)
		return NextResponse.redirect(redirectUrl)
	}

	return NextResponse.next()
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
