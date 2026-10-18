import { getGoals } from "@/features/goals/services/goal.service";
import { type Currency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/format";

export interface Notification {
  id: string;
  type: "goal" | "holding" | "alert";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export async function getNotifications(currency: Currency = "IDR", rate: number = 15800): Promise<Notification[]> {
  const notifications: Notification[] = [];

  const goals = await getGoals();
  for (const goal of goals) {
    if (goal.status === "tercapai") {
      notifications.push({
        id: `goal-${goal.id}`,
        type: "goal",
        title: "Goal Achieved!",
        description: `${goal.nama} — target ${formatCurrency(goal.target_nilai, currency, rate)}`,
        timestamp: goal.created_at,
        read: false,
      });
    }
  }

  return notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}
