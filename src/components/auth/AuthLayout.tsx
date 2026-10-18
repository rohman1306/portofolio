"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Orbit, Coins, Cpu } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface Particle {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
  color: string;
}

function generateParticles(): Particle[] {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 3 + 2}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${Math.random() * 10 + 10}s`,
    color: Math.random() > 0.5 ? "bg-cyan-500/40" : "bg-purple-500/40",
  }));
}

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Hide the simulation-mode notice (irrelevant on password-recovery screens). */
  showSimulationNotice?: boolean;
}

export default function AuthLayout({ title, description, children, footer, showSimulationNotice = true }: AuthLayoutProps) {
  const { t } = useLanguage();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles());
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${-(y / (box.height / 2)) * 10}deg) rotateY(${(x / (box.width / 2)) * 10}deg)`,
      transition: "transform 0.08s ease-out",
    });
  };

  const handleCardMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.5s ease-out",
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 overflow-hidden web3-grid"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full animate-particle pointer-events-none z-0 ${p.color}`}
          style={{
            left: p.left, width: p.size, height: p.size,
            animationDelay: p.delay, animationDuration: p.duration,
            bottom: "-20px", filter: "drop-shadow(0 0 4px currentColor)",
          }}
        />
      ))}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[130px] transition-all duration-75 ease-out z-0"
        style={{ left: mousePos.x, top: mousePos.y, width: "350px", height: "350px" }}
      />
      <div className="absolute top-1/4 left-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[140px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/5 blur-[140px] animate-pulse-slow" />
      <div className="absolute top-20 left-20 text-cyan-500/15 animate-float hidden md:block">
        <Orbit size={120} className="animate-spin-slow" />
      </div>
      <div className="absolute bottom-20 right-20 text-blue-500/15 animate-float-reverse hidden md:block">
        <Coins size={100} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-purple-500/10 animate-float hidden md:block">
        <Cpu size={80} className="rotate-45" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-2xl shadow-cyan-500/30 ring-2 ring-white/10 hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 blur-md opacity-50 animate-pulse" />
            <Orbit className="h-7 w-7 text-white relative z-10 animate-spin-slow" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-shimmer">
            {t("auth.brandName")}
          </h2>
          <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest font-mono">{description}</p>
        </div>

        <div
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={tiltStyle}
          className="relative group rounded-2xl p-[1px] overflow-hidden transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]"
        >
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_60%,#06b6d4_80%,#a855f7_90%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <Card className="relative border-transparent bg-background/90 backdrop-blur-2xl transition-all duration-300 z-10">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold text-foreground text-center tracking-wide">
                {title}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-center text-xs">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
            {footer && (
              <CardFooter className="flex flex-col gap-4 mt-2">
                {footer}
              </CardFooter>
            )}
          </Card>
        </div>

        {showSimulationNotice && (
          <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4 text-center text-xs text-cyan-400/90 backdrop-blur-md shadow-2xl">
            <p className="font-semibold mb-1 font-mono uppercase tracking-wider text-cyan-300">💡 {t("auth.simulationModeTitle")}</p>
            <p className="text-muted-foreground">{t("auth.simulationModeDescription")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
