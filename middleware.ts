import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/signup"

  // Get the session token from cookies
  const sessionToken = request.cookies.get("auth-session")?.value

  // Check if user is authenticated
  const isAuthenticated = !!sessionToken

  console.log(`Middleware - Path: ${path}, Public: ${isPublicPath}, Authenticated: ${isAuthenticated}`)

  // If the path is not public and user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    console.log("Redirecting to login page")
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If the path is public and user is authenticated, redirect to service selection
  if (isPublicPath && isAuthenticated) {
    console.log("Redirecting to service selection page")
    return NextResponse.redirect(new URL("/service-selection", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/signup", "/service-selection", "/calculator/:path*", "/payments", "/reports"],
}
