import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

async function getAuthToken(req: NextRequest) {
  const secret = process.env.AUTH_SECRET

  // 1. Try __Secure-authjs.session-token (Production HTTPS)
  let token = await getToken({
    req,
    secret,
    secureCookie: true,
    cookieName: "__Secure-authjs.session-token",
  })

  // 2. Try authjs.session-token (Localhost HTTP)
  if (!token) {
    token = await getToken({
      req,
      secret,
      secureCookie: false,
      cookieName: "authjs.session-token",
    })
  }

  // 3. Try standard next-auth cookie fallbacks
  if (!token) {
    token = await getToken({
      req,
      secret,
      secureCookie: true,
      cookieName: "__Secure-next-auth.session-token",
    })
  }

  if (!token) {
    token = await getToken({ req, secret })
  }

  return token
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Only protect page routes — API routes handle their own auth
  const publicRoutes = ["/login", "/register", "/unauthorized"]
  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = await getAuthToken(req)
  
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role
  // Admin can access /user/* routes (cart, checkout, orders) too
  if (pathname.startsWith("/user") && role !== "user" && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }
  if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
}

// ✅ Exclude /api, _next/static, _next/image, and favicon from proxy
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
