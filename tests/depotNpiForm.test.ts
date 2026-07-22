import { describe, expect, it } from 'vitest'
import {
  npiEmailStepSchema,
  npiSchema,
  otpStepSchema,
} from '@/features/demandes/schemas'

describe('otpStepSchema — RG-06', () => {
  it('rejette un code OTP de moins de 6 chiffres', () => {
    const result = otpStepSchema.safeParse({ code: '12345' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.code).toContain(
        'Le code OTP doit comporter exactement 6 chiffres.',
      )
    }
  })

  it('rejette un code OTP contenant des lettres', () => {
    const result = otpStepSchema.safeParse({ code: '12345A' })

    expect(result.success).toBe(false)
  })

  it('accepte un code OTP de 6 chiffres', () => {
    const result = otpStepSchema.safeParse({ code: '482910' })

    expect(result.success).toBe(true)
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
        'Les deux adresses e-mail doivent être identiques.',
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
      code: '482910',
      email: 'jean.dupont@mail.bj',
      emailConfirmation: 'jean.dupont@mail.bj',
    })

    expect(result.success).toBe(true)
  })
})
