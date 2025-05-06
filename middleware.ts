import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/signup" || path === "/forgot-password"

  // Get the session token from cookies - check both Firebase auth and our custom cookie
  const firebaseToken = request.cookies.get(
    "firebase:authUser:AIzaSyDQQZQOlbV9Z6HLluiT9JQOkLEf4oRgWyI:[DEFAULT]",
  )?.value
  const sessionToken = request.cookies.get("auth-session")?.value

  // Check if user is authenticated
  const isAuthenticated = !!firebaseToken || !!sessionToken

  console.log(`Path: ${path}, Public: ${isPublicPath}, Authenticated: ${isAuthenticated}`)

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
  matcher: ["/", "/signup", "/service-selection", "/calculator/:path*", "/payments"],
}
