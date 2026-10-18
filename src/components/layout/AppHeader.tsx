"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, getUnreadCount, type Notification } from "@/lib/notifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import CurrencyToggle from "@/components/shared/CurrencyToggle";
import LanguageToggle from "@/components/shared/LanguageToggle";

function NotificationPanel({ notifications, t }: { notifications: Notification[]; t: (k: string) => string }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{t("common.notifications")}</h3>
        {notifications.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 hover:text-blue-500"
          >
            {showAll ? t("common.showLess") : t("common.viewAll")}
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {displayed.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">{t("common.noNotifications")}</div>
        ) : (
          displayed.map((n) => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                !n.read ? "bg-blue-50/50" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1 size-2 rounded-full shrink-0 ${
                    n.type === "goal"
                      ? "bg-blue-500"
                      : n.type === "alert"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(n.timestamp).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { t } = useLanguage();
  const { currency, rate } = useCurrency();

  useEffect(() => {
    getNotifications(currency, rate).then(setNotifications);
  }, [currency, rate]);

  const unread = getUnreadCount(notifications);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-end border-b border-slate-200 bg-white px-8 text-slate-900">
      <div className="flex items-center gap-4">
        <CurrencyToggle />
        <LanguageToggle />
        <div ref={ref} className="relative">
          <Button
            size="icon"
            variant="ghost"
            className="relative text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setOpen(!open)}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute 1 top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>
          {open && <NotificationPanel notifications={notifications} t={t} />}
        </div>
      </div>
    </header>
  );
}
