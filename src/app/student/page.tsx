import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MetallicSkillCard } from "@/components/ui/metallic-skill-card";
import { removeSkill } from "./actions";

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
      pitches: { where: { NOT: { status: { in: ['REJECTED', 'PROOF_ISSUED', 'SCORED'] } } } },
      applications: { where: { NOT: { stage: 'REJECTED' } } },
    }
  });

  if (!student) redirect("/");

  const skillsData = student.skills.map(s => ({
    skillId: s.skillId,
    name: s.skill.name,
    state: s.state
  }));

  const activeProblemsCount = student.pitches.length;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student", isActive: true },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-[1440px] px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Welcome back, {student.user.name.split(' ')[0]}</h1>
        <p className="text-ink-600 mb-8">Here is your current progress and activity.</p>
        
        <MetallicSkillCard 
          name={student.user.name}
          level={student.level}
          targetRole={student.targetRole}
          xp={student.xp}
          skills={skillsData}
          onRemoveSkill={removeSkill}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-8">

          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Employability Score</span>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-display font-bold text-ink-900">{student.employabilityScore}</h2>
              <span className="text-ink-400 font-medium mb-1">/ 1000</span>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-2">
            <span className="text-ink-600 text-sm font-semibold uppercase tracking-wider">Active Problem Statements</span>
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
