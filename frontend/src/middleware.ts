import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthUser } from "@/actions/auth.actions";

// Define an array of protected routes
const protectedRoutes = [
  "/invoices",
  "/add",
  // Add more protected routes here
];

// Helper function to check if a path is protected
function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some((route) => path.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const user = await getAuthUser();
  const currentPath = request.nextUrl.pathname;
  if (
    isProtectedRoute(currentPath) &&
    (user === undefined || user?.error === true)
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (user?.error === false && currentPath === "/") {
    return NextResponse.redirect(new URL("/invoices", request.url));
  }
  return NextResponse.next();
}

// Optionally, you can add a matcher to optimize performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
