import { describe, expect, it } from 'vitest'
import { rejetSchema } from '@/features/validation/schemas'

describe('rejetSchema — RG-08', () => {
  it('rejette un motif vide', () => {
    const result = rejetSchema.safeParse({ motif: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.motif).toContain(
        'Le motif de rejet est obligatoire.',
      )
    }
  })

  it('rejette un motif trop court', () => {
    const result = rejetSchema.safeParse({ motif: 'Court' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.motif).toContain(
        'Le motif de rejet doit comporter au moins 10 caractères.',
      )
    }
  })

  it('accepte un motif valide', () => {
    const result = rejetSchema.safeParse({
      motif: 'Documents incomplets ou non conformes.',
    })

    expect(result.success).toBe(true)
  })
})
