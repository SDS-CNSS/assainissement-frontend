import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { BackofficeLayout } from '@/components/layouts/BackofficeLayout'
import { PortailLayout } from '@/components/layouts/PortailLayout'
import {
  GuestOnly,
  RequireAuth,
  RequirePasswordChanged,
  RequireRole,
} from '@/features/auth/RequireRole'
import { AdminAuditLogPage } from '@/pages/backoffice/AdminAuditLogPage'
import { AdminConsolidationPage } from '@/pages/backoffice/AdminConsolidationPage'
import { AdminDashboardPage } from '@/pages/backoffice/AdminDashboardPage'
import { AdminDirectionsPage } from '@/pages/backoffice/AdminDirectionsPage'
import { AdminStatistiquesPage } from '@/pages/backoffice/AdminStatistiquesPage'
import { AdminSupervisionPage } from '@/pages/backoffice/AdminSupervisionPage'
import { AdminUtilisateursPage } from '@/pages/backoffice/AdminUtilisateursPage'
import { AgentN1DashboardPage } from '@/pages/backoffice/AgentN1DashboardPage'
import { BackofficeHomeRedirect } from '@/pages/backoffice/BackofficeHomeRedirect'
import { ChangePasswordPage } from '@/pages/backoffice/ChangePasswordPage'
import { ChefN2DashboardPage } from '@/pages/backoffice/ChefN2DashboardPage'
import { DemandeDetailPage } from '@/pages/backoffice/DemandeDetailPage'
import { HistoriqueTraitementsPage } from '@/pages/backoffice/HistoriqueTraitementsPage'
import { LoginPage } from '@/pages/backoffice/LoginPage'
import { ProfilPage } from '@/pages/backoffice/ProfilPage'
import { SuperviseurDashboardPage } from '@/pages/backoffice/SuperviseurDashboardPage'
import { AccueilPage } from '@/pages/portail/AccueilPage'
import { EmployeurPage } from '@/pages/portail/EmployeurPage'
import { SuiviPage } from '@/pages/portail/SuiviPage'
import { TravailleurPage } from '@/pages/portail/TravailleurPage'

/** Redirection de l'ancienne URL historique (favoris / liens) vers la page unifiée. */
function LegacyHistoriqueRedirect() {
  const { id } = useParams<{ id: string }>()
  return (
    <Navigate
      to={`/backoffice/demandes/${id}?onglet=historique`}
      replace
    />
  )
}

export const router = createBrowserRouter([
  {
    element: <PortailLayout />,
    children: [
      { index: true, element: <AccueilPage /> },
      { path: 'employeur', element: <EmployeurPage /> },
      { path: 'travailleur', element: <TravailleurPage /> },
      { path: 'suivi', element: <SuiviPage /> },
    ],
  },
  {
    element: <GuestOnly />,
    children: [{ path: 'login', element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequirePasswordChanged />,
        children: [
          { path: 'changer-mot-de-passe', element: <ChangePasswordPage /> },
          {
            path: 'backoffice',
            element: <BackofficeLayout />,
            children: [
              { index: true, element: <BackofficeHomeRedirect /> },
              { path: 'profil', element: <ProfilPage /> },
              {
                element: <RequireRole roles="ROLE_AGENT_VALIDATION" />,
                children: [
                  { path: 'agent', element: <AgentN1DashboardPage /> },
                ],
              },
              {
                element: <RequireRole roles="ROLE_CHEF_VALIDATION" />,
                children: [
                  { path: 'chef', element: <ChefN2DashboardPage /> },
                ],
              },
              {
                element: <RequireRole roles="ROLE_SUPERVISEUR" />,
                children: [
                  {
                    path: 'superviseur',
                    element: <SuperviseurDashboardPage />,
                  },
                ],
              },
              {
                element: (
                  <RequireRole
                    roles={[
                      'ROLE_AGENT_VALIDATION',
                      'ROLE_CHEF_VALIDATION',
                      'ROLE_SUPERVISEUR',
                    ]}
                  />
                ),
                children: [
                  {
                    path: 'historique',
                    element: <HistoriqueTraitementsPage />,
                  },
                ],
              },
              {
                // UC-11 / RG-11 : détail + historique (Agent 1, Agent 2, Superviseur, Admin)
                element: (
                  <RequireRole
                    roles={[
                      'ROLE_AGENT_VALIDATION',
                      'ROLE_CHEF_VALIDATION',
                      'ROLE_SUPERVISEUR',
                      'ROLE_ADMIN',
                    ]}
                  />
                ),
                children: [
                  {
                    path: 'demandes/:id',
                    element: <DemandeDetailPage />,
                  },
                  {
                    path: 'chef/historique/:id',
                    element: <LegacyHistoriqueRedirect />,
                  },
                ],
              },
              {
                element: <RequireRole roles="ROLE_ADMIN" />,
                children: [
                  { path: 'admin', element: <AdminDashboardPage /> },
                  {
                    path: 'admin/utilisateurs',
                    element: <AdminUtilisateursPage />,
                  },
                  {
                    path: 'admin/directions',
                    element: <AdminDirectionsPage />,
                  },
                  {
                    path: 'admin/supervision',
                    element: <AdminSupervisionPage />,
                  },
                  {
                    path: 'admin/statistiques',
                    element: <AdminStatistiquesPage />,
                  },
                  {
                    path: 'admin/consolidation',
                    element: <AdminConsolidationPage />,
                  },
                  {
                    path: 'admin/audit',
                    element: <AdminAuditLogPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
