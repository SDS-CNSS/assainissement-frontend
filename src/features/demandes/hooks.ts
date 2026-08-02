import { useMutation, useQuery } from '@tanstack/react-query'
import {
  demanderOtpIfu,
  demanderOtpNpi,
  deposerNpi,
  depotIfu,
  suiviDemande,
  verifierIfuDgi,
  verifierNpiAnip,
  verifierOtp,
} from '@/api/demandes'
import {
  verifyEmployeurCnss,
  verifyTravailleurCnss,
} from '@/api/referentiel'
import type {
  DeposerNpiPayload,
  DepotIfuPayload,
  VerifierOtpPayload,
} from './types'

export function useVerifyEmployeurCnss() {
  return useMutation({
    mutationFn: verifyEmployeurCnss,
  })
}

export function useVerifyTravailleurCnss() {
  return useMutation({
    mutationFn: verifyTravailleurCnss,
  })
}

export function useVerifierIfuDgi() {
  return useMutation({
    mutationFn: verifierIfuDgi,
  })
}

export function useDepotIfu() {
  return useMutation({
    mutationFn: (payload: DepotIfuPayload) => depotIfu(payload),
  })
}

export function useDemanderOtpIfu() {
  return useMutation({
    mutationFn: demanderOtpIfu,
  })
}

export function useVerifierNpiAnip() {
  return useMutation({
    mutationFn: verifierNpiAnip,
  })
}

export function useDemanderOtpNpi() {
  return useMutation({
    mutationFn: demanderOtpNpi,
  })
}

export function useVerifierOtp() {
  return useMutation({
    mutationFn: (payload: VerifierOtpPayload) => verifierOtp(payload),
  })
}

export function useDeposerNpi() {
  return useMutation({
    mutationFn: (payload: DeposerNpiPayload) => deposerNpi(payload),
  })
}

export function useSuiviDemande(numeroDemande: string | null) {
  return useQuery({
    queryKey: ['demandes', 'suivi', numeroDemande],
    queryFn: () => suiviDemande(numeroDemande!),
    enabled: Boolean(numeroDemande),
    retry: false,
  })
}
