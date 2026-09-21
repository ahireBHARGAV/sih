import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { role, userId } = await getSession();
  if (role !== "ADMIN" || !userId) {
    redirect("/");
  }

  // Count open flags
  const openFlagsCount = await prisma.adminFlag.count({
    where: { status: 'OPEN' }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Admin" items={[
        { label: "Dashboard", href: "/admin", isActive: true },
        { label: "Flags Queue", href: "/admin/queue/flags" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">System Admin</h1>
        <p className="text-ink-600 mb-8">Platform overview and moderation queues.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="flex flex-col gap-2 border-red-500/20 border-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Open Flags</span>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-4xl font-display font-bold text-ink-900">{openFlagsCount}</h2>
              <span className="text-red-500 font-medium mb-1">action needed</span>
            </div>
            <Link href="/admin/queue/flags">
              <Button size="sm" variant="secondary" className="w-full">Review Queue</Button>
            </Link>
          </GlassCard>

          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Verification Queue</span>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-4xl font-display font-bold text-ink-900">0</h2>
              <span className="text-ink-400 font-medium mb-1">pending</span>
            </div>
            <Button size="sm" variant="secondary" className="w-full" disabled>Review Queue</Button>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
