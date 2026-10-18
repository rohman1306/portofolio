import { type NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { buildPortfolioHistory, type HistoryRange } from "@/lib/portfolioHistory";
import type { Holding } from "@/features/holdings/types/holding";

export const dynamic = "force-dynamic";

const VALID_RANGES: HistoryRange[] = [
  "1D", "1W", "1M", "3M", "6M", "1Y",
  "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y",
];

export async function GET(request: NextRequest) {
  const raw = (request.nextUrl.searchParams.get("range") ?? "1M").toUpperCase();
  const range: HistoryRange = VALID_RANGES.includes(raw as HistoryRange)
    ? (raw as HistoryRange)
    : "1M";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching holdings for history:", error.message);
    return Response.json({ error: "Failed to load holdings" }, { status: 500 });
  }

  const history = await buildPortfolioHistory((data ?? []) as Holding[], range);
  return Response.json(history);
}
