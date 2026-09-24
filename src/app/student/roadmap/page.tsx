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

  // Calculate progress for each skill
  const getProgress = (state: string) => {
    switch(state) {
      case 'UNVERIFIED': return { percent: 33, label: "Mentioned", next: "Solve Industry Problem", action: "Find Problem Statements" };
      case 'MENTOR_ENDORSED': return { percent: 66, label: "Mentor Endorsed", next: "Awaiting Industry Verification", action: null };
      case 'VERIFIED': 
      case 'INDUSTRY_VERIFIED': return { percent: 100, label: "Verified", next: "Skill fully verified!", action: null };
      default: return { percent: 0, label: "Unknown", next: "", action: null };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap", isActive: true },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
        { label: "Academics", href: "/student/academics" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Verification Roadmap</h1>
        <p className="text-ink-600 mb-8">
          Track your progress towards achieving 100% verification for all the skills in your passport.
        </p>
        
        <div className="grid gap-6">
          {student.skills.length === 0 ? (
            <GlassCard>
              <h2 className="text-xl font-display font-semibold text-ink-900 mb-2">No skills added yet</h2>
              <p className="text-ink-600 mb-4">Go to your Skill Passport to add your first mentioned skill.</p>
              <Link href="/student/passport">
                <Button>Go to Skill Passport</Button>
              </Link>
            </GlassCard>
          ) : (
            student.skills.map((s) => {
              const progress = getProgress(s.state);
              return (
                <GlassCard key={s.id} className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-display font-bold text-ink-900">{s.skill.name}</h2>
                    <span className="font-semibold text-primary">{progress.percent}% Verified</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${progress.percent}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Current Status: <span className="font-normal text-ink-600">{progress.label}</span></p>
                      <p className="text-sm font-semibold text-ink-900">Next Step: <span className="font-normal text-ink-600">{progress.next}</span></p>
                    </div>
                    {progress.action && (
                      <Link href={`/student/problems?skillId=${s.skillId}`}>
                        <Button variant="secondary" size="sm">{progress.action}</Button>
                      </Link>
                    )}
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
