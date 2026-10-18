"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        positive: "bg-emerald-500/10 text-emerald-400",
        negative: "bg-red-500/10 text-red-400",
        neutral: "bg-muted text-muted-foreground",
        accent: "bg-cyan-500/10 text-cyan-400",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface StatBadgeProps extends VariantProps<typeof statBadgeVariants> {
  children: React.ReactNode;
}

export default function StatBadge({ children, variant }: StatBadgeProps) {
  return (
    <span className={cn(statBadgeVariants({ variant }))}>
      {children}
    </span>
  );
}
