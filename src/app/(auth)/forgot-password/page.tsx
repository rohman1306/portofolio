"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { authForgotPasswordSchema, type AuthForgotPasswordValues } from "@/features/auth/validations/auth.schema";
import AuthLayout from "@/components/auth/AuthLayout";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthForgotPasswordValues>({
    resolver: zodResolver(authForgotPasswordSchema(t)),
    defaultValues: { email: "" },
  });

  const send = async (email: string) => {
    setIsLoading(true);
    const success = await forgotPassword(email);
    setIsLoading(false);
    if (success) {
      setSentTo(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const onSubmit = (data: AuthForgotPasswordValues) => send(data.email);

  if (sentTo) {
    return (
      <AuthLayout showSimulationNotice={false} title={t("auth.resetLinkSentTitle")} description={t("auth.resetLinkSentDescription")}>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30">
              <MailCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <p className="text-sm text-foreground break-all">{sentTo}</p>
            <p className="text-xs text-muted-foreground">{t("auth.resetLinkSentHint")}</p>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/reset-password")}
            className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 font-bold text-white hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300"
          >
            <span className="tracking-wider uppercase font-mono">{t("auth.enteredCodeInstead")}</span>
          </Button>

          <Button
            type="button"
            onClick={() => send(sentTo)}
            disabled={isLoading || cooldown > 0}
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-cyan-300 transition-colors disabled:opacity-50"
          >
            {isLoading
              ? t("auth.sendingResetLink")
              : cooldown > 0
                ? t("auth.resendIn").replace("{seconds}", String(cooldown))
                : t("auth.resendResetLinkButton")}
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-2">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("auth.backToLogin")}
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showSimulationNotice={false} title={t("auth.forgotPasswordTitle")} description={t("auth.forgotPasswordDescription")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider font-mono">
            {t("auth.emailLabel")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-cyan-500" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              {...register("email")}
              required
              className="border-border bg-muted/30 pl-10 text-foreground placeholder-muted-foreground focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 focus:bg-muted/60 transition-all duration-200"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 font-bold text-white hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 shimmer-btn"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("auth.sendingResetLink")}
              </span>
            ) : (
              <span className="tracking-wider uppercase font-mono">{t("auth.sendResetLinkButton")}</span>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("auth.backToLogin")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
