import { z } from 'zod'

/** RG-08 : motif obligatoire pour tout rejet N1 ou N2. */
export const rejetSchema = z.object({
  motif: z
    .string()
    .min(1, 'Le motif de rejet est obligatoire.')
    .min(
      10,
      'Le motif de rejet doit comporter au moins 10 caractères.',
    ),
})

export type RejetFormValues = z.infer<typeof rejetSchema>
