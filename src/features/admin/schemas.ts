import { z } from 'zod'

/** RG-12 : un utilisateur interne = une direction + un rôle unique. */
const roleEnum = z.enum([
  'AGENT_VALIDATION',
  'CHEF_VALIDATION',
  'CONTROLEUR',
  'SUPERVISEUR',
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

const utilisateurBaseSchema = z.object({
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
  // Superviseur : pas de module métier (tableau de bord uniquement).
  moduleAffecte: moduleAffecteEnum.optional().nullable(),
  directionId: z.string().min(1, 'Veuillez sélectionner une direction.'),
})

function refineModuleForRole(
  data: z.infer<typeof utilisateurBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.role !== 'SUPERVISEUR' && !data.moduleAffecte) {
    ctx.addIssue({
      code: 'custom',
      path: ['moduleAffecte'],
      message: 'Le module affecté est obligatoire.',
    })
  }
}

export const utilisateurCreateSchema =
  utilisateurBaseSchema.superRefine(refineModuleForRole)

export type UtilisateurCreateFormValues = z.infer<
  typeof utilisateurBaseSchema
>

export const utilisateurEditSchema =
  utilisateurBaseSchema.superRefine(refineModuleForRole)

export type UtilisateurEditFormValues = z.infer<typeof utilisateurBaseSchema>
