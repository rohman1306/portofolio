"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import StatsGrid from "@/features/dashboard/components/StatsGrid";
import PortfolioPerformanceChart from "@/features/dashboard/components/PortfolioPerformanceChart";
import AllocationChart from "@/features/dashboard/components/AllocationChart";
import GoalsCard from "@/features/dashboard/components/GoalsCard";
import { useGoalsQuery } from "@/features/goals/hooks/useGoalQuery";
import { useHoldingsQuery } from "@/features/holdings/hooks/useHoldingQuery";
import { buildAllocationsFromHoldings } from "@/features/allocation/services/allocation.service";
import { StatsGridSkeleton, ChartSkeleton, GoalCardSkeleton } from "@/components/shared/Skeleton";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const { data: holdings = [], isLoading: holdingsLoading } = useHoldingsQuery();
  const { data: goals = [], isLoading: goalsLoading } = useGoalsQuery();
  const allocations = useMemo(() => buildAllocationsFromHoldings(holdings), [holdings]);

  if (holdingsLoading || goalsLoading) {
    return (
      <main className="space-y-6">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        <StatsGridSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <GoalCardSkeleton />
      </main>
    );
  }

  return (
    <motion.main
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <DashboardHeader />
      </motion.div>
      <motion.div variants={item}>
        <StatsGrid holdings={holdings} />
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <PortfolioPerformanceChart holdings={holdings} />
        </motion.div>
        <motion.div variants={item}>
          <AllocationChart allocations={allocations} />
        </motion.div>
      </div>
      <motion.div variants={item}>
        <GoalsCard goals={goals} />
      </motion.div>
    </motion.main>
  );
}
