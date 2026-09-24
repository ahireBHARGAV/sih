import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeMatch } from "@/lib/gap-analysis";
import { PitchProblemForm } from "./pitch-problem-form";
import { TiltWrapper } from "@/components/tilt-wrapper";

export const dynamic = 'force-dynamic';

export default async function StudentProblemsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { skills: true, pitches: true }
  });

  if (!student) redirect("/");

  const skillIdFilter = typeof searchParams.skillId === 'string' ? searchParams.skillId : undefined;
  
  let skillFilterName = null;
  if (skillIdFilter) {
    const s = await prisma.skill.findUnique({ where: { id: skillIdFilter } });
    if (s) skillFilterName = s.name;
  }

  // Find Live Problem Statements
  const liveProblems = await prisma.problem.findMany({
    where: { 
      status: 'LIVE',
      ...(skillIdFilter ? { skillId: skillIdFilter } : {})
    },
    include: { industry: true, skill: true }
  });

  // Calculate match and map data
  const problemsWithMatch = liveProblems.map(problem => {
    const match = computeMatch([problem.skillId], student.skills);
    const hasPitched = student.pitches.some(p => p.problemId === problem.id);
    return { problem, match, hasPitched };
  });

  // Sort by match percentage descending
  problemsWithMatch.sort((a, b) => b.match.percentage - a.match.percentage);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Problem Statements", href: "/student/problems", isActive: true },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
        { label: "Academics", href: "/student/academics" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-display font-bold text-ink-900">Live Problem Statements</h1>
          {skillFilterName && (
            <Badge variant="outline" className="text-sm bg-orange-50 border-orange-200 text-orange-800">
              Filtering by skill: {skillFilterName}
            </Badge>
          )}
        </div>
        <p className="text-ink-600 mb-8">
          {skillFilterName 
            ? `Pitch yourself to solve these real industry problem statements to verify your ${skillFilterName} skill and earn proof-of-work.`
            : "Pitch yourself to solve real industry problem statements and earn verified proof-of-work."}
        </p>

        <div className="space-y-6">
          {problemsWithMatch.map(({ problem, match, hasPitched }) => (
            <TiltWrapper key={problem.id} className="block">
              <GlassCard className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-display font-semibold text-ink-900">{problem.title}</h2>
                    <p className="text-sm font-medium text-ink-600">{problem.industry.companyName}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant={match.percentage >= 80 ? 'verified' : 'secondary'} className="text-sm">
                      {match.percentage}% Match
                    </Badge>
                    <span className="text-[10px] text-ink-400 mt-1">{match.verified}/1 required skills verified</span>
                  </div>
                </div>

                <div className="text-sm text-ink-900 mt-2">
                  <span className="font-semibold">Target Skill:</span> <Badge variant="outline" className="ml-1 text-[10px]">{problem.skill.name}</Badge>
                </div>

                <div className="text-sm text-ink-700 bg-white/55 p-3 rounded-md border border-glass-border">
                  <span className="font-semibold block mb-1">Problem Statement:</span>
                  {problem.problemStatement}
                </div>
                
                <div className="text-sm text-ink-700">
                  <span className="font-semibold">Deliverable:</span> {problem.deliverable}
                </div>

                {hasPitched ? (
                  <div className="mt-4 pt-4 border-t border-glass-border">
                    <Badge variant="mentorEndorsed">Pitch Submitted</Badge>
                    <span className="text-xs text-ink-500 ml-2">Waiting for industry confirmation.</span>
                  </div>
                ) : (
                  <PitchProblemForm problemId={problem.id} />
                )}
              </GlassCard>
            </TiltWrapper>
          ))}
          
          {problemsWithMatch.length === 0 && (
            <p className="text-ink-500 italic">No Live Problem Statements available right now.</p>
          )}
        </div>
      </main>
    </div>
  );
}
