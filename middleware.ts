import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './routing'

const intlMiddleware = createIntlMiddleware(routing)

const PORTFOLIO_SLUGS = new Set([
  'asset-allocation',
  'retirement-planning',
  'wealth-protection',
  'real-estate-auction',
  'ai-solutions',
  'business-advisory',
])

/**
 * Legacy multi-page routes → long-scroll home with hash (308 permanent).
 */
function redirectLegacyMarketingToHomeHash(
  request: NextRequest
): NextResponse | null {
  const { pathname } = request.nextUrl

  const about = pathname.match(/^\/(pt|en)\/about\/?$/)
  if (about) {
    const locale = about[1]
    return NextResponse.redirect(new URL(`/${locale}#about`, request.url), 308)
  }

  const contact = pathname.match(/^\/(pt|en)\/contact\/?$/)
  if (contact) {
    const locale = contact[1]
    return NextResponse.redirect(new URL(`/${locale}#contact`, request.url), 308)
  }

  const portfolioSlug = pathname.match(/^\/(pt|en)\/portfolio\/([^/]+)\/?$/)
  if (portfolioSlug) {
    const locale = portfolioSlug[1]
    const slug = portfolioSlug[2]
    if (PORTFOLIO_SLUGS.has(slug)) {
      return NextResponse.redirect(
        new URL(`/${locale}#${slug}`, request.url),
        308
      )
    }
  }

  const portfolioIndex = pathname.match(/^\/(pt|en)\/portfolio\/?$/)
  if (portfolioIndex) {
    const locale = portfolioIndex[1]
    return NextResponse.redirect(
      new URL(`/${locale}#asset-allocation`, request.url),
      308
    )
  }

  return null
}

/** Page routes that do not require auth */
const PUBLIC_PAGE_PATHS = [
  '/login',
  '/registration/fill',
  '/suitability/fill',
]

/** Page routes that REQUIRE auth (redirect to login if no session) */
const PROTECTED_PAGE_PATHS = ['/backoffice']

/** API routes that do not require auth */
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/contact',
  '/api/registration/responses',
  '/api/suitability/forms/',
]

const STATIC_EXTENSIONS = [
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.css', '.js',
  '.woff', '.woff2', '.otf', '.ttf', '.eot',
]

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
    pathname.startsWith('/uploads') ||
    STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  ) {
    return NextResponse.next()
  }

  // API routes: protect all except public
  if (pathname.startsWith('/api/')) {
    if (isPublicApi(pathname)) {
      return NextResponse.next()
    }
    // Marketing site: list compliance PDF URLs (read-only). POST upload stays behind session below.
    if (pathname === '/api/compliance/documents' && request.method === 'GET') {
      return NextResponse.next()
    }
    const session = request.cookies.get('vanilla-session')
    if (!session?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Protected page routes (backoffice): require session, redirect to login
  if (PROTECTED_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const session = request.cookies.get('vanilla-session')
    if (!session?.value) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Redirect already-authenticated users away from login
  if (pathname === '/login') {
    const session = request.cookies.get('vanilla-session')
    if (session?.value) {
      return NextResponse.redirect(new URL('/backoffice', request.url))
    }
    return NextResponse.next()
  }

  // Public page routes (registration, suitability) - no locale, pass through
  if (isPublicPage(pathname)) {
    return NextResponse.next()
  }

  const legacyHash = redirectLegacyMarketingToHomeHash(request)
  if (legacyHash) return legacyHash

  // Locale routes (/, /pt, /en, /pt/*, /en/*) and invalid locale - use next-intl
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except api, _next, _vercel, and static files (explicit `/` + pattern — stable with our auth + intl stack)
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)'],
}
