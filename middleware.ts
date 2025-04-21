import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/signup" || path === "/forgot-password" || path === "/test-firebase"

  // Get the session token from cookies
  const token = request.cookies.get("session")?.value || ""

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If the path is public and there's a token, redirect to service selection
  // But exclude the test page and forgot password page
  if (isPublicPath && token && path !== "/forgot-password" && path !== "/test-firebase") {
    return NextResponse.redirect(new URL("/service-selection", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/signup", "/forgot-password", "/test-firebase", "/service-selection", "/calculator", "/payments"],
}
