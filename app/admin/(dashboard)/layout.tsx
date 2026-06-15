import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      <AdminSidebar />
      <main className="flex-1 overflow-auto px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
