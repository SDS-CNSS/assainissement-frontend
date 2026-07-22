import { describe, expect, it } from 'vitest'
import {
  ifuEmailStepSchema,
  ifuSchema,
  ifuStepSchema,
} from '@/features/demandes/schemas'

describe('ifuStepSchema — RG-15', () => {
  it('rejette un IFU avec moins de 13 chiffres', () => {
    const result = ifuStepSchema.safeParse({ ifu: '123456789012' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.ifu).toContain(
        'L\'IFU doit comporter exactement 13 chiffres.',
      )
    }
  })

  it('rejette un IFU contenant des lettres', () => {
    const result = ifuStepSchema.safeParse({ ifu: '320251234567A' })

    expect(result.success).toBe(false)
  })

  it('accepte un IFU de 13 chiffres', () => {
    const result = ifuStepSchema.safeParse({ ifu: '3202512345678' })

    expect(result.success).toBe(true)
  })
})

describe('ifuEmailStepSchema — RG-07', () => {
  it('rejette des e-mails différents', () => {
    const result = ifuEmailStepSchema.safeParse({
      email: 'contact@entreprise.bj',
      emailConfirmation: 'autre@entreprise.bj',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.emailConfirmation).toContain(
        'Les deux adresses e-mail doivent être identiques.',
      )
    }
  })

  it('accepte des e-mails identiques', () => {
    const result = ifuEmailStepSchema.safeParse({
      email: 'contact@entreprise.bj',
      emailConfirmation: 'contact@entreprise.bj',
    })

    expect(result.success).toBe(true)
  })
})

describe('ifuSchema', () => {
  it('valide un formulaire IFU complet', () => {
    const result = ifuSchema.safeParse({
      numeroCNSS: '1000123456',
      ifu: '3202512345678',
      email: 'contact@entreprise.bj',
      emailConfirmation: 'contact@entreprise.bj',
    })

    expect(result.success).toBe(true)
  })
})
