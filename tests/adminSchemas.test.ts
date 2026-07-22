import { describe, expect, it } from 'vitest'
import {
  directionFormSchema,
  utilisateurCreateSchema,
  utilisateurEditSchema,
} from '@/features/admin/schemas'

describe('directionFormSchema', () => {
  it('rejette une abréviation vide', () => {
    const result = directionFormSchema.safeParse({
      nom: 'Direction des Systèmes',
      abreviation: '',
    })

    expect(result.success).toBe(false)
  })

  it('rejette une abréviation avec caractères invalides', () => {
    const result = directionFormSchema.safeParse({
      nom: 'Direction des Systèmes',
      abreviation: 'dsi@',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('majuscules')
    }
  })

  it('accepte une direction valide', () => {
    const result = directionFormSchema.safeParse({
      nom: 'Direction des Systèmes d\'Information',
      abreviation: 'DSI',
    })

    expect(result.success).toBe(true)
  })
})

describe('utilisateurCreateSchema — RG-12', () => {
  it('rejette un formulaire sans direction', () => {
    const result = utilisateurCreateSchema.safeParse({
      nom: 'DOSSOU',
      prenom: 'Clarisse',
      identifiant: 'agent.test',
      role: 'AGENT_VALIDATION',
      moduleAffecte: 'EMPLOYEUR',
      directionId: '',
    })

    expect(result.success).toBe(false)
  })

  it('rejette un identifiant avec espaces', () => {
    const result = utilisateurCreateSchema.safeParse({
      nom: 'DOSSOU',
      prenom: 'Clarisse',
      identifiant: 'agent test',
      role: 'AGENT_VALIDATION',
      moduleAffecte: 'EMPLOYEUR',
      directionId: '1',
    })

    expect(result.success).toBe(false)
  })

  it('accepte un utilisateur valide', () => {
    const result = utilisateurCreateSchema.safeParse({
      nom: 'DOSSOU',
      prenom: 'Clarisse',
      identifiant: 'agent.test',
      role: 'AGENT_VALIDATION',
      moduleAffecte: 'EMPLOYEUR',
      directionId: '1',
    })

    expect(result.success).toBe(true)
  })
})

describe('utilisateurEditSchema', () => {
  it('accepte la mise à jour sans statut actif', () => {
    const result = utilisateurEditSchema.safeParse({
      nom: 'ZINSOU',
      prenom: 'Prudence',
      role: 'CHEF_VALIDATION',
      moduleAffecte: 'LES_DEUX',
      directionId: '2',
    })

    expect(result.success).toBe(true)
  })
})
