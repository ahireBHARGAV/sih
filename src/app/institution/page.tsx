import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SkillDemandChart, FunnelChart } from "./charts";
import { AnimatedCounter } from "@/components/animated-counter";

export const dynamic = 'force-dynamic';

export default async function InstitutionPage() {
  const { role, userId } = await getSession();
  if (role !== "INSTITUTION" || !userId) {
    redirect("/");
  }

  const institution = await prisma.institutionProfile.findUnique({
    where: { userId }
  });

  if (!institution) redirect("/");

  // 1. Compute Global Skill Demand
  const opportunitySkills = await prisma.opportunitySkill.findMany({
    include: { skill: true }
  });
  
  const skillCounts = opportunitySkills.reduce((acc, curr) => {
    acc[curr.skill.name] = (acc[curr.skill.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const demandData = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7); // top 7

  // 2. Compute Application Funnel for this institution's students
  const applications = await prisma.application.findMany({
    where: {
      student: { institutionName: institution.name }
    }
  });

  const funnelCounts = applications.reduce((acc, curr) => {
    acc[curr.stage] = (acc[curr.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelData = [
    { stage: "APPLIED", count: funnelCounts["APPLIED"] || 0 },
    { stage: "SHORTLISTED", count: funnelCounts["SHORTLISTED"] || 0 },
    { stage: "SELECTED", count: funnelCounts["SELECTED"] || 0 }
  ];

  // Total active students from this institution
  const studentCount = await prisma.studentProfile.count({
    where: { institutionName: institution.name }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Institution" items={[
        { label: "Dashboard", href: "/institution", isActive: true }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">{institution.name}</h1>
        <p className="text-ink-600 mb-8">Macro-view of skill demand, student placements, and faculty engagement.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="text-center py-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-600 mb-2">Registered Students</h3>
            <AnimatedCounter value={studentCount} className="text-4xl font-display font-bold text-ink-900" />
          </GlassCard>
          <GlassCard className="text-center py-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-600 mb-2">Total Applications</h3>
            <AnimatedCounter value={applications.length} className="text-4xl font-display font-bold text-ink-900" />
          </GlassCard>
          <GlassCard className="text-center py-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-600 mb-2">Placed Students</h3>
            <AnimatedCounter value={funnelCounts["SELECTED"] || 0} className="text-4xl font-display font-bold text-orange-500" />
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-1">Global Skill Demand</h2>
            <p className="text-sm text-ink-600 mb-6">Top skills currently requested by industry partners.</p>
            {demandData.length > 0 ? (
              <SkillDemandChart data={demandData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-ink-400 text-sm italic">Not enough data to display chart.</div>
            )}
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-1">Placement Funnel</h2>
            <p className="text-sm text-ink-600 mb-6">Application progression for students from your institution.</p>
            {applications.length > 0 ? (
              <FunnelChart data={funnelData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-ink-400 text-sm italic">Not enough data to display chart.</div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
