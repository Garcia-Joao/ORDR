import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('auth')?.value

  const protectedRoutes = [
    '/produtos',
    '/clientes',
    '/relatorios',
    '/dispositivos',
  ]

  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/produtos/:path*',
    '/clientes/:path*',
    '/relatorios/:path*',
    '/dispositivos/:path*',
  ],
}