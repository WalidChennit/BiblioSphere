import { NextResponse, type NextRequest } from "next/server"

const API_BASE = process.env.BACKEND_URL || "http://127.0.0.1:3001"

type MeResponse = { user: { id: number; email: string; role: string } | null }

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/student") || pathname.startsWith("/personal") || pathname.startsWith("/admin")
}

function requiredRoleForPath(pathname: string): string | null {
  if (pathname.startsWith("/admin")) return "admin"
  if (pathname.startsWith("/personal")) return "personnel"
  if (pathname.startsWith("/student")) return "etudiant"
  return null
}

function defaultRouteForRole(role: string) {
  if (role === "admin") return "/admin/dashboard"
  if (role === "personnel") return "/personal"
  if (role === "etudiant") return "/student"
  return "/"
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (!isProtectedPath(pathname)) return NextResponse.next()

  // If no session cookie at all, redirect immediately
  const cookieHeader = req.headers.get("cookie") || ""
  if (!cookieHeader.includes("session=")) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Validate session + role through backend
  let me: MeResponse | null = null
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    })

    if (!res.ok) throw new Error("auth/me not ok")
    me = (await res.json()) as MeResponse
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (!me?.user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  const needed = requiredRoleForPath(pathname)
  if (needed && me.user.role !== needed) {
    const url = req.nextUrl.clone()
    url.pathname = defaultRouteForRole(me.user.role)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/student/:path*", "/personal/:path*", "/admin/:path*"],
}
