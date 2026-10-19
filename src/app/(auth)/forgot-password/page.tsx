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
        <div className="space-y-4 mt-5">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#005274]/10">
              <MailCheck className="h-5 w-5 text-[#0074a6]" />
            </div>
            <p className="text-sm font-medium text-slate-900 break-all">{sentTo}</p>
            <p className="text-xs text-slate-500">{t("auth.resetLinkSentHint")}</p>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/reset-password")}
            className="w-full h-10 bg-[#005274] hover:bg-[#003d57] text-white font-semibold text-sm transition-colors"
          >
            {t("auth.enteredCodeInstead")}
          </Button>

          <Button
            type="button"
            onClick={() => send(sentTo)}
            disabled={isLoading || cooldown > 0}
            variant="ghost"
            className="w-full h-9 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            {isLoading
              ? t("auth.sendingResetLink")
              : cooldown > 0
                ? t("auth.resendIn").replace("{seconds}", String(cooldown))
                : t("auth.resendResetLinkButton")}
          </Button>

          <p className="text-center text-sm text-slate-500 pt-1">
            <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-[#0074a6] hover:text-[#005274] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("auth.backToLogin")}
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showSimulationNotice={false} title={t("auth.forgotPasswordTitle")} description={t("auth.forgotPasswordDescription")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            {t("auth.emailLabel")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              {...register("email")}
              required
              className="h-10 border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0074a6]/50 focus-visible:ring-[#0074a6]/10"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-[#005274] hover:bg-[#003d57] text-white font-semibold text-sm transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("auth.sendingResetLink")}
            </span>
          ) : (
            t("auth.sendResetLinkButton")
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 pt-1">
          <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-[#0074a6] hover:text-[#005274] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("auth.backToLogin")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
