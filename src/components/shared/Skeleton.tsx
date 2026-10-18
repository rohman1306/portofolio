"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/60 to-muted [background-size:200%_100%] [animation:shimmer_1.5s_ease-in-out_infinite]", className)}
      {...props}
    />
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between mb-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-2 w-full rounded-full mb-2" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function HoldingsRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 px-4"><Skeleton className="h-4 w-16 mb-1" /><Skeleton className="h-3 w-24" /></td>
      <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
    </tr>
  );
}

export function HoldingsTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="py-3 px-4"><Skeleton className="h-3 w-16" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <HoldingsRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Skeleton;
