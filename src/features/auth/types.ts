/** Rôles métier — enum backend Utilisateur.role */
export type UserRole =
  | 'AGENT_VALIDATION'
  | 'CHEF_VALIDATION'
  | 'SUPERVISEUR'
  | 'ADMINISTRATEUR'

/** Rôles Symfony exposés dans le JWT (section 6). */
export type SymfonyRole =
  | 'ROLE_AGENT_VALIDATION'
  | 'ROLE_CHEF_VALIDATION'
  | 'ROLE_SUPERVISEUR'
  | 'ROLE_ADMIN'

export interface AuthUser {
  id: string
  nom: string
  prenom: string
  identifiant: string
  role: UserRole
  roles: SymfonyRole[]
  moduleAffecte: 'EMPLOYEUR' | 'TRAVAILLEUR' | 'LES_DEUX'
  isFirstConnexion: boolean
}

export const ROLE_TO_SYMFONY: Record<UserRole, SymfonyRole> = {
  AGENT_VALIDATION: 'ROLE_AGENT_VALIDATION',
  CHEF_VALIDATION: 'ROLE_CHEF_VALIDATION',
  SUPERVISEUR: 'ROLE_SUPERVISEUR',
  ADMINISTRATEUR: 'ROLE_ADMIN',
}

export function userHasRole(
  user: AuthUser | null,
  role: SymfonyRole | SymfonyRole[],
): boolean {
  if (!user) return false
  const required = Array.isArray(role) ? role : [role]
  return required.some((r) => user.roles.includes(r))
}

export function getDefaultBackofficePath(user: AuthUser): string {
  switch (user.role) {
    case 'AGENT_VALIDATION':
      return '/backoffice/agent'
    case 'CHEF_VALIDATION':
      return '/backoffice/chef'
    case 'SUPERVISEUR':
      return '/backoffice/superviseur'
    case 'ADMINISTRATEUR':
      return '/backoffice/admin'
  }
}
