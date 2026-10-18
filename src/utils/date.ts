import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

export type DateLocale = "id" | "en";

const dateFnsLocale = (locale: DateLocale) => (locale === "id" ? idLocale : enUS);

export function formatDate(
  dateStr: string,
  pattern: string = "dd MMM yyyy",
  locale: DateLocale = "id"
): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, pattern, { locale: dateFnsLocale(locale) });
}

export function formatDateTime(
  dateStr: string,
  locale: DateLocale = "id"
): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, "dd MMM yyyy HH:mm", { locale: dateFnsLocale(locale) });
}

export function formatRelativeTime(
  dateStr: string,
  locale: DateLocale = "id"
): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocale(locale) });
}

export function formatShortDate(
  dateStr: string,
  locale: DateLocale = "id"
): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, "dd MMM", { locale: dateFnsLocale(locale) });
}

export function formatTimeAgo(dateStr: string, locale: DateLocale = "id"): string {
  return formatRelativeTime(dateStr, locale);
}
