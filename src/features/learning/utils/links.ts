const URL_PATTERN = /https?:\/\/[^\s,;<>|"]+/gi;

/**
 * Kolom `link` di tabel courses bisa berisi lebih dari satu URL
 * (dipisah koma, titik koma, spasi, atau baris baru).
 * Kembalikan maksimal dua URL unik untuk ditampilkan sebagai ikon.
 */
export function parseCourseLinks(value?: string | null): string[] {
  if (!value) return [];

  const matches = value.match(URL_PATTERN) ?? [];
  const seen = new Set<string>();
  const links: string[] = [];

  for (const match of matches) {
    const url = match.replace(/[.,;)\]}>]+$/, "");
    if (!url || seen.has(url)) continue;

    seen.add(url);
    links.push(url);
    if (links.length === 2) break;
  }

  return links;
}
