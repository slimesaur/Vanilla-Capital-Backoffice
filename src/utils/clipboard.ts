/**
 * Copy text to clipboard with fallback for non-secure contexts (HTTP).
 * navigator.clipboard requires HTTPS; the textarea fallback works over HTTP.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to legacy fallback
    }
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

/**
 * Safely get the current origin, returning empty string during SSR.
 */
export function getOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}
