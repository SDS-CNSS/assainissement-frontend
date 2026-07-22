import { z } from 'zod'

/** RG-12 : un utilisateur interne = une direction + un rôle unique. */
const roleEnum = z.enum([
  'AGENT_VALIDATION',
  'CHEF_VALIDATION',
  'ADMINISTRATEUR',
])

const moduleAffecteEnum = z.enum(['EMPLOYEUR', 'TRAVAILLEUR', 'LES_DEUX'])

export const directionFormSchema = z.object({
  nom: z
    .string()
    .min(1, 'Le nom de la direction est obligatoire.')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères.'),
  abreviation: z
    .string()
    .min(1, 'L\'abréviation est obligatoire.')
    .max(20, 'L\'abréviation ne peut pas dépasser 20 caractères.')
    .regex(
      /^[A-Z0-9_-]+$/,
      'L\'abréviation ne peut contenir que des majuscules, chiffres, tirets ou underscores.',
    ),
})

export type DirectionFormValues = z.infer<typeof directionFormSchema>

export const utilisateurCreateSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire.').max(100),
  prenom: z.string().min(1, 'Le prénom est obligatoire.').max(100),
  identifiant: z
    .string()
    .min(1, 'L\'identifiant est obligatoire.')
    .max(50)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'L\'identifiant ne peut contenir que des lettres, chiffres, points, tirets ou underscores.',
    ),
  role: roleEnum,
  moduleAffecte: moduleAffecteEnum,
  directionId: z.string().min(1, 'Veuillez sélectionner une direction.'),
})

export type UtilisateurCreateFormValues = z.infer<
  typeof utilisateurCreateSchema
>

export const utilisateurEditSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire.').max(100),
  prenom: z.string().min(1, 'Le prénom est obligatoire.').max(100),
  role: roleEnum,
  moduleAffecte: moduleAffecteEnum,
  directionId: z.string().min(1, 'Veuillez sélectionner une direction.'),
})

export type UtilisateurEditFormValues = z.infer<typeof utilisateurEditSchema>
