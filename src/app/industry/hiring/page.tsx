import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function TalentDiscoveryPage({
  searchParams
}: {
  searchParams: { skill?: string }
}) {
  const { role, userId } = await getSession();
  if (role !== "INDUSTRY" || !userId) {
    redirect("/");
  }

  // Fetch all skills for the filter dropdown
  const allSkills = await prisma.skill.findMany({ orderBy: { name: 'asc' }});
  
  const skillFilter = searchParams.skill;

  // Find students who have the specified skill verified
  const students = await prisma.studentProfile.findMany({
    where: {
      ...(skillFilter ? {
        skills: {
          some: {
            skillId: skillFilter,
            state: { in: ['VERIFIED', 'INDUSTRY_VERIFIED'] }
          }
        }
      } : {})
    },
    include: {
      user: true,
      skills: {
        include: { skill: true }
      },
      institution: true
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Industry" items={[
        { label: "Dashboard", href: "/industry" },
        { label: "Hiring", href: "/industry/hiring", isActive: true },
        { label: "Pipeline", href: "/industry/pipeline" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Talent Discovery</h1>
        <p className="text-ink-600 mb-8">Search for students with verified proof-of-work.</p>
        
        {/* Filter Bar */}
        <GlassCard className="mb-8 flex items-center justify-between py-4">
          <form className="flex items-center gap-4 w-full">
            <label className="text-sm font-semibold text-ink-900">Filter by Skill:</label>
            <select 
              name="skill" 
              defaultValue={skillFilter || ""}
              className="h-10 px-4 rounded-xl border border-glass-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary flex-1 max-w-sm"
            >
              <option value="">All Verified Skills</option>
              {allSkills.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Button type="submit" variant="secondary" className="h-10">Apply Filter</Button>
            {skillFilter && (
              <Link href="/industry/hiring" className="text-sm text-primary hover:underline ml-auto">
                Clear Filters
              </Link>
            )}
          </form>
        </GlassCard>

        {/* Talent Grid */}
        <div className="grid gap-6">
          {students.length === 0 ? (
            <GlassCard>
              <p className="text-ink-600">No students found matching this criteria.</p>
            </GlassCard>
          ) : (
            students.map(student => {
              // Group verified vs developing skills for display
              const verifiedSkills = student.skills.filter(s => ['VERIFIED', 'INDUSTRY_VERIFIED'].includes(s.state));
              const developingSkills = student.skills.filter(s => !['VERIFIED', 'INDUSTRY_VERIFIED'].includes(s.state));

              return (
                <GlassCard key={student.id} className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-ink-900">{student.user.name}</h2>
                      <p className="text-sm text-ink-600 mt-1">{student.institution?.name || "Institution not specified"} • Level {student.level}</p>
                    </div>
                    <Button variant="secondary" size="sm">Invite to Apply</Button>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-600 block mb-2">Verified Skills (Proof of Work)</span>
                    <div className="flex flex-wrap gap-2">
                      {verifiedSkills.length > 0 ? verifiedSkills.map(s => (
                        <Badge key={s.id} variant={s.state === 'INDUSTRY_VERIFIED' ? 'industryVerified' : 'verified'}>
                          {s.skill.name}
                        </Badge>
                      )) : <span className="text-sm text-ink-400">None yet</span>}
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-600 block mb-2">Developing Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {developingSkills.length > 0 ? developingSkills.map(s => (
                        <Badge key={s.id} variant="default" className="bg-white/40 text-ink-600 border-glass-border">
                          {s.skill.name}
                        </Badge>
                      )) : <span className="text-sm text-ink-400">None</span>}
                    </div>
                  </div>
                </GlassCard>
              )
            })
          )}
        </div>
      </main>
    </div>
  );
}
