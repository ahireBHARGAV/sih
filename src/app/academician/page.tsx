import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplyEngagementButton } from "./apply-engagement-button";
import { BecomeMentorButton } from "./become-mentor-button";
import { EngagementType } from "@prisma/client";

// Hardcoded available engagements for the MVP demo
const AVAILABLE_ENGAGEMENTS = [
  {
    id: "eng_1",
    title: "AI in AYUSH Research Symposium",
    type: "FDP" as EngagementType,
    organization: "Ministry of AYUSH",
    description: "A 3-day faculty development program focusing on integrating AI tools in traditional medicine research.",
  },
  {
    id: "eng_2",
    title: "Curriculum Advisory - Tech & Wellness",
    type: "CONSULTANCY" as EngagementType,
    organization: "TechWellness Corp",
    description: "Seeking academic consultants to help bridge the gap between software engineering curriculums and health-tech industry needs.",
  },
  {
    id: "eng_3",
    title: "Joint Research: Predictive Diagnostics",
    type: "RESEARCH" as EngagementType,
    organization: "Global Health Institute",
    description: "Collaborative research project looking for faculty with expertise in machine learning and bioinformatics.",
  }
];

export const dynamic = 'force-dynamic';

export default async function AcademicianPage() {
  const { role, userId } = await getSession();
  if (role !== "ACADEMICIAN" || !userId) {
    redirect("/");
  }

  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      engagements: true,
      institution: true
    }
  });

  if (!faculty) redirect("/");

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Academician" items={[
        { label: "Faculty Hub", href: "/academician", isActive: true }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Profile & My Engagements */}
          <div className="w-full md:w-1/3 space-y-6">
            <GlassCard>
              <h2 className="text-2xl font-display font-bold text-ink-900 mb-1">{faculty.user.name}</h2>
              <p className="text-ink-600 mb-4">{faculty.institution?.name}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {faculty.expertiseTags.map(tag => (
                  <Badge key={tag} variant="mentorEndorsed" className="bg-white/50">{tag}</Badge>
                ))}
              </div>
              <h3 className="font-semibold text-ink-900 mb-4 border-t border-glass-border pt-4">Mentoring</h3>
              {mentorProfile ? (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 text-sm mb-6">
                  You are registered as an Institution Mentor. You can now review and endorse student submissions from your institution.
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-ink-600 mb-2">Connect with the industry proof-of-work loop by mentoring your institution&apos;s students.</p>
                  <BecomeMentorButton />
                </div>
              )}

              <h3 className="font-semibold text-ink-900 mb-4 border-t border-glass-border pt-4">My Active Engagements</h3>
              {faculty.engagements.length === 0 ? (
                <p className="text-sm text-ink-600 italic">No active engagements yet.</p>
              ) : (
                <div className="space-y-3">
                  {faculty.engagements.map(eng => (
                    <div key={eng.id} className="p-3 bg-white/40 rounded-lg border border-glass-border">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-ink-900 text-sm leading-tight">{eng.title}</h4>
                        <Badge variant="default" className="text-[10px] bg-primary/10 text-primary">{eng.type}</Badge>
                      </div>
                      <p className="text-xs text-ink-600">Status: {eng.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Discover Opportunities */}
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-display font-bold text-ink-900 mb-2">Discover Engagements</h2>
            <p className="text-ink-600 mb-6">Browse and apply for Faculty Development Programs, Consultancy, and Research collaborations.</p>
            
            <div className="space-y-4">
              {AVAILABLE_ENGAGEMENTS.map(eng => {
                const hasApplied = faculty.engagements.some(fe => fe.title === eng.title && fe.type === eng.type);
                
                return (
                  <GlassCard key={eng.id} className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-display font-semibold text-ink-900">{eng.title}</h3>
                        <Badge variant={
                          eng.type === 'FDP' ? 'verified' : 
                          eng.type === 'CONSULTANCY' ? 'mentorEndorsed' : 'industryVerified'
                        } className="text-[10px]">{eng.type}</Badge>
                      </div>
                      <p className="text-sm font-medium text-ink-900 mb-2">{eng.organization}</p>
                      <p className="text-sm text-ink-600">{eng.description}</p>
                    </div>
                    <div className="shrink-0 mt-2 sm:mt-0">
                      <ApplyEngagementButton 
                        facultyId={faculty.id} 
                        type={eng.type} 
                        title={eng.title} 
                        hasApplied={hasApplied} 
                      />
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
