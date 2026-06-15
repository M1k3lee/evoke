"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, AlertTriangle, Users, Skull, LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/flagged", label: "Flagged", icon: AlertTriangle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/souls", label: "All Souls", icon: Skull },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="flex w-52 flex-col border-r border-neutral-900 bg-neutral-950 px-4 py-8 lg:w-60">
      {/* brand */}
      <div className="mb-8 px-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-600">
          evoke
        </span>
        <div className="mt-0.5 font-display text-lg font-extrabold uppercase tracking-tighter text-acid">
          Admin
        </div>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
                active
                  ? "bg-acid/10 text-acid"
                  : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* logout */}
      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-600 transition-colors hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
