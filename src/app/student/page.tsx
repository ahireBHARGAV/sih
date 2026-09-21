import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      skills: { include: { skill: true } },
      pitches: { where: { status: 'PITCHED' } },
      applications: { where: { NOT: { stage: 'REJECTED' } } },
    }
  });

  if (!student) redirect("/");

  // Calculate gap count conceptually
  let gapCount = 0;
  if (student.targetRole) {
    const requirements = await prisma.industryRequirement.findMany({
      where: { roleTitle: { contains: student.targetRole, mode: 'insensitive' } },
      select: { skillId: true },
      distinct: ['skillId']
    });

    const requiredSkillIds = requirements.map(r => r.skillId);
    const verifiedStates = ["MENTOR_VERIFIED", "INDUSTRY_EVALUATED", "EXPERIENCE_VERIFIED"];
    
    let verified = 0;
    for (const skillId of requiredSkillIds) {
      const studentSkill = student.skills.find(s => s.skillId === skillId);
      if (studentSkill && verifiedStates.includes(studentSkill.state)) {
        verified++;
      }
    }
    gapCount = requiredSkillIds.length - verified;
  }

  const activeProblemsCount = student.pitches.length;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student", isActive: true },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Problems", href: "/student/problems" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-[1440px] px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Welcome back, {student.user.name.split(' ')[0]}</h1>
        <p className="text-ink-600 mb-8">Here is your progress towards becoming a {student.targetRole || "Verified Professional"}.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Level & XP</span>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-display font-bold text-ink-900">{student.xp}</h2>
              <span className="text-gold font-medium mb-1">{student.level}</span>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Skill Gap</span>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-display font-bold text-ink-900">{gapCount}</h2>
              <span className="text-ink-400 font-medium mb-1">skills missing</span>
            </div>
            {gapCount > 0 && (
              <Link href="/student/roadmap" className="mt-2 text-sm text-primary hover:underline">View Roadmap</Link>
            )}
          </GlassCard>

          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Active Problems</span>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-display font-bold text-ink-900">{activeProblemsCount}</h2>
              <span className="text-ink-400 font-medium mb-1">pending reviews</span>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
