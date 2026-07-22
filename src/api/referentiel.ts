import { apiClient } from './client'
import type { VerificationCnssResponse } from '@/features/demandes/types'

export async function verifyEmployeurCnss(
  numeroCnss: string,
): Promise<VerificationCnssResponse> {
  const { data } = await apiClient.get<VerificationCnssResponse>(
    `/employeurs/verification-cnss/${encodeURIComponent(numeroCnss)}`,
  )
  return data
}

export async function verifyTravailleurCnss(
  numeroCnss: string,
): Promise<VerificationCnssResponse> {
  const { data } = await apiClient.get<VerificationCnssResponse>(
    `/travailleurs/verification-cnss/${encodeURIComponent(numeroCnss)}`,
  )
  return data
}
