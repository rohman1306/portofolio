"use client";

import {
  LayoutDashboard,
  Wallet,
  Target,
  GraduationCap,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AppSidebar({ open = false, onClose }: AppSidebarProps) {
  const { logout, user } = useAuth();
  const { t } = useLanguage();

  const menus = [
    { title: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.holdings"), href: "/holdings", icon: Wallet },
    { title: t("nav.goals"), href: "/goals", icon: Target },
    { title: t("nav.learning"), href: "/learning", icon: GraduationCap },
    { title: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col justify-between border-r border-slate-200 bg-white p-6 text-slate-900 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:sticky lg:top-0 lg:z-auto lg:translate-x-0`}
    >
      <div>
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-2 mt-6">
          {menus.map((menu) => (
            <SidebarItem key={menu.href} {...menu} />
          ))}
        </nav>
      </div>

      {user && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/50 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-xs uppercase text-white">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut size={18} />
            {t("nav.logout")}
          </button>
        </div>
      )}
    </aside>
  );
}
