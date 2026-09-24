import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VerificationState } from "@prisma/client";
import Link from "next/link";
import { MetallicSkillCard } from "@/components/ui/metallic-skill-card";
import { addMentionedSkill } from "../actions";

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

  const studentSkillIds = student.skills.map(s => s.skillId);
  const availableSkills = await prisma.skill.findMany({
    where: { id: { notIn: studentSkillIds } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const skillsData = student.skills.map(s => ({
    skillId: s.skillId,
    name: s.skill.name,
    state: s.state
  }));

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
        { label: "Skill Passport", href: "/student/passport", isActive: true },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
        { label: "Academics", href: "/student/academics" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-[1440px] px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Skill Passport</h1>
        <p className="text-ink-600 mb-8">Build your verified skill passport. Declare your skills here and prove them through industry problem statements.</p>
        
        <div className="mb-12">
          <MetallicSkillCard 
            name={student.user.name}
            level={student.level}
            targetRole={student.targetRole}
            xp={student.xp}
            skills={skillsData}
            availableSkills={availableSkills}
            onAddSkill={addMentionedSkill}
          />
        </div>

        <h2 className="text-2xl font-display font-bold text-ink-900 mb-6">Detailed Verification Status</h2>

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
                      <div className="flex items-center gap-2">
                        <Badge variant={getBadgeVariant(s.state)}>
                          {s.state === "UNVERIFIED" ? "Mentioned: " : ""}{s.skill.name}
                          {s.state === "INDUSTRY_VERIFIED" && (
                            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </Badge>
                        {s.state === "UNVERIFIED" && (
                          <Link href={`/student/problems?skillId=${s.skillId}`} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full hover:bg-orange-200 transition-colors font-medium">
                            Verify
                          </Link>
                        )}
                      </div>
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
