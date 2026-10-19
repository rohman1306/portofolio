import { type ReactNode } from "react";
import { LineChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  showSimulationNotice?: boolean;
}

export default function AuthLayout({ title, description, children, footer, showSimulationNotice = true }: AuthLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(0,82,116,0.08) 0%, rgba(0,82,116,0) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#005274] shadow-sm">
            <LineChart className="h-6 w-6 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">{t("auth.brandName")}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">{title}</h2>
          {children}
        </div>

        {footer && <div className="mt-4">{footer}</div>}

        {showSimulationNotice && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs text-slate-500">{t("auth.simulationModeDescription")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
