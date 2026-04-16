import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('auth')?.value
  const isLoggedIn = Boolean(authCookie)
  const { pathname } = request.nextUrl

  console.log('PATH:', pathname)
  console.log('AUTH COOKIE:', authCookie)

  const protectedRoutes = ['/', '/produtos', '/clientes', '/relatorios', '/dispositivos']

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })

  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/produtos/:path*',
    '/clientes/:path*',
    '/relatorios/:path*',
    '/dispositivos/:path*',
  ],
}