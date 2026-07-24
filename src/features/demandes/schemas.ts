import { z } from 'zod'

const emailField = z
  .string()
  .min(1, 'Veuillez saisir votre adresse courriel.')
  .email('L\'adresse courriel saisie n\'est pas valide.')

const emailConfirmationRefine = <T extends { email: string; emailConfirmation: string }>(
  data: T,
  ctx: z.RefinementCtx,
) => {
  if (data.email !== data.emailConfirmation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Les deux adresses courriel doivent être identiques.',
      path: ['emailConfirmation'],
    })
  }
}

/** RG-02 / RG-23 : numéro CNSS employeur requis ; unicité contrôlée côté API. */
export const cnssEmployeurStepSchema = z.object({
  numeroCNSS: z
    .string()
    .min(1, 'Veuillez saisir votre numéro CNSS.')
    .regex(/^\d+$/, 'Le numéro CNSS ne doit contenir que des chiffres.'),
})

/** RG-15 : IFU = exactement 13 chiffres. */
export const ifuStepSchema = z.object({
  ifu: z
    .string()
    .min(1, 'Veuillez saisir votre IFU.')
    .regex(/^\d{13}$/, 'L\'IFU doit comporter exactement 13 chiffres.'),
})

/** RG-07 : double saisie courriel strictement identique. */
export const ifuEmailStepSchema = z
  .object({
    email: emailField,
    emailConfirmation: z
      .string()
      .min(1, 'Veuillez confirmer votre adresse courriel.'),
  })
  .superRefine(emailConfirmationRefine)

export const ifuSchema = cnssEmployeurStepSchema
  .merge(ifuStepSchema)
  .merge(ifuEmailStepSchema)

export type CnssEmployeurStepValues = z.infer<typeof cnssEmployeurStepSchema>
export type IfuStepValues = z.infer<typeof ifuStepSchema>
export type IfuEmailStepValues = z.infer<typeof ifuEmailStepSchema>
export type IfuFormValues = z.infer<typeof ifuSchema>

/** RG-03 / RG-23 : numéro CNSS travailleur ; unicité contrôlée côté API. */
export const cnssTravailleurStepSchema = z.object({
  numeroCNSS: z
    .string()
    .min(1, 'Veuillez saisir votre numéro CNSS.')
    .regex(/^\d+$/, 'Le numéro CNSS ne doit contenir que des chiffres.'),
})

export const npiStepSchema = z.object({
  npi: z
    .string()
    .min(1, 'Veuillez saisir votre NPI.')
    .regex(/^\d{16}$/, 'Le NPI doit comporter exactement 16 chiffres.'),
})

/** RG-06 : code OTP à 6 chiffres. */
export const otpStepSchema = z.object({
  code: z
    .string()
    .min(1, 'Veuillez saisir le code OTP.')
    .regex(/^\d{6}$/, 'Le code OTP doit comporter exactement 6 chiffres.'),
})

export const npiEmailStepSchema = z
  .object({
    email: emailField,
    emailConfirmation: z
      .string()
      .min(1, 'Veuillez confirmer votre adresse courriel.'),
  })
  .superRefine(emailConfirmationRefine)

export const npiSchema = cnssTravailleurStepSchema
  .merge(npiStepSchema)
  .merge(otpStepSchema)
  .merge(npiEmailStepSchema)

export type CnssTravailleurStepValues = z.infer<typeof cnssTravailleurStepSchema>
export type NpiStepValues = z.infer<typeof npiStepSchema>
export type OtpStepValues = z.infer<typeof otpStepSchema>
export type NpiEmailStepValues = z.infer<typeof npiEmailStepSchema>
export type NpiFormValues = z.infer<typeof npiSchema>

/** RG-01 (adapté) : 10 caractères — 4 lettres + 6 chiffres, positions libres (ex. A1B23C45D6). */
export function isNumeroDemandeFormat(value: string): boolean {
  if (!/^[A-Z0-9]{10}$/.test(value)) {
    return false
  }
  const letters = (value.match(/[A-Z]/g) ?? []).length
  const digits = (value.match(/\d/g) ?? []).length
  return letters === 4 && digits === 6
}

export const suiviSchema = z.object({
  numeroDemande: z
    .string()
    .min(1, 'Veuillez saisir le numéro de demande.')
    .transform((value) => value.trim().toUpperCase())
    .refine(
      isNumeroDemandeFormat,
      'Le numéro de demande doit comporter exactement 4 lettres et 6 chiffres (10 caractères, ex. A1B23C45D6).',
    ),
})

export type SuiviFormValues = z.infer<typeof suiviSchema>
