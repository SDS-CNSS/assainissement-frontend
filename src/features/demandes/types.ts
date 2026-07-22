import type { StatutDemande } from '@/lib/statutDemande'

export type ModuleDemande = 'EMPLOYEUR' | 'TRAVAILLEUR'

export interface VerificationCnssResponse {
  existe: boolean
  raisonSociale?: string
  nom?: string
  prenom?: string
}

export interface IfuDgiVerificationResponse {
  ifu: string
  raisonSociale: string
}

export interface DepotDemandeResponse {
  numeroDemande: string
  statut: StatutDemande
  message: string
  raisonSocialeDGI?: string
}

export interface DemanderOtpNpiPayload {
  action: 'demander_otp'
  numeroCNSS: string
  npi: string
  email: string
  emailConfirmation: string
}

export interface VerifierNpiPayload {
  action: 'verifier_npi'
  numeroCNSS: string
  npi: string
}

export interface NpiVerificationResponse {
  valide: boolean
  message: string
}

export interface OtpInitResponse {
  sessionToken: string
  emailMasque: string
}

export interface VerifierOtpPayload {
  sessionToken: string
  code: string
}

export interface OtpVerificationResponse {
  verified: boolean
  message: string
  npi?: string
  nom?: string
  prenom?: string
  telephoneMasque?: string
}

export interface DeposerNpiPayload {
  sessionToken: string
  otpCode: string
  email: string
  emailConfirmation: string
}

export interface DepotIfuPayload {
  numeroCNSS: string
  ifu: string
  email: string
  emailConfirmation: string
}

export interface SuiviDemandeResponse {
  numeroDemande: string
  statut: StatutDemande
  module: ModuleDemande
  numeroCNSS: string
  emailMasque: string
  dateCreation: string
  dateMajStatut: string
  raisonSocialeCNSS?: string
  raisonSocialeDGI?: string
  ifu?: string
  npi?: string
  nomAnip?: string
  prenomAnip?: string
}
