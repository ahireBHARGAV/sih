import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreateProblemForm } from "./create-problem-form";
import { getMentorsWithLoad } from "@/lib/mentor-load";

export const dynamic = 'force-dynamic';

export default async function NewProblemPage() {
  const { role, userId } = await getSession();
  if (role !== "INDUSTRY" || !userId) {
    redirect("/");
  }

  const industry = await prisma.industryProfile.findUnique({
    where: { userId }
  });

  if (!industry) redirect("/");

  // Need to pass skills and verified mentors to the form
  const skills = await prisma.skill.findMany({
    orderBy: { name: 'asc' }
  });

  const mentors = await getMentorsWithLoad();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Industry" items={[
        { label: "Dashboard", href: "/industry" },
        { label: "Hiring", href: "/industry/hiring" },
        { label: "Pipeline", href: "/industry/pipeline" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Post a New Problem</h1>
          <p className="text-ink-600">Create a real-world problem to assess and upskill students.</p>
        </div>

        <GlassCard>
          <CreateProblemForm 
            skills={skills.map(s => ({ id: s.id, name: s.name }))} 
            mentors={mentors.map(m => ({ 
              id: m.id, 
              user: { name: m.user.name }, 
              tier: m.tier, 
              expertiseTags: m.expertiseTags,
              activeMenteeCount: m.activeMenteeCount,
              maxActiveMentees: m.maxActiveMentees
            }))} 
          />
        </GlassCard>
      </main>
    </div>
  );
}
