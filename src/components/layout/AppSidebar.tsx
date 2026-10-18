"use client";

import {
  LayoutDashboard,
  Wallet,
  Target,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AppSidebar() {
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
    <aside className="w-72 border-r border-slate-200 bg-white text-slate-900 h-screen p-6 flex flex-col justify-between">
      <div>
        <Logo />
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
