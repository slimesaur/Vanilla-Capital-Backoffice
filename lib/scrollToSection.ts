/**
 * In-page scroll helpers for the long-scroll landing (accessibility + reduced motion).
 */

export const LANDING_HASH_NAV_EVENT = 'vanilla-landing-hash';

export function emitLandingHashNavigation(id: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(LANDING_HASH_NAV_EVENT, { detail: { id } })
  );
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToSectionElement(
  el: HTMLElement,
  options?: { focus?: boolean }
): void {
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'
  el.scrollIntoView({ behavior, block: 'start' })

  const focus = options?.focus !== false
  if (focus) {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }
}

/** Returns false if the element is missing (e.g. before hydration). */
export function scrollToSectionId(
  id: string,
  options?: { focus?: boolean }
): boolean {
  const el = document.getElementById(id)
  if (!el || !(el instanceof HTMLElement)) return false
  scrollToSectionElement(el, options)
  return true
}
