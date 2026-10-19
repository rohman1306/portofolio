"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { authLoginSchema, type AuthLoginValues } from "@/features/auth/validations/auth.schema";
import AuthLayout from "@/components/auth/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthLoginValues>({
    resolver: zodResolver(authLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: AuthLoginValues) => {
    setIsLoading(true);
    await login(data.email, data.password);
    setIsLoading(false);
  };

  return (
    <AuthLayout title={t("auth.loginTitle")} description={t("auth.loginDescription")}>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              {t("auth.passwordLabel")}
            </Label>
            <Link href="/forgot-password" className="text-xs font-medium text-[#0074a6] hover:text-[#005274] transition-colors">
              {t("auth.forgotPasswordLink")}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-[#005274] hover:bg-[#003d57] text-white font-semibold text-sm transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("auth.loggingIn")}
            </span>
          ) : (
            t("auth.loginButton")
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 pt-1">
          {t("auth.noAccountYet")}{" "}
          <Link href="/register" className="font-semibold text-[#0074a6] hover:text-[#005274] transition-colors">
            {t("auth.registerLink")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
