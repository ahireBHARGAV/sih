import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardLists } from "./dashboard-lists";

export const dynamic = 'force-dynamic';

export default async function IndustryDashboard() {
  const { role, userId } = await getSession();
  if (role !== "INDUSTRY" || !userId) {
    redirect("/");
  }

  const industry = await prisma.industryProfile.findUnique({
    where: { userId },
    include: {
      opportunities: true,
      problems: {
        include: {
          pitches: {
            where: {
              status: { in: ['SUBMITTED_TO_INDUSTRY'] }
            }
          }
        }
      }
    }
  });

  if (!industry) redirect("/");

  const activeOpportunities = industry.opportunities.filter(o => o.status === 'OPEN').length;
  const activeProblems = industry.problems.length;
  
  // Pending pitches for this industry's problems
  const pendingPitches = industry.problems.reduce((sum, problem) => sum + problem.pitches.length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Industry" items={[
        { label: "Dashboard", href: "/industry", isActive: true },
        { label: "Hiring", href: "/industry/hiring" },
        { label: "Pipeline", href: "/industry/pipeline" },
        { label: "Academics", href: "/industry/academics" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Welcome, {industry.companyName}</h1>
            <p className="text-ink-600">Overview of your talent pipeline and problems.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/industry/opportunities/new">
              <Button variant="secondary">Post Opportunity</Button>
            </Link>
            <Link href="/industry/problems/new">
              <Button>Post Problem</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Open Opportunities</span>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-display font-bold text-ink-900">{activeOpportunities}</h2>
              <span className="text-teal font-medium mb-1">roles</span>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Active Problem Statements</span>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-display font-bold text-ink-900">{activeProblems}</h2>
              <span className="text-ink-400 font-medium mb-1">posted</span>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Pending Reviews</span>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-display font-bold text-ink-900">{pendingPitches}</h2>
              <span className="text-primary font-medium mb-1">to score</span>
            </div>
          </GlassCard>
        </div>

        <DashboardLists problems={industry.problems} opportunities={industry.opportunities} />
      </main>
    </div>
  );
}
