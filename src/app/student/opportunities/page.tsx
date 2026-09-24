import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeMatch } from "@/lib/gap-analysis";
import { ApplyButton } from "./apply-button";
import { Badge } from "@/components/ui/badge";
import { TiltWrapper } from "@/components/tilt-wrapper";

export const dynamic = 'force-dynamic';

export default async function StudentOpportunitiesPage() {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: { include: { skill: true } },
      applications: true
    }
  });

  if (!student) redirect("/");

  // Fetch all open opportunities with required skills
  const opportunities = await prisma.opportunity.findMany({
    where: { status: 'OPEN' },
    include: {
      industry: true,
      requiredSkills: { include: { skill: true } }
    }
  });

  // Calculate match for each opportunity
  const matchedOpportunities = opportunities.map(opp => {
    const requiredIds = opp.requiredSkills.map(s => s.skillId);
    const match = computeMatch(requiredIds, student.skills.map(s => ({ skillId: s.skillId, state: s.state })));
    const hasApplied = student.applications.some(a => a.opportunityId === opp.id);
    
    return { ...opp, match, hasApplied };
  });

  // Sort by match percentage (descending)
  matchedOpportunities.sort((a, b) => b.match.percentage - a.match.percentage);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities", isActive: true },
        { label: "Applications", href: "/student/applications" },
        { label: "Academics", href: "/student/academics" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Matched Opportunities</h1>
        <p className="text-ink-600 mb-8">Jobs and internships tailored to your verified skills.</p>

        <div className="grid gap-6">
          {matchedOpportunities.length === 0 ? (
            <GlassCard>
              <p className="text-ink-600">No open opportunities available right now.</p>
            </GlassCard>
          ) : (
            matchedOpportunities.map(opp => (
              <TiltWrapper key={opp.id} className="block">
                <GlassCard className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-display font-semibold text-ink-900">{opp.title}</h2>
                      <Badge variant={opp.type === 'INTERNSHIP' ? 'mentorEndorsed' : 'verified'} className="text-[10px]">
                        {opp.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-ink-900 mb-1">{opp.industry.companyName}</p>
                    <p className="text-sm text-ink-600 mb-4">{opp.location} • {opp.description}</p>
                    
                    <div className="mt-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-600 block mb-2">Required Skills</span>
                      <div className="flex flex-wrap gap-2">
                        {opp.requiredSkills.map(rs => {
                          const isVerified = !opp.match.missing.includes(rs.skillId) && student.skills.find(s => s.skillId === rs.skillId)?.state !== 'UNVERIFIED';
                          return (
                            <Badge 
                              key={rs.id} 
                              variant={isVerified ? 'verified' : 'default'}
                              className={!isVerified ? 'bg-white/55 text-ink-600 border-glass-border' : ''}
                            >
                              {rs.skill.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-48 bg-white/55 rounded-xl p-4 border border-glass-border flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">Match Score</span>
                    <div className="text-3xl font-display font-bold text-ink-900 mb-1">
                      {opp.match.percentage}%
                    </div>
                    <span className="text-xs text-ink-600 mb-4">{opp.match.verified}/{opp.match.requiredCount} skills verified</span>
                    
                    <ApplyButton studentId={student.id} opportunityId={opp.id} hasApplied={opp.hasApplied} />
                  </div>
                </GlassCard>
              </TiltWrapper>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
