import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ResolveFlagButton } from "./resolve-flag-button";

export const dynamic = 'force-dynamic';

export default async function AdminFlagsQueue() {
  const { role, userId } = await getSession();
  if (role !== "ADMIN" || !userId) {
    redirect("/");
  }

  const flags = await prisma.adminFlag.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const openFlags = flags.filter(f => f.status === 'OPEN');
  const resolvedFlags = flags.filter(f => f.status === 'RESOLVED');

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Admin" items={[
        { label: "Dashboard", href: "/admin" },
        { label: "Flags Queue", href: "/admin/queue/flags", isActive: true }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-ink-500 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Flags Queue</h1>
          <p className="text-ink-600">Review and resolve reported issues, SLA breaches, and anomalous patterns.</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
              Action Required
              <Badge variant="destructive">{openFlags.length}</Badge>
            </h2>
            
            <div className="space-y-4">
              {openFlags.map(flag => (
                <GlassCard key={flag.id} className="flex flex-col gap-3 border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono">{flag.type}</Badge>
                      <span className="text-xs text-ink-400">{new Date(flag.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-ink-900 bg-white/40 p-3 rounded-md border border-glass-border">
                    {flag.note}
                  </p>

                  <div className="text-xs text-ink-500 flex gap-4">
                    {flag.relatedProblemId && (
                      <span>Problem ID: <span className="font-mono text-ink-900">{flag.relatedProblemId}</span></span>
                    )}
                    {flag.relatedPitchId && (
                      <span>Pitch ID: <span className="font-mono text-ink-900">{flag.relatedPitchId}</span></span>
                    )}
                  </div>

                  <div className="flex justify-end mt-2">
                    <ResolveFlagButton flagId={flag.id} />
                  </div>
                </GlassCard>
              ))}
              
              {openFlags.length === 0 && (
                <div className="text-center py-8 bg-white/40 rounded-xl border border-glass-border">
                  <p className="text-ink-500 font-medium">All caught up!</p>
                  <p className="text-sm text-ink-400 mt-1">No open flags require attention.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Recently Resolved</h2>
            <div className="space-y-3">
              {resolvedFlags.slice(0, 10).map(flag => (
                <GlassCard key={flag.id} className="opacity-70 flex justify-between items-center py-3">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-mono text-[10px]">{flag.type}</Badge>
                    <span className="text-sm text-ink-600 truncate max-w-md">{flag.note}</span>
                  </div>
                  <span className="text-xs text-ink-400">{new Date(flag.createdAt).toLocaleDateString()}</span>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
