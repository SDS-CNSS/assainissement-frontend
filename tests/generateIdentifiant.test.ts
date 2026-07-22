import { describe, expect, it } from 'vitest'
import { generateIdentifiantFromName } from '@/lib/generateIdentifiant'

describe('generateIdentifiantFromName', () => {
  it('combine la première lettre du prénom et jusqu’à 7 lettres du nom', () => {
    expect(generateIdentifiantFromName('Clarisse', 'DOSSOU')).toBe('cdossou')
    expect(generateIdentifiantFromName('Jean', 'Dupont')).toBe('jdupont')
  })

  it('limite le nom à 7 lettres', () => {
    expect(generateIdentifiantFromName('Marie', 'MARTINIERE')).toBe('mmartini')
  })

  it('ignore espaces, tirets et accents', () => {
    expect(generateIdentifiantFromName('Émilie', 'de-la-Roche')).toBe('edelaroc')
    expect(generateIdentifiantFromName('Jean-Pierre', 'O\'Connor')).toBe('joconnor')
  })

  it('retourne une chaîne vide si prénom et nom sont vides', () => {
    expect(generateIdentifiantFromName('', '')).toBe('')
  })
})
