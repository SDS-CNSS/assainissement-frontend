import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Eye,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Scale,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/domain/ConfirmDialog";
import { ROLE_LABELS } from "@/features/admin/types";
import { useAuthStore } from "@/features/auth/authStore";
import { useLogout } from "@/features/auth/hooks";
import type { SymfonyRole } from "@/features/auth/types";
import { userHasRole } from "@/features/auth/types";
import cnssLogo from "@/images/logo.png";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles: SymfonyRole[];
  /** Exact match only — needed when `to` is a prefix of other nav routes (ex. /admin). */
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "File d'attente",
    to: "/backoffice/agent",
    icon: ClipboardList,
    roles: ["ROLE_AGENT_VALIDATION"],
  },
  {
    label: "File d'attente",
    to: "/backoffice/chef",
    icon: ClipboardList,
    roles: ["ROLE_CHEF_VALIDATION"],
  },
  {
    label: "Arbitrage",
    to: "/backoffice/superviseur",
    icon: Scale,
    roles: ["ROLE_SUPERVISEUR"],
  },
  {
    label: "Historique",
    to: "/backoffice/historique",
    icon: History,
    roles: [
      "ROLE_AGENT_VALIDATION",
      "ROLE_CHEF_VALIDATION",
      "ROLE_SUPERVISEUR",
    ],
  },
  {
    label: "Tableau de bord",
    to: "/backoffice/admin",
    icon: LayoutDashboard,
    roles: ["ROLE_ADMIN"],
    end: true,
  },
  {
    label: "Utilisateurs",
    to: "/backoffice/admin/utilisateurs",
    icon: Users,
    roles: ["ROLE_ADMIN"],
  },
  {
    label: "Directions",
    to: "/backoffice/admin/directions",
    icon: Building2,
    roles: ["ROLE_ADMIN"],
  },
  {
    label: "Supervision",
    to: "/backoffice/admin/supervision",
    icon: Eye,
    roles: ["ROLE_ADMIN"],
  },
  {
    label: "Statistiques",
    to: "/backoffice/admin/statistiques",
    icon: BarChart3,
    roles: ["ROLE_ADMIN"],
  },
  {
    label: "Consolidation",
    to: "/backoffice/admin/consolidation",
    icon: Layers,
    roles: ["ROLE_ADMIN"],
  },
  {
    label: "Journal d'audit",
    to: "/backoffice/admin/audit",
    icon: ScrollText,
    roles: ["ROLE_ADMIN"],
  },
];

function SidebarNav() {
  const user = useAuthStore((s) => s.user);
  const visibleItems = NAV_ITEMS.filter((item) =>
    userHasRole(user, item.roles),
  );

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-cnss-700 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-cnss-900",
              )
            }
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function BackofficeLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout.mutate(undefined, {
      onSettled: () => setLogoutConfirmOpen(false),
    });
  };

  return (
    <div className="min-h-svh bg-[#F0F2F5]">
      <aside className="fixed inset-y-0 left-0 z-40 flex h-svh w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-18 shrink-0 items-center border-b border-slate-200 px-4">
          <Link to="/backoffice" className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center bg-white p-1">
              <img
                src={cnssLogo}
                alt="Logo CNSS"
                className="size-full object-contain"
              />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-display text-sm font-semibold text-cnss-900">
                CNSS — BENIN
              </p>
              <p className="text-xs text-slate-500">Back office</p>
            </div>
          </Link>
        </div>

        <SidebarNav />

        <div className="shrink-0 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setLogoutConfirmOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#93000a] transition-colors hover:bg-[#ffdad6] border cursor-pointer"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
            Déconnexion
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Confirmer la déconnexion"
        message="Voulez-vous vraiment vous déconnecter du back office CNSS ?"
        confirmLabel="Se déconnecter"
        isLoading={logout.isPending}
        buttonType="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutConfirmOpen(false)}
      />

      <div className="ml-64 flex h-svh min-w-0 flex-col overflow-hidden bg-[#F0F2F5]">
        <header className="flex h-18 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-6">
          <h1 className="font-display text-lg font-semibold text-cnss-900">
            Assainissement IFU / NPI
          </h1>

          {user ? (
            <Link
              to="/backoffice/profil"
              className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-medium text-cnss-900">
                  {user.prenom} {user.nom}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cnss-700 font-display text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {`${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase()}
              </span>
            </Link>
          ) : null}
        </header>
        <main className="flex-1 overflow-y-auto bg-[#F0F2F5] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
