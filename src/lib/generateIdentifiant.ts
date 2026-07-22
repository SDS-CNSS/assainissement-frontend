function extractLetters(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

/** Première lettre du prénom + jusqu'à 7 lettres du nom. */
export function generateIdentifiantFromName(
  prenom: string,
  nom: string,
): string {
  const prenomLetters = extractLetters(prenom.trim())
  const nomLetters = extractLetters(nom.trim())

  const firstInitial = prenomLetters.charAt(0)
  const nomPart = nomLetters.slice(0, 7)

  return `${firstInitial}${nomPart}`
}
