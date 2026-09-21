import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeMatch } from "@/lib/gap-analysis";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function RoadmapPage() {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: { include: { skill: true } }
    }
  });

  if (!student) redirect("/");

  const targetRole = student.targetRole || "Frontend Developer Intern";

  // Fetch requirements
  const requirements = await prisma.industryRequirement.findMany({
    where: { roleTitle: { contains: targetRole, mode: 'insensitive' } },
    include: { skill: true }
  });

  const requiredSkillsMap = new Map();
  for (const req of requirements) {
    if (!requiredSkillsMap.has(req.skillId)) {
      requiredSkillsMap.set(req.skillId, req.skill);
    }
  }
  const requiredSkillIds = Array.from(requiredSkillsMap.keys());

  const matchResult = computeMatch(
    requiredSkillIds,
    student.skills.map(s => ({ skillId: s.skillId, state: s.state }))
  );

  const missingSkills = matchResult.missing.map(id => requiredSkillsMap.get(id));

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap", isActive: true },
        { label: "Challenges", href: "/student/challenges" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Learning Roadmap</h1>
        <p className="text-ink-600 mb-8">
          Based on industry demand for <span className="font-semibold">{targetRole}</span>, here is your path to verification.
        </p>
        
        <div className="grid gap-6">
          <GlassCard className="flex justify-between items-center bg-white/40">
            <div>
              <h2 className="text-xl font-display font-semibold text-ink-900">Readiness Score</h2>
              <p className="text-sm text-ink-600">{matchResult.verified} of {matchResult.requiredCount} required skills verified.</p>
            </div>
            <div className="text-4xl font-display font-bold text-primary">
              {matchResult.percentage}%
            </div>
          </GlassCard>

          {missingSkills.length === 0 ? (
            <GlassCard>
              <h2 className="text-xl font-display font-semibold text-teal mb-2">You are ready!</h2>
              <p className="text-ink-600">You have verified all the critical skills for your target role. Check out your matching opportunities.</p>
            </GlassCard>
          ) : (
            <div>
              <h3 className="text-lg font-display font-semibold text-ink-900 mb-4 mt-8">Missing Skills to Acquire</h3>
              <div className="grid gap-4">
                {missingSkills.map((skill: { id: string, name: string }) => (
                  <GlassCard key={skill.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-semibold text-ink-900">{skill.name}</h4>
                      <p className="text-sm text-ink-600">Recommended action: Complete a challenge to verify this skill.</p>
                    </div>
                    <Link href={`/student/challenges?skillId=${skill.id}`}>
                      <Button variant="secondary" size="sm">Find Challenges</Button>
                    </Link>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
