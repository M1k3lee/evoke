import { BarChart2, Eye, Users, TrendingUp, ExternalLink } from "lucide-react";
import { getAnalyticsSnapshot } from "@/lib/posthog-admin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const snap = await getAnalyticsSnapshot();

  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <BarChart2 className="h-3 w-3" />
        traffic
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        Analytics<span className="text-acid">.</span>
      </h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; Last 7 days — powered by PostHog
      </p>

      {!snap ? (
        <div className="mt-10 border border-neutral-800 p-8 font-mono text-sm text-neutral-500">
          &gt; Could not reach PostHog. Check POSTHOG_PERSONAL_API_KEY in env vars.
        </div>
      ) : (
        <>
          {/* stat cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Eye className="h-4 w-4" />}
              label="Pageviews (7d)"
              value={snap.pageviews7d.toLocaleString()}
            />
            <StatCard
              icon={<Users className="h-4 w-4" />}
              label="Unique Visitors (7d)"
              value={snap.uniqueVisitors7d.toLocaleString()}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Pageviews Today"
              value={snap.pageviewsToday.toLocaleString()}
              highlight
            />
          </div>

          {/* tables */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <BreakdownTable
              title="// top pages"
              rows={snap.topPages}
              total={snap.pageviews7d}
            />
            <BreakdownTable
              title="// top referrers"
              rows={snap.topReferrers}
              total={snap.pageviews7d}
              emptyMsg="No referrer data yet — direct traffic only."
            />
          </div>

          <div className="mt-8 flex items-center gap-2">
            <a
              href="https://us.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-neutral-800 px-4 py-2 font-mono text-xs uppercase tracking-widest text-neutral-500 hover:border-acid hover:text-acid transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              open posthog dashboard
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`border p-5 ${highlight ? "border-acid/40 bg-acid/5" : "border-neutral-800 bg-neutral-950/40"}`}>
      <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] ${highlight ? "text-acid" : "text-neutral-500"}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-3 font-display text-4xl font-extrabold tracking-tighter ${highlight ? "text-acid" : "text-neutral-100"}`}>
        {value}
      </div>
    </div>
  );
}

function BreakdownTable({
  title, rows, total, emptyMsg,
}: {
  title: string;
  rows: { label: string; count: number }[];
  total: number;
  emptyMsg?: string;
}) {
  return (
    <div className="border border-neutral-800 bg-neutral-950/40">
      <div className="border-b border-neutral-800 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-6 font-mono text-xs text-neutral-600">
          &gt; {emptyMsg ?? "No data yet."}
        </div>
      ) : (
        <div className="divide-y divide-neutral-900">
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
            return (
              <div key={r.label} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs text-neutral-300">
                    {r.label || "direct"}
                  </div>
                  <div className="mt-1 h-0.5 bg-neutral-900">
                    <div
                      className="h-0.5 bg-acid/50"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-xs text-neutral-200">{r.count.toLocaleString()}</div>
                  <div className="font-mono text-[10px] text-neutral-600">{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
