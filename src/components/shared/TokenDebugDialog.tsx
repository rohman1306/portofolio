"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, RefreshCw, Copy } from "lucide-react";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TokenInfo {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  sub: string;
  role: string;
}

type TokenState = { status: "loading" } | { status: "empty" } | { status: "ok"; info: TokenInfo };

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch {
    return null;
  }
}

export default function TokenDebugDialog() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<TokenState>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(0);

  const inspect = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const payload = token ? decodePayload(token) : null;
    if (!payload || typeof payload.iat !== "number" || typeof payload.exp !== "number") {
      setState({ status: "empty" });
      return;
    }
    setState({
      status: "ok",
      info: {
        iat: payload.iat,
        exp: payload.exp,
        iss: String(payload.iss ?? "-"),
        aud: String(payload.aud ?? "-"),
        sub: String(payload.sub ?? "-"),
        role: String(payload.role ?? "-"),
      },
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    setNow(Math.floor(Date.now() / 1000));
    inspect();
  }, [open, inspect]);

  useEffect(() => {
    if (!open || state.status !== "ok") return;
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, [open, state.status]);

  const refresh = async () => {
    setRefreshing(true);
    const supabase = createClient();
    const { error } = await supabase.auth.refreshSession();
    setRefreshing(false);
    if (error) {
      toast.error(`Refresh gagal: ${error.message}`);
      return;
    }
    setNow(Math.floor(Date.now() / 1000));
    await inspect();
    toast.success("Token diperbarui");
  };

  const copy = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await navigator.clipboard.writeText(token);
    toast.success("Token disalin");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="font-mono text-xs">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            TOKEN
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Debug Token</DialogTitle>
          <DialogDescription>
            Kalau PostgREST menolak dengan &quot;JWT issued at future&quot;, jam
            <span className="font-mono">iat</span> dianggap di masa depan. Cek selisihnya di bawah.
          </DialogDescription>
        </DialogHeader>

        {state.status === "loading" && (
          <p className="py-4 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Membaca token...
          </p>
        )}

        {state.status === "empty" && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Tidak ada sesi aktif. Silakan login.
          </p>
        )}

        {state.status === "ok" && <TokenRows info={state.info} now={now} />}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={copy} disabled={state.status !== "ok"}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Salin
          </Button>
          <Button size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Token
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatClock(seconds: number) {
  return new Date(seconds * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function TokenRows({ info, now }: { info: TokenInfo; now: number }) {
  const skew = info.iat - now;
  const remaining = info.exp - now;
  const skewFuture = skew > 0;

  return (
    <div className="space-y-2 font-mono text-xs">
      <Row label="iat (diberikan)" value={formatClock(info.iat)} />
      <Row label="exp (kedaluwarsa)" value={formatClock(info.exp)} />
      <Row label="sekarang (lokal)" value={formatClock(now)} />

      <Row
        label="selisih iat - now"
        value={`${skew > 0 ? "+" : ""}${skew} detik`}
        tone={skewFuture ? "danger" : "ok"}
      />
      <Row
        label="sisa berlaku"
        value={`${Math.max(0, Math.floor(remaining / 60))}m ${Math.max(0, remaining % 60)}d`}
        tone={remaining <= 0 ? "danger" : remaining < 300 ? "warn" : "ok"}
      />
      <Row label="iss" value={info.iss} />
      <Row label="aud" value={info.aud} />
      <Row label="role" value={info.role} />
      <Row label="sub" value={info.sub} />

      {skewFuture && (
        <p className="pt-2 font-sans text-xs text-red-400">
          iat berada di masa depan. Coba Refresh Token; kalau selisihnya tetap, jam project Supabase yang
          bermasalah, bukan kodenya.
        </p>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" | "danger" }) {
  const color = tone === "danger" ? "text-red-400" : tone === "warn" ? "text-amber-400" : "text-foreground";
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-1.5">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={`text-right break-all ${color}`}>{value}</span>
    </div>
  );
}
