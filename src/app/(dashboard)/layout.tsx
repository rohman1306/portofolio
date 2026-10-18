"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { PriceSyncProvider } from "@/contexts/PriceSyncContext";
import { motion } from "framer-motion";
import Lenis from "lenis";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    if (loading || !user) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-cyan-500" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">{t("common.loadingApp")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useAuth hook
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] text-slate-900">
      <AppSidebar />

      <div className="flex flex-1 flex-col">
        <AppHeader />

        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <PriceSyncProvider>{children}</PriceSyncProvider>
          </motion.div>
        </main>
      </div>
    </div>
  );
}