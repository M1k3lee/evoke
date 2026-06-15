"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Skull, Globe, Lock, AlertTriangle, ShieldOff, Flag,
} from "lucide-react";

type Stats = {
  totalUsers: number;
  totalSouls: number;
  publicSouls: number;
  privateSouls: number;
  flaggedSouls: number;
  removedSouls: number;
  totalReports: number;
};

const CARDS = (s: Stats) => [
  { label: "Registered users",  value: s.totalUsers,    icon: Users,        color: "text-acid" },
  { label: "Total souls",       value: s.totalSouls,    icon: Skull,        color: "text-acid" },
  { label: "Public souls",      value: s.publicSouls,   icon: Globe,        color: "text-cyan" },
  { label: "Private souls",     value: s.privateSouls,  icon: Lock,         color: "text-neutral-400" },
  { label: "Pending review",    value: s.flaggedSouls,  icon: AlertTriangle, color: "text-yellow-400" },
  { label: "Removed by admin",  value: s.removedSouls,  icon: ShieldOff,    color: "text-red-400" },
  { label: "Total reports",     value: s.totalReports,  icon: Flag,         color: "text-orange-400" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setStats(d);
      })
      .catch(() => setError("failed to load stats"));
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-acid">
        <span className="h-1.5 w-1.5 animate-flicker bg-acid" />
        command centre
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
        Dashboard<span className="text-acid">.</span>
      </h1>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        &gt; Live snapshot of the EVOKE network.
      </p>

      {error && (
        <div className="mt-6 border border-red-900 bg-red-950/30 px-4 py-3 font-mono text-xs text-red-400">
          {error.includes("SUPABASE_SERVICE_ROLE_KEY") ? (
            <>
              <strong>Setup required:</strong> add your{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>.<br />
              Find it at Supabase dashboard → Settings → API → service_role key.
            </>
          ) : (
            error
          )}
        </div>
      )}

      {!stats && !error && (
        <div className="mt-12 font-mono text-xs text-neutral-600 animate-pulse">
          &gt; loading stats…
        </div>
      )}

      {stats && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS(stats).map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-neutral-800 bg-neutral-950/60 p-5"
              >
                <div className={`flex items-center gap-2 ${color}`}>
                  <Icon className="h-4 w-4" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{label}</span>
                </div>
                <div className="mt-3 font-display text-4xl font-extrabold tabular-nums tracking-tighter">
                  {value.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>

          {/* quick links */}
          <div className="mt-10">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Quick actions
            </h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="/admin/flagged"
                className="flex items-center gap-2 border border-yellow-800 bg-yellow-900/20 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-yellow-400 hover:bg-yellow-900/40"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                review {stats.flaggedSouls} flagged soul{stats.flaggedSouls !== 1 ? "s" : ""}
              </a>
              <a
                href="/api/admin/users?export=csv"
                target="_blank"
                className="flex items-center gap-2 border border-neutral-700 bg-neutral-900/40 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-neutral-300 hover:border-acid hover:text-acid"
              >
                <Users className="h-3.5 w-3.5" />
                export all user emails
              </a>
              <a
                href="/admin/users"
                className="flex items-center gap-2 border border-neutral-700 bg-neutral-900/40 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-neutral-300 hover:border-acid hover:text-acid"
              >
                <Users className="h-3.5 w-3.5" />
                manage {stats.totalUsers} users
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
