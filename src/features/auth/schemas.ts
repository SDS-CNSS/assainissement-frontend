import { z } from 'zod'

/** RG-20 : min. 12 caractères, au moins 3 des 4 classes de caractères. */
export function countPasswordCharacterClasses(password: string): number {
  let count = 0
  if (/[a-z]/.test(password)) count += 1
  if (/[A-Z]/.test(password)) count += 1
  if (/\d/.test(password)) count += 1
  if (/[^A-Za-z0-9]/.test(password)) count += 1
  return count
}

const passwordComplexityRefine = (password: string) =>
  countPasswordCharacterClasses(password) >= 3

export const passwordSchema = z
  .string()
  .min(
    12,
    'Le mot de passe doit contenir au minimum 12 caractères.',
  )
  .refine(
    passwordComplexityRefine,
    'Le mot de passe doit contenir au moins 3 des 4 types de caractères : majuscules, minuscules, chiffres et caractères spéciaux.',
  )

export const loginSchema = z.object({
  identifiant: z
    .string()
    .min(1, 'Veuillez saisir votre identifiant.'),
  motDePasse: z
    .string()
    .min(1, 'Veuillez saisir votre mot de passe.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    ancienMotDePasse: z
      .string()
      .min(1, 'Veuillez saisir votre mot de passe actuel.'),
    nouveauMotDePasse: passwordSchema,
    confirmationMotDePasse: z
      .string()
      .min(1, 'Veuillez confirmer votre nouveau mot de passe.'),
  })
  .refine(
    (data) => data.nouveauMotDePasse === data.confirmationMotDePasse,
    {
      message: 'La confirmation ne correspond pas au nouveau mot de passe.',
      path: ['confirmationMotDePasse'],
    },
  )
  .refine(
    (data) => data.ancienMotDePasse !== data.nouveauMotDePasse,
    {
      message:
        'Le nouveau mot de passe doit être différent de l\'ancien mot de passe.',
      path: ['nouveauMotDePasse'],
    },
  )

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

/** Première connexion (RG-19) : pas de mot de passe actuel, déjà saisi au login. */
export const firstChangePasswordSchema = z
  .object({
    nouveauMotDePasse: passwordSchema,
    confirmationMotDePasse: z
      .string()
      .min(1, 'Veuillez confirmer votre nouveau mot de passe.'),
  })
  .refine(
    (data) => data.nouveauMotDePasse === data.confirmationMotDePasse,
    {
      message: 'La confirmation ne correspond pas au nouveau mot de passe.',
      path: ['confirmationMotDePasse'],
    },
  )

export type FirstChangePasswordFormValues = z.infer<
  typeof firstChangePasswordSchema
>
