import type {
  DemanderOtpNpiPayload,
  DepotDemandeResponse,
  DepotIfuPayload,
  DeposerNpiPayload,
  IfuDgiVerificationResponse,
  NpiVerificationResponse,
  OtpInitResponse,
  OtpVerificationResponse,
  SuiviDemandeResponse,
  VerifierNpiPayload,
  VerifierOtpPayload,
} from '@/features/demandes/types'
import { apiClient } from './client'

export async function depotIfu(
  payload: DepotIfuPayload,
): Promise<DepotDemandeResponse> {
  const { data } = await apiClient.post<DepotDemandeResponse>(
    '/demandes/ifu',
    payload,
  )
  return data
}

/** Prévisualisation DGI avant dépôt final (UC-01, étape IFU). */
export async function verifierIfuDgi(
  ifu: string,
): Promise<IfuDgiVerificationResponse> {
  const { data } = await apiClient.post<IfuDgiVerificationResponse>(
    '/demandes/ifu/verifier-dgi',
    { ifu },
  )
  return data
}

export async function verifierNpiAnip(
  payload: Omit<VerifierNpiPayload, 'action'>,
): Promise<NpiVerificationResponse> {
  const { data } = await apiClient.post<NpiVerificationResponse>('/demandes/npi', {
    ...payload,
    action: 'verifier_npi',
  })
  return data
}

export async function demanderOtpNpi(
  payload: Omit<DemanderOtpNpiPayload, 'action'>,
): Promise<OtpInitResponse> {
  const { data } = await apiClient.post<OtpInitResponse>('/demandes/npi', {
    ...payload,
    action: 'demander_otp',
  })
  return data
}

export async function verifierOtp(
  payload: VerifierOtpPayload,
): Promise<OtpVerificationResponse> {
  const { data } = await apiClient.post<OtpVerificationResponse>(
    '/anip/otp/verifier',
    payload,
  )
  return data
}

export async function deposerNpi(
  payload: DeposerNpiPayload,
): Promise<DepotDemandeResponse> {
  const { data } = await apiClient.post<DepotDemandeResponse>(
    '/demandes/npi',
    payload,
  )
  return data
}

export async function suiviDemande(
  numeroDemande: string,
): Promise<SuiviDemandeResponse> {
  const { data } = await apiClient.get<SuiviDemandeResponse>(
    `/demandes/suivi/${encodeURIComponent(numeroDemande)}`,
  )
  return data
}
