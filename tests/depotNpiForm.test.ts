import { describe, expect, it } from 'vitest'
import {
  npiEmailStepSchema,
  npiSchema,
  otpStepSchema,
} from '@/features/demandes/schemas'

describe('otpStepSchema — RG-06', () => {
  it('rejette un code OTP de moins de 6 caractères', () => {
    const result = otpStepSchema.safeParse({ code: '12A45' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.code).toContain(
        'Le code OTP est invalide.',
      )
    }
  })

  it('rejette un code OTP avec caractères spéciaux', () => {
    const result = otpStepSchema.safeParse({ code: '12A45!' })

    expect(result.success).toBe(false)
  })

  it('accepte un code OTP alphanumérique en majuscules', () => {
    const result = otpStepSchema.safeParse({ code: 'A4B291' })

    expect(result.success).toBe(true)
  })

  it('normalise un code OTP saisi en minuscules', () => {
    const result = otpStepSchema.safeParse({ code: 'a4b291' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toBe('A4B291')
    }
  })
})

describe('npiEmailStepSchema — RG-07', () => {
  it('rejette des e-mails différents', () => {
    const result = npiEmailStepSchema.safeParse({
      email: 'jean.dupont@mail.bj',
      emailConfirmation: 'jean@mail.bj',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.emailConfirmation).toContain(
        'Les deux adresses électroniques doivent être identiques.',
      )
    }
  })

  it('accepte des e-mails identiques', () => {
    const result = npiEmailStepSchema.safeParse({
      email: 'jean.dupont@mail.bj',
      emailConfirmation: 'jean.dupont@mail.bj',
    })

    expect(result.success).toBe(true)
  })
})

describe('npiSchema', () => {
  it('valide un formulaire NPI complet', () => {
    const result = npiSchema.safeParse({
      numeroCNSS: '2000111222',
      npi: '1234567890123456',
      code: 'A4B291',
      email: 'jean.dupont@mail.bj',
      emailConfirmation: 'jean.dupont@mail.bj',
    })

    expect(result.success).toBe(true)
  })
})
