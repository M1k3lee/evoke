const API_HOST = process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";
const PERSONAL_KEY = process.env.POSTHOG_PERSONAL_API_KEY ?? "";

async function trend(
  events: object[],
  extra: object = {},
): Promise<any> {
  const res = await fetch(`${API_HOST}/api/projects/@current/insights/trend/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERSONAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ events, date_from: "-7d", interval: "day", ...extra }),
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export type AnalyticsSnapshot = {
  pageviews7d: number;
  uniqueVisitors7d: number;
  pageviewsToday: number;
  topPages: { label: string; count: number }[];
  topReferrers: { label: string; count: number }[];
};

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot | null> {
  const [pvRes, uvRes, pagesRes, refRes] = await Promise.all([
    // total pageviews 7d
    trend([{ id: "$pageview", math: "total" }]),
    // unique visitors 7d (unique persons per day, summed)
    trend([{ id: "$pageview", math: "dau" }]),
    // top pages breakdown
    trend([{ id: "$pageview", math: "total" }], {
      breakdown: "$pathname",
      breakdown_type: "event",
      date_from: "-7d",
    }),
    // top referrers breakdown
    trend([{ id: "$pageview", math: "total" }], {
      breakdown: "$referring_domain",
      breakdown_type: "event",
      date_from: "-7d",
    }),
  ]);

  const sumData = (res: any): number =>
    (res?.result?.[0]?.data as number[] | undefined)?.reduce((a, b) => a + b, 0) ?? 0;

  const pageviews7d = sumData(pvRes);
  const uniqueVisitors7d = sumData(uvRes);

  // today = last element of the data array
  const todayData = pvRes?.result?.[0]?.data as number[] | undefined;
  const pageviewsToday = todayData?.[todayData.length - 1] ?? 0;

  const topPages = (pagesRes?.result ?? [])
    .map((r: any) => ({ label: r.breakdown_value ?? r.label ?? "unknown", count: r.count ?? 0 }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 8);

  const topReferrers = (refRes?.result ?? [])
    .filter((r: any) => r.breakdown_value && r.breakdown_value !== "" && r.breakdown_value !== "direct")
    .map((r: any) => ({ label: r.breakdown_value ?? r.label ?? "direct", count: r.count ?? 0 }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 8);

  return { pageviews7d, uniqueVisitors7d, pageviewsToday, topPages, topReferrers };
}
