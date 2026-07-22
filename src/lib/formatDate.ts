/** Format ISO 8601 pour affichage back office / portail. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(isoDate))
}

/** Format compact pour tableaux (jj/mm/aaaa HH:mm:ss). */
export function formatDateTimeTable(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(isoDate))
}
