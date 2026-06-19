const API_HOST = process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";
const PERSONAL_KEY = process.env.POSTHOG_PERSONAL_API_KEY ?? "";
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID ?? "@current";

async function hogql(query: string): Promise<{ columns: string[]; results: any[][] } | null> {
  if (!PERSONAL_KEY) return null;
  try {
    const res = await fetch(`${API_HOST}/api/projects/${PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERSONAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export type AnalyticsSnapshot = {
  pageviews7d: number;
  uniqueVisitors7d: number;
  pageviewsToday: number;
  topPages: { label: string; count: number }[];
  topReferrers: { label: string; count: number }[];
};

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot | null> {
  const [pvRes, uvRes, todayRes, pagesRes, refRes] = await Promise.all([
    hogql(`SELECT count() FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY`),
    hogql(`SELECT count(distinct person_id) FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY`),
    hogql(`SELECT count() FROM events WHERE event = '$pageview' AND toDate(timestamp) = today()`),
    hogql(`SELECT properties.$pathname AS page, count() AS views FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY GROUP BY page ORDER BY views DESC LIMIT 8`),
    hogql(`SELECT properties.$referring_domain AS referrer, count() AS views FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY AND (properties.$referring_domain IS NOT NULL AND properties.$referring_domain != '' AND properties.$referring_domain != 'direct') GROUP BY referrer ORDER BY views DESC LIMIT 8`),
  ]);

  if (!pvRes) return null;

  const pageviews7d = (pvRes.results?.[0]?.[0] as number) ?? 0;
  const uniqueVisitors7d = (uvRes?.results?.[0]?.[0] as number) ?? 0;
  const pageviewsToday = (todayRes?.results?.[0]?.[0] as number) ?? 0;

  const topPages = (pagesRes?.results ?? []).map((r) => ({
    label: (r[0] as string) || "/",
    count: r[1] as number,
  }));

  const topReferrers = (refRes?.results ?? []).map((r) => ({
    label: (r[0] as string) || "direct",
    count: r[1] as number,
  }));

  return { pageviews7d, uniqueVisitors7d, pageviewsToday, topPages, topReferrers };
}
