"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { authResetPasswordSchema, type AuthResetPasswordValues } from "@/features/auth/validations/auth.schema";
import { OtpInput } from "@/features/auth/components/OtpInput";
import AuthLayout from "@/components/auth/AuthLayout";

const RECOVERY_EMAIL_KEY = "recovery-email";

// sessionStorage is unavailable during SSR/hydration, so read it through
// useSyncExternalStore to keep the first client render hydration-safe.
const noopSubscribe = () => () => {};
const getRecoveryEmail = () => {
  try {
    return sessionStorage.getItem(RECOVERY_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
};
const getServerRecoveryEmail = () => "";

export default function ResetPasswordPage() {
  const { resetPassword, logout, verifyRecoveryCode, isRecovery, hasSession, recoveryChecked } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"code" | "password">("code");
  const storedEmail = useSyncExternalStore(noopSubscribe, getRecoveryEmail, getServerRecoveryEmail);
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const email = emailOverride ?? storedEmail;

  const { register, handleSubmit, formState: { errors } } = useForm<AuthResetPasswordValues>({
    resolver: zodResolver(authResetPasswordSchema(t)),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: AuthResetPasswordValues) => {
    setIsLoading(true);
    const success = await resetPassword(data.password);
    setIsLoading(false);
    if (success) {
      await logout();
    }
  };

  const submitCode = async () => {
    if (!email.trim()) {
      router.push("/forgot-password");
      return;
    }
    setIsLoading(true);
    const success = await verifyRecoveryCode(email, code);
    setIsLoading(false);
    if (success) {
      setStep("password");
    } else {
      setCode("");
    }
  };

  // A refresh after opening the recovery link leaves a valid session but no
  // PASSWORD_RECOVERY event, so gate on session presence, not the event.
  if (!recoveryChecked) {
    return (
      <AuthLayout showSimulationNotice={false} title={t("auth.resetPasswordTitle")} description={t("auth.resetPasswordDescription")}>
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t("auth.verifyingSession")}</span>
        </div>
      </AuthLayout>
    );
  }

  if (!hasSession && !isRecovery && step === "code") {
    return (
      <AuthLayout showSimulationNotice={false} title={t("auth.enterCodeTitle")} description={t("auth.enterCodeDescription")}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="recovery-email" className="text-sm font-medium text-slate-700">
              {t("auth.emailLabel")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmailOverride(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="h-10 border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0074a6]/50 focus-visible:ring-[#0074a6]/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recovery-code" className="text-sm font-medium text-slate-700">
              {t("auth.codeLabel")}
            </Label>
            <OtpInput
              id="recovery-code"
              value={code}
              onChange={setCode}
              onComplete={submitCode}
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">{t("auth.codeHint")}</p>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="button"
              onClick={submitCode}
              disabled={isLoading || code.length !== 6}
              className="w-full h-10 bg-[#005274] hover:bg-[#003d57] text-white font-semibold text-sm transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("auth.verifyingCode")}
                </span>
              ) : (
                t("auth.verifyCodeButton")
              )}
            </Button>

            <Button
              type="button"
              onClick={() => router.push("/forgot-password")}
              variant="ghost"
              className="w-full h-9 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t("auth.resendCode")}
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 pt-2">
            <Link href="/login" className="font-medium text-[#0074a6] hover:text-[#005274] transition-colors">
              {t("auth.backToLogin")}
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showSimulationNotice={false} title={t("auth.resetPasswordTitle")} description={t("auth.resetPasswordDescription")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-5">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            {t("auth.passwordLabel")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("auth.passwordPlaceholder")}
              {...register("password")}
              required
              className="h-10 border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0074a6]/50 focus-visible:ring-[#0074a6]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            {t("auth.confirmPasswordLabel")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              {...register("confirmPassword")}
              required
              className="h-10 border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#0074a6]/50 focus-visible:ring-[#0074a6]/10"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-[#005274] hover:bg-[#003d57] text-white font-semibold text-sm transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("auth.updatingPassword")}
            </span>
          ) : (
            t("auth.updatePasswordButton")
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 pt-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-[#0074a6] hover:text-[#005274] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("auth.backToLogin")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
