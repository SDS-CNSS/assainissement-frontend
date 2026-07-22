import { describe, expect, it } from 'vitest'
import {
  changePasswordSchema,
  firstChangePasswordSchema,
  loginSchema,
} from '@/features/auth/schemas'

describe('loginSchema', () => {
  it('rejette un formulaire vide', () => {
    const result = loginSchema.safeParse({
      identifiant: '',
      motDePasse: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      expect(fieldErrors.identifiant).toContain('Veuillez saisir votre identifiant.')
      expect(fieldErrors.motDePasse).toContain(
        'Veuillez saisir votre mot de passe.',
      )
    }
  })

  it('accepte des identifiants valides', () => {
    const result = loginSchema.safeParse({
      identifiant: 'agent.cnss',
      motDePasse: 'secret',
    })

    expect(result.success).toBe(true)
  })
})

describe('changePasswordSchema — RG-20', () => {
  it('rejette un mot de passe trop court', () => {
    const result = changePasswordSchema.safeParse({
      ancienMotDePasse: 'OldPassword1!',
      nouveauMotDePasse: 'Short1!',
      confirmationMotDePasse: 'Short1!',
    })

    expect(result.success).toBe(false)
  })
})

describe('firstChangePasswordSchema — RG-19', () => {
  it('accepte un nouveau mot de passe sans mot de passe actuel', () => {
    const result = firstChangePasswordSchema.safeParse({
      nouveauMotDePasse: 'NouveauMotDePasse1!',
      confirmationMotDePasse: 'NouveauMotDePasse1!',
    })

    expect(result.success).toBe(true)
  })

  it('rejette une confirmation différente', () => {
    const result = firstChangePasswordSchema.safeParse({
      nouveauMotDePasse: 'NouveauMotDePasse1!',
      confirmationMotDePasse: 'AutreMotDePasse1!',
    })

    expect(result.success).toBe(false)
  })
})
