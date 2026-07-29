import type { ModuleDemande } from '@/features/demandes/types'
import type { UserRole } from '@/features/auth/types'
import type { DemandeListItem } from '@/features/validation/types'
import type { StatutDemande } from '@/lib/statutDemande'

export type ModuleAffecte = 'EMPLOYEUR' | 'TRAVAILLEUR' | 'LES_DEUX'

export interface Direction {
  id: string
  nom: string
  abreviation: string
  nbUtilisateurs?: number
}

export interface UtilisateurListItem {
  id: string
  nom: string
  prenom: string
  identifiant: string
  role: UserRole
  niveau: number
  moduleAffecte: ModuleAffecte
  directionId: string
  directionNom: string
  directionAbreviation: string
  isActive: boolean
  isFirstConnexion: boolean
  isVerrouille: boolean
  dtCreation: string
  dtLastLogin?: string | null
}

export interface CreateUtilisateurPayload {
  nom: string
  prenom: string
  identifiant: string
  role: UserRole
  moduleAffecte: ModuleAffecte
  directionId: string
}

export interface UpdateUtilisateurPayload {
  nom: string
  prenom: string
  identifiant: string
  role: UserRole
  moduleAffecte: ModuleAffecte
  directionId: string
}

export interface SetUtilisateurStatutPayload {
  isActive: boolean
}

export interface CreateUtilisateurResponse {
  utilisateur: UtilisateurListItem
  motDePasseTemporaire: string
  documentBase64: string
  documentFilename: string
}

export interface CreateDirectionPayload {
  nom: string
  abreviation: string
}

export interface UpdateDirectionPayload {
  nom: string
  abreviation: string
}

export interface TableauDeBordFilters {
  dateDebut?: string
  dateFin?: string
  module?: ModuleDemande
  statut?: StatutDemande
}

export interface EvolutionPoint {
  date: string
  count: number
  employeur: number
  travailleur: number
}

export interface TableauDeBordStats {
  totalDemandes: number
  enAttenteN1: number
  enAttenteN2: number
  valideesDefinitivement: number
  rejetees: number
  parModule: {
    employeur: number
    travailleur: number
  }
  parStatut: Record<string, number>
  evolution: EvolutionPoint[]
}

export interface SupervisionFilters {
  module?: ModuleDemande
  statut?: StatutDemande
  search?: string
  page?: number
  limit?: number
}

export interface SupervisionListResponse {
  demandes: DemandeListItem[]
  total: number
  page: number
  limit: number
}

export const ROLE_LABELS: Record<UserRole, string> = {
  AGENT_VALIDATION: 'Agent 1',
  CHEF_VALIDATION: 'Agent 2',
  CONTROLEUR: 'Contrôleur',
  SUPERVISEUR: 'Superviseur',
  ADMINISTRATEUR: 'Administrateur',
}

export const MODULE_AFFECTE_LABELS: Record<ModuleAffecte, string> = {
  EMPLOYEUR: 'Employeur (IFU)',
  TRAVAILLEUR: 'Travailleur (NPI)',
  LES_DEUX: 'Les deux modules',
}

export interface AuditLogEntry {
  id: string
  action: string
  actionLabel: string
  timestamp: string
  entiteCible: string | null
  valeurAvant: Record<string, unknown> | null
  valeurApres: Record<string, unknown> | null
  ipAddress: string | null
  utilisateur: string | null
  userId: string | null
  userIdentifiant: string | null
  userNom: string | null
  userPrenom: string | null
  userRole: UserRole | null
  isSuccess: boolean
}

export interface AuditLogSummary {
  totalActions: number
  connexionsActivesAujourdhui: number
  anomalies: number
  dernierExport: string | null
}

export interface AuditLogListParams {
  action?: string
  dateDebut?: string
  dateFin?: string
  userId?: string
  resultat?: 'success' | 'failure'
  page?: number
  limit?: number
}

export interface AuditLogListResponse {
  items: AuditLogEntry[]
  total: number
  page: number
  limit: number
}
