"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  User, Palette, Bell, Shield, Save, Trash2, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/supabase/client";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordValues = z.infer<typeof passwordSchema>;

type TabValue = "profile" | "appearance" | "notifications" | "account";

const tabStyles = (active: boolean) =>
  cn(
    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
    active
      ? "bg-[#005274] text-white shadow-sm"
      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  );

const cardStyles =
  "rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden";

function SectionHeader({ icon: Icon, title, description, tone = "default" }: {
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
  title: string;
  description: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="flex items-start gap-3 p-6 pb-5 border-b border-slate-100">
      <div className={cn("p-2.5 rounded-xl", tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-[#f0f7fa] text-[#0074a6]")}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 leading-tight">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function FormFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex justify-end gap-2 px-6 py-4 border-t border-slate-100", className)}>
      {children}
    </div>
  );
}

function SwitchRow({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button" role="switch" aria-checked={checked} onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#0074a6] focus-visible:ring-offset-2 ${checked ? "bg-[#0074a6]" : "bg-slate-200"}`}
      >
        <span className={`pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function ProfileTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  const name = watch("name");
  const email = watch("email");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setValue("name", user.user_metadata?.name ?? "");
        setValue("email", user.email ?? "");
      }
      setLoading(false);
    }
    load();
  }, [setValue]);

  const handleSave = async (data: ProfileValues) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { name: data.name } });
    if (error) { toast.error(error.message); return; }
    await supabase.from("profiles").update({ name: data.name }).eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
    toast.success(t("settings.profileUpdateSuccess"));
  };

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className={cn(cardStyles, "flex items-center justify-center py-12")}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#0074a6]" />
      </div>
    );
  }

  return (
    <section className={cardStyles}>
      <SectionHeader
        icon={User}
        title={t("settings.profileTitle")}
        description={t("settings.profileDescription")}
      />
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="size-16">
              <AvatarImage src="" alt="Avatar" />
              <AvatarFallback className="text-lg bg-[#f0f7fa] text-[#0074a6] font-semibold">{initials || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-slate-900">{name || "-"}</p>
              <p className="text-sm text-slate-500">{email || "-"}</p>
            </div>
          </div>
          <Separator className="bg-slate-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">{t("settings.fullNameLabel")}</Label>
              <Input
                {...register("name")}
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">{t("settings.emailLabel")}</Label>
              <Input
                type="email"
                {...register("email")}
                disabled
                className="bg-white border-slate-200 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        <FormFooter>
          <Button type="submit" className="bg-[#005274] hover:bg-[#003d57] text-white font-medium">
            <Save className="size-4 mr-1.5" />
            {t("settings.saveChanges")}
          </Button>
        </FormFooter>
      </form>
    </section>
  );
}

function AppearanceTab() {
  const { t } = useLanguage();

  return (
    <section className={cardStyles}>
      <SectionHeader
        icon={Palette}
        title={t("settings.appearanceTitle")}
        description={t("settings.appearanceDescription")}
      />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">{t("settings.themeLabel")}</p>
            <p className="text-sm text-slate-500">{t("settings.themeDescription")}</p>
          </div>
          <ThemeToggle />
        </div>
        <Separator className="bg-slate-100" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">{t("settings.compactModeLabel")}</p>
            <p className="text-sm text-slate-500">{t("settings.compactModeDescription")}</p>
          </div>
          <Select defaultValue="off">
            <SelectTrigger className="w-28 bg-white border-slate-200 text-slate-900 focus:ring-[#0074a6]/30 focus:border-[#0074a6]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on">{t("common.on")}</SelectItem>
              <SelectItem value="off">{t("common.off")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

function NotificationsTab() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notification-settings");
      if (saved) return JSON.parse(saved);
    }
    return {
      goalReached: true, weeklyReport: false,
      priceAlert: true, marketing: false,
    };
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev: typeof settings) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notification-settings", JSON.stringify(next));
      return next;
    });
  };

  return (
    <section className={cardStyles}>
      <SectionHeader
        icon={Bell}
        title={t("settings.notificationsTitle")}
        description={t("settings.notificationsDescription")}
      />
      <div className="p-6 space-y-6">
        <SwitchRow label={t("settings.notifGoalReached")} description={t("settings.notifGoalReachedDesc")} checked={settings.goalReached} onChange={() => toggle("goalReached")} />
        <Separator className="bg-slate-100" />
        <SwitchRow label={t("settings.notifWeeklyReport")} description={t("settings.notifWeeklyReportDesc")} checked={settings.weeklyReport} onChange={() => toggle("weeklyReport")} />
        <Separator className="bg-slate-100" />
        <SwitchRow label={t("settings.notifPriceAlert")} description={t("settings.notifPriceAlertDesc")} checked={settings.priceAlert} onChange={() => toggle("priceAlert")} />
        <Separator className="bg-slate-100" />
        <SwitchRow label={t("settings.notifMarketing")} description={t("settings.notifMarketingDesc")} checked={settings.marketing} onChange={() => toggle("marketing")} />
      </div>
      <FormFooter>
        <Button onClick={() => toast.success(t("settings.notifSaveSuccess"))} className="bg-[#005274] hover:bg-[#003d57] text-white font-medium">
          <Save className="size-4 mr-1.5" />
          {t("settings.savePreferences")}
        </Button>
      </FormFooter>
    </section>
  );
}

function AccountTab() {
  const { t } = useLanguage();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handleChangePassword = async (data: PasswordValues) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) { toast.error(error.message); return; }
    toast.success(t("settings.passwordChangeSuccess"));
    reset();
  };

  return (
    <div className="space-y-6">
      <section className={cardStyles}>
        <SectionHeader
          icon={Shield}
          title={t("settings.changePasswordTitle")}
          description={t("settings.changePasswordDescription")}
        />
        <form onSubmit={handleSubmit(handleChangePassword)}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">{t("settings.newPasswordLabel")}</Label>
              <Input
                type="password"
                {...register("newPassword")}
                placeholder={t("settings.passwordPlaceholder")}
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
              />
              {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">{t("settings.confirmNewPasswordLabel")}</Label>
              <Input
                type="password"
                {...register("confirmPassword")}
                placeholder={t("settings.confirmPasswordPlaceholder")}
                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-[#0074a6]/30 focus-visible:border-[#0074a6]"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <FormFooter>
            <Button type="submit" className="bg-[#005274] hover:bg-[#003d57] text-white font-medium">
              <Save className="size-4 mr-1.5" />
              {t("settings.updatePasswordButton")}
            </Button>
          </FormFooter>
        </form>
      </section>

      <section className={cardStyles}>
        <SectionHeader
          tone="danger"
          icon={Trash2}
          title={t("settings.dangerZoneTitle")}
          description={t("settings.dangerZoneDescription")}
        />
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-600">{t("settings.deleteAccount")}</p>
              <p className="text-sm text-slate-500 mt-0.5 max-w-lg">{t("settings.deleteAccountDescription")}</p>
            </div>
            <Button variant="destructive" onClick={() => toast.error(t("settings.featureNotAvailable"))} className="font-medium">
              <Trash2 className="size-4 mr-1.5" />
              {t("settings.deleteAccount")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SettingsContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabValue>("profile");

  const tabs: { value: TabValue; icon: React.ComponentType<{ size?: number | string }>; label: string }[] = [
    { value: "profile", icon: User, label: t("settings.tabProfile") },
    { value: "appearance", icon: Palette, label: t("settings.tabAppearance") },
    { value: "notifications", icon: Bell, label: t("settings.tabNotifications") },
    { value: "account", icon: Shield, label: t("settings.tabAccount") },
  ];

  return (
    <motion.div
      className="space-y-6 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f0f7fa] text-[#0074a6]">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("settings.title")}</h1>
            <p className="text-slate-500 mt-0.5">{t("settings.description")}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={tabStyles(activeTab === value)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "account" && <AccountTab />}
      </motion.div>
    </motion.div>
  );
}