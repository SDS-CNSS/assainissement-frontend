/**
 * Masque un e-mail pour affichage public (aligné sur DataMaskingService backend).
 * Ex. augustinfachehoun97@gmail.com → a***@gmail.com
 */
export function maskEmail(email: string): string {
  const trimmed = email.trim()
  const at = trimmed.indexOf('@')
  if (at <= 0) {
    return '***'
  }

  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)

  return `${local.charAt(0)}***@${domain}`
}
