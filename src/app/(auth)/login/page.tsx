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
              placeholder={t("auth.emailPlaceholder")}
              {...register("email")}
              required
              className="border-border bg-muted/30 pl-10 text-foreground placeholder-muted-foreground focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 focus:bg-muted/60 transition-all duration-200"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider font-mono">
            {t("auth.passwordLabel")}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-cyan-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              required
              className="border-border bg-muted/30 pl-10 pr-10 text-foreground placeholder-muted-foreground focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 focus:bg-muted/60 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            {t("auth.forgotPasswordLink")}
          </Link>
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
                {t("auth.loggingIn")}
              </span>
            ) : (
              <span className="tracking-wider uppercase font-mono">{t("auth.loginButton")}</span>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-2">
          {t("auth.noAccountYet")}{" "}
          <Link href="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
            {t("auth.registerLink")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
