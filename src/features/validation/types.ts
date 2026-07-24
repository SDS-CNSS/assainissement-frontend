import type { ActionHistorique } from '@/lib/actionHistorique'
import type { StatutDemande } from '@/lib/statutDemande'
import type { ModuleDemande } from '@/features/demandes/types'

export type ValidationNiveau = 'N1' | 'N2'

export interface DemandeListItem {
  id: string
  numeroDemande: string
  module: ModuleDemande
  numeroCNSS: string
  statut: StatutDemande
  dateCreation: string
  dateMajStatut: string
  raisonSocialeCNSS?: string
  ifu?: string
  raisonSocialeDGI?: string
  npi?: string
  nomAnip?: string
  prenomAnip?: string
}

export interface DemandeListResponse {
  demandes: DemandeListItem[]
  total: number
  page: number
  limit: number
}

export interface DemandeDetail {
  id: string
  numeroDemande: string
  statut: StatutDemande
  module: ModuleDemande
  numeroCNSS: string
  email: string
  dateCreation: string
  dateMajStatut: string
  raisonSocialeCNSS?: string
  raisonSocialeDGI?: string
  ifu?: string
  npi?: string
  nomAnip?: string
  prenomAnip?: string
  telephoneAnip?: string
}

export interface HistoriqueUtilisateur {
  nom: string
  prenom: string
  identifiant: string
}

export interface HistoriqueEntry {
  id: string
  action: ActionHistorique
  motif?: string
  utilisateur?: HistoriqueUtilisateur
  dateAction: string
}

export interface HistoriqueResponse {
  numeroDemande: string
  historique: HistoriqueEntry[]
}

export interface ValidationActionResponse {
  numeroDemande: string
  statut: StatutDemande
  message: string
}

export interface ListDemandesParams {
  niveau?: ValidationNiveau
  module?: ModuleDemande
  page?: number
  limit?: number
}

export type ModuleFilterTab = 'TOUS' | ModuleDemande

export const MODULE_LABELS: Record<ModuleDemande, string> = {
  EMPLOYEUR: 'Employeur (IFU)',
  TRAVAILLEUR: 'Travailleur (NPI)',
}
