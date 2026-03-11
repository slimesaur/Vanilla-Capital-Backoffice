import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './routing'

const intlMiddleware = createIntlMiddleware(routing)

/** Page routes that do not require auth */
const PUBLIC_PAGE_PATHS = [
  '/login',
  '/registration/fill',
  '/suitability/fill',
]

/** API routes that do not require auth */
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/registration/responses',
  '/api/suitability/forms/',
]

const STATIC_EXTENSIONS = [
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.css', '.js',
  '.woff', '.woff2', '.otf', '.ttf', '.eot',
]

const LOCALE_PATTERN = /^\/(pt|en)(\/|$)/
const INVALID_LOCALE_PATTERN = /^\/[a-z]{2}(\/|$)/

function isLocalePath(pathname: string): boolean {
  return pathname === '/' || LOCALE_PATTERN.test(pathname)
}

function isInvalidLocalePath(pathname: string): boolean {
  return INVALID_LOCALE_PATTERN.test(pathname) && !LOCALE_PATTERN.test(pathname)
}

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGE_PATHS.some((p) => pathname.startsWith(p))
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/logos') ||
    pathname.startsWith('/benchmark') ||
    pathname.startsWith('/images') ||
    STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  ) {
    return NextResponse.next()
  }

  // Locale routes (landing pages): use next-intl middleware
  if (isLocalePath(pathname)) {
    return intlMiddleware(request)
  }

  // Invalid locale (e.g. /es, /de) - let through so [locale] layout can notFound()
  if (isInvalidLocalePath(pathname)) {
    return NextResponse.next()
  }

  // Public page routes (login, registration forms, suitability forms)
  if (isPublicPage(pathname)) {
    return NextResponse.next()
  }

  // API routes: protect all except public
  if (pathname.startsWith('/api/')) {
    if (isPublicApi(pathname)) {
      return NextResponse.next()
    }
    const session = request.cookies.get('vanilla-session')
    if (!session?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // All other page routes: require session, redirect to login
  const session = request.cookies.get('vanilla-session')
  if (!session?.value) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/(pt|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
