/**
 * True when the user is on the long-scroll marketing home (`/{locale}`).
 * Supports both `next/navigation` pathnames (`/pt`, `/en`) and locale-stripped
 * pathnames (`/`) from next-intl `createNavigation` in some setups.
 */
export function isMarketingHomePath(
  pathname: string | null | undefined,
  locale: string
): boolean {
  if (pathname == null) return false
  const p = pathname.replace(/\/$/, '') || '/'
  if (p === `/${locale}`) return true
  if (p === '/') return true
  return false
}
