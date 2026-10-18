"use client";

import { useState, useEffect, useMemo, createContext, useContext, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useLanguage } from "@/contexts/LanguageContext";

export interface User {
  id: string;
  name: string;
  email: string;
}

export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isRecovery: boolean;
  hasSession: boolean;
  recoveryChecked: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyRecoveryCode: (email: string, token: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  logout: () => void;
}

const RECOVERY_EMAIL_KEY = "recovery-email";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name ?? supabaseUser.email?.split("@")[0] ?? "",
    email: supabaseUser.email ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(mapUser(data.user));
        setHasSession(true);
      }
      setLoading(false);
      setRecoveryChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
        setHasSession(true);
        setUser(null);
      } else if (session?.user) {
        setIsRecovery(false);
        setHasSession(true);
        setUser(mapUser(session.user));
      } else {
        setHasSession(false);
        setUser(null);
      }
      setLoading(false);
      setRecoveryChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = (AUTH_ROUTES as readonly string[]).includes(pathname);
    if (!user && !isAuthRoute && pathname !== "/reset-password") {
      router.push("/login");
    } else if (user && isAuthRoute) {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(
          error.message === "Invalid login credentials"
            ? t("auth.errorInvalidCredentials")
            : error.message
        );
        return false;
      }

      if (data.user) {
        setUser(mapUser(data.user));
        toast.success(t("auth.welcomeBack").replace("{name}", mapUser(data.user).name));
        router.push("/dashboard");
      }
      return true;
    } catch {
      toast.error(t("auth.errorLogin"));
      return false;
    }
  }, [supabase, router, t]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        toast.error(
          error.message === "User already registered"
            ? t("auth.errorEmailRegistered")
            : error.message
        );
        return false;
      }

      if (data.user) {
        setUser(mapUser(data.user));
        toast.success(t("auth.registerSuccess"));
        router.push("/dashboard");
      }
      return true;
    } catch {
      toast.error(t("auth.errorRegister"));
      return false;
    }
  }, [supabase, router, t]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const redirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        console.error("[forgotPassword]", error.status, error.message);
        if (error.status === 429 || /rate|too many/i.test(error.message)) {
          toast.error(t("auth.errorTooManyRequests"));
          return false;
        }
        if (/requested path is invalid|redirect/i.test(error.message)) {
          toast.error(t("auth.errorInvalidRedirect"));
          return false;
        }
        toast.error(t("auth.errorSendResetLink"));
        return false;
      }

      toast.success(t("auth.resetLinkSent"));
      try {
        sessionStorage.setItem(RECOVERY_EMAIL_KEY, email);
      } catch {}
      return true;
    } catch {
      toast.error(t("auth.errorSendResetLink"));
      return false;
    }
  }, [supabase, t]);

  const verifyRecoveryCode = useCallback(async (email: string, token: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "recovery",
      });

      if (error) {
        if (error.status === 429 || /rate|too many/i.test(error.message)) {
          toast.error(t("auth.errorTooManyRequests"));
        } else {
          toast.error(t("auth.errorInvalidCode"));
        }
        return false;
      }

      setIsRecovery(true);
      setHasSession(true);
      toast.success(t("auth.codeVerified"));
      return true;
    } catch {
      toast.error(t("auth.errorInvalidCode"));
      return false;
    }
  }, [supabase, t]);

  const resetPassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error(t("auth.invalidResetLink"));
        return false;
      }

      const nonce = typeof window !== "undefined"
        ? (new URLSearchParams(window.location.hash.replace(/^#/, "")).get("nonce") ?? undefined)
        : undefined;

      const { error } = await supabase.auth.updateUser(
        nonce ? { password, nonce } : { password }
      );

      if (error) {
        if (/nonce/i.test(error.message)) {
          toast.error(t("auth.invalidResetLink"));
          return false;
        }
        toast.error(
          error.message === "Password should be different from the old password."
            ? t("auth.passwordNotDifferent")
            : error.message
        );
        return false;
      }

      toast.success(t("auth.passwordChanged"));
      try {
        sessionStorage.removeItem(RECOVERY_EMAIL_KEY);
      } catch {}
      return true;
    } catch {
      toast.error(t("auth.errorResetPassword"));
      return false;
    }
  }, [supabase, t]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsRecovery(false);
    setHasSession(false);
    toast.success(t("auth.logoutSuccess"));
    router.push("/login");
  }, [supabase, router, t]);

  return (
    <AuthContext.Provider value={{ user, loading, isRecovery, hasSession, recoveryChecked, login, register, forgotPassword, verifyRecoveryCode, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
