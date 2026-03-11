import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './routing'

const intlMiddleware = createIntlMiddleware(routing)

const PUBLIC_PATHS = [
  '/login',
  '/registration/fill',
  '/suitability/fill',
  '/api/auth/login',
  '/api/registration/responses',
  '/api/suitability/forms/',
]

const STATIC_EXTENSIONS = [
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.css', '.js',
  '.woff', '.woff2', '.otf', '.ttf', '.eot',
]

const LOCALE_PATTERN = /^\/(pt|en|es|de|zh)(\/|$)/

function isLocalePath(pathname: string): boolean {
  return pathname === '/' || LOCALE_PATTERN.test(pathname)
}

function isProtectedApi(pathname: string): boolean {
  return (
    pathname.startsWith('/api/clients') ||
    pathname.startsWith('/api/migrate')
  )
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

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protected API routes: require session
  if (pathname.startsWith('/api/') && isProtectedApi(pathname)) {
    const session = request.cookies.get('vanilla-session')
    if (!session?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Backoffice page routes: require session, redirect to login
  if (pathname.startsWith('/backoffice')) {
    const session = request.cookies.get('vanilla-session')
    if (!session?.value) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/(pt|en|es|de|zh)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
