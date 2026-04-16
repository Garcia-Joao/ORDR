import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('auth')?.value
  const isLoggedIn = Boolean(authCookie)
  const { pathname } = request.nextUrl

  const protectedRoutes = [
    '/PDV',
    '/pedidos',
    '/produtos',
    '/clientes',
    '/relatorios',
    '/dispositivos',
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/PDV', request.url))
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/PDV/:path*',
    '/pedidos/:path*',
    '/login',
    '/produtos/:path*',
    '/clientes/:path*',
    '/relatorios/:path*',
    '/dispositivos/:path*',
  ],
}