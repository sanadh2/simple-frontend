import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const publicRoutes = ["/auth"]

function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some((route) => pathname.startsWith(route))
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl
	const isAuthenticated =
		request.cookies.get("isAuthenticated")?.value === "true"

	if (isPublicRoute(pathname)) {
		return NextResponse.next()
	}

	if (isAuthenticated && pathname === "/auth") {
		const redirectParam = request.nextUrl.searchParams.get("redirect")
		const redirectUrl =
			redirectParam && redirectParam !== "/auth" ? redirectParam : "/"
		return NextResponse.redirect(new URL(redirectUrl, request.url))
	}

	if (!isAuthenticated) {
		const redirectUrl = new URL("/auth", request.url)
		redirectUrl.searchParams.set("redirect", pathname)
		return NextResponse.redirect(redirectUrl)
	}

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
