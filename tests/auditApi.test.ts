import { describe, expect, it } from 'vitest'
import { mapAuditLogEntry } from '@/api/admin/audit'
import { getApiErrorMessage } from '@/api/types'

describe('mapAuditLogEntry', () => {
  it('mappe les champs API et parse le JSON valeurAvant/valeurApres', () => {
    const entry = mapAuditLogEntry({
      id: 42,
      action: 'UTILISATEUR_UPDATE',
      timestamp: '2026-07-21T10:30:00+00:00',
      entiteCible: 'Utilisateur#7',
      valeurAvant: '{"Nom":"DOSSOU","Rôle":"AGENT_VALIDATION"}',
      valeurApres: '{"Nom":"DOSSOU","Rôle":"CHEF_VALIDATION"}',
      ipAddress: '192.168.1.10',
      userId: 1,
      userIdentifiant: 'admin.cnss',
      userNom: 'ZINSOU',
      userPrenom: 'Prudence',
    })

    expect(entry.id).toBe('42')
    expect(entry.actionLabel).toBe('Modification d\'utilisateur')
    expect(entry.utilisateur).toBe('Prudence ZINSOU (admin.cnss)')
    expect(entry.userIdentifiant).toBe('admin.cnss')
    expect(entry.userRole).toBeNull()
    expect(entry.isSuccess).toBe(true)
    expect(entry.valeurAvant).toEqual({
      Nom: 'DOSSOU',
      Rôle: 'AGENT_VALIDATION',
    })
    expect(entry.valeurApres).toEqual({
      Nom: 'DOSSOU',
      Rôle: 'CHEF_VALIDATION',
    })
  })

  it('affiche Système quand aucun utilisateur n\'est rattaché', () => {
    const entry = mapAuditLogEntry({
      id: '99',
      action: 'LOGIN_FAILURE',
      timestamp: '2026-07-21T11:00:00+00:00',
      ipAddress: '10.0.0.5',
    })

    expect(entry.utilisateur).toBeNull()
    expect(entry.isSuccess).toBe(false)
    expect(entry.actionLabel).toBe('Échec de connexion')
    expect(entry.valeurAvant).toBeNull()
    expect(entry.valeurApres).toBeNull()
  })

  it('conserve une valeur non-JSON en champ raw', () => {
    const entry = mapAuditLogEntry({
      id: 1,
      action: 'PASSWORD_CHANGE',
      timestamp: '2026-07-21T12:00:00+00:00',
      valeurApres: 'not-json',
    })

    expect(entry.valeurApres).toEqual({ raw: 'not-json' })
  })
})

describe('getApiErrorMessage — rate limit 429', () => {
  it('retourne le message API quand disponible', () => {
    const message = getApiErrorMessage(
      {
        response: {
          status: 429,
          data: {
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Trop de requêtes. Veuillez réessayer plus tard.',
            },
          },
        },
      },
      'Erreur',
    )

    expect(message).toBe('Trop de requêtes. Veuillez réessayer plus tard.')
  })

  it('retourne un message convivial si le corps 429 est absent', () => {
    const message = getApiErrorMessage(
      { response: { status: 429 } },
      'Erreur',
    )

    expect(message).toBe(
      'Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.',
    )
  })
})
