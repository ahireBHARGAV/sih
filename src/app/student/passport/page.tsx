import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VerificationState } from "@prisma/client";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function PassportPage() {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      skills: { 
        include: { skill: true },
        orderBy: { updatedAt: 'desc' }
      },
    }
  });

  if (!student) redirect("/");

  // Group skills by category for better display
  const skillsByCategory: Record<string, typeof student.skills> = {
    TECH: [],
    AYUSH_ALLIED: [],
    SOFT_SKILL: []
  };

  student.skills.forEach(s => {
    if (skillsByCategory[s.skill.category]) {
      skillsByCategory[s.skill.category].push(s);
    }
  });

  const getBadgeVariant = (state: VerificationState) => {
    switch (state) {
      case "UNVERIFIED": return "unverified";
      case "MENTOR_ENDORSED": return "mentorEndorsed";
      case "VERIFIED": return "verified";
      case "INDUSTRY_VERIFIED": return "industryVerified";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Card", href: "/student/passport", isActive: true },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Problems", href: "/student/problems" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-[1440px] px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Verified Skill Card</h1>
        <p className="text-ink-600 mb-8">Your verified skills act as your proof-of-work to the industry. Employability Score: {student.employabilityScore}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <GlassCard key={category} className="flex flex-col gap-4">
              <h2 className="text-lg font-display font-semibold text-ink-900 capitalize">
                {category.replace('_', ' ')}
              </h2>
              
              {skills.length === 0 ? (
                <p className="text-sm text-ink-400">No skills in this category yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {skills.map(s => (
                    <div key={s.id} className="flex items-center justify-between">
                      <Badge variant={getBadgeVariant(s.state)}>
                        {s.skill.name}
                        {s.state === "INDUSTRY_VERIFIED" && (
                          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </Badge>
                      {s.evidenceRef && (
                        <Link href={`/verify/${s.evidenceRef}`} className="text-[10px] text-teal hover:underline ml-2">
                          View Evidence
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
}
