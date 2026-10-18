"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        win: "bg-emerald-500/10 text-emerald-400",
        loss: "bg-red-500/10 text-red-400",
        open: "bg-yellow-500/10 text-yellow-400",
        on_track: "bg-emerald-500/10 text-emerald-400",
        tertinggal: "bg-red-500/10 text-red-400",
        tercapai: "bg-cyan-500/10 text-cyan-400",
        pending: "bg-yellow-500/10 text-yellow-400",
        completed: "bg-emerald-500/10 text-emerald-400",
        default: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

export default function StatusBadge({ children, status }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }))}>
      {children}
    </span>
  );
}
