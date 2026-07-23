/** Actions d'audit — alignées sur l'enum backend AuditAction. */
import type { UserRole } from '@/features/auth/types'

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'DIRECTION_CREATE'
  | 'DIRECTION_UPDATE'
  | 'DIRECTION_DELETE'
  | 'UTILISATEUR_CREATE'
  | 'UTILISATEUR_UPDATE'
  | 'UTILISATEUR_DEACTIVATE'
  | 'UTILISATEUR_DEVERROUILLER'
  | 'STATISTIQUES_EXPORT'
  | 'PASSWORD_CHANGE'
  | 'DEMANDE_VALIDATION_N1'
  | 'DEMANDE_REJET_N1'
  | 'DEMANDE_VALIDATION_N2'
  | 'DEMANDE_REJET_N2'
  | 'DEMANDE_VALIDATION_SUPERVISEUR'
  | 'DEMANDE_REJET_SUPERVISEUR'
  | 'CONSOLIDATION'

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGIN_FAILURE: 'Échec de connexion',
  DIRECTION_CREATE: 'Création de direction',
  DIRECTION_UPDATE: 'Modification de direction',
  DIRECTION_DELETE: 'Suppression de direction',
  UTILISATEUR_CREATE: 'Création d\'utilisateur',
  UTILISATEUR_UPDATE: 'Modification d\'utilisateur',
  UTILISATEUR_DEACTIVATE: 'Désactivation d\'utilisateur',
  UTILISATEUR_DEVERROUILLER: 'Déverrouillage de compte',
  STATISTIQUES_EXPORT: 'Export statistiques',
  PASSWORD_CHANGE: 'Changement de mot de passe',
  DEMANDE_VALIDATION_N1: 'Validation Agent 1 de demande',
  DEMANDE_REJET_N1: 'Rejet Agent 1 de demande',
  DEMANDE_VALIDATION_N2: 'Validation Agent 2 de demande',
  DEMANDE_REJET_N2: 'Rejet Agent 2 de demande',
  DEMANDE_VALIDATION_SUPERVISEUR: 'Validation Superviseur de demande',
  DEMANDE_REJET_SUPERVISEUR: 'Rejet Superviseur de demande',
  CONSOLIDATION: 'Consolidation référentiel',
}

export const AUDIT_ACTION_OPTIONS = (
  Object.entries(AUDIT_ACTION_LABELS) as [AuditAction, string][]
).map(([value, label]) => ({ value, label }))

export function getAuditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action as AuditAction] ?? action
}

const AUDIT_ACTION_SHORT_LABELS: Partial<Record<AuditAction, string>> = {
  LOGIN_SUCCESS: 'LOGIN',
  LOGIN_FAILURE: 'LOGIN',
  STATISTIQUES_EXPORT: 'EXPORT',
}

export function getAuditActionShortLabel(action: string): string {
  return AUDIT_ACTION_SHORT_LABELS[action as AuditAction] ?? action
}

export function isAuditFailure(action: string): boolean {
  return action === 'LOGIN_FAILURE'
}

export function formatAuditLogReference(id: string, timestamp: string): string {
  const year = new Date(timestamp).getFullYear()
  const numericId = Number.parseInt(id, 10)

  return `#LOG-${year}-LOG-${String(numericId).padStart(5, '0')}`
}

export const ROLE_SHORT_LABELS: Record<UserRole, string> = {
  ADMINISTRATEUR: 'ADMIN',
  AGENT_VALIDATION: 'AGENT 1',
  CHEF_VALIDATION: 'AGENT 2',
  SUPERVISEUR: 'SUPERVISEUR',
}
