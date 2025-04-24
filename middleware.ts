import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Disable caching of this response
  response.headers.set("Cache-Control", "no-store")

  // Your existing logic
  const path = request.nextUrl.pathname
  const isPublicPath = path === "/" || path === "/signup" || path === "/forgot-password"
  const token = request.cookies.get("session")?.value || ""

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/service-selection", request.url))
  }

  return response
}


// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/signup", "/service-selection", "/calculator", "/payments"],
}
