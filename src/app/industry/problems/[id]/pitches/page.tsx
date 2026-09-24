import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PitchConfirmButton } from "./pitch-confirm-button";
import { getMentorsWithLoad } from "@/lib/mentor-load";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ProblemPitchesPage({ params }: { params: { id: string } }) {
  const { role, userId } = await getSession();
  if (role !== "INDUSTRY" || !userId) {
    redirect("/");
  }

  const industry = await prisma.industryProfile.findUnique({
    where: { userId }
  });

  if (!industry) redirect("/");

  const problem = await prisma.problem.findUnique({
    where: { id: params.id, industryId: industry.id },
    include: {
      skill: true,
      reviewer: { include: { user: true } },
      pitches: {
        include: {
          student: { include: { user: true, institution: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!problem) redirect("/");

  const pendingPitches = problem.pitches.filter(p => p.status === 'PITCHED');
  const activePitches = problem.pitches.filter(p => p.status !== 'PITCHED' && p.status !== 'REJECTED');

  const mentors = await getMentorsWithLoad();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Industry" items={[
        { label: "Dashboard", href: "/industry" },
        { label: "Hiring", href: "/industry/hiring" },
        { label: "Pipeline", href: "/industry/pipeline" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link href="/industry" className="text-sm text-ink-500 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">{problem.title} - Pitches</h1>
          <p className="text-ink-600">Review student pitches and confirm them to start the work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Pending Pitches ({pendingPitches.length})</h2>
            <div className="space-y-4">
              {pendingPitches.map(pitch => (
                <GlassCard key={pitch.id} className="flex flex-col gap-3 border-gold/40 border-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-ink-900">{pitch.student.user.name}</h3>
                      <p className="text-xs text-ink-500">{pitch.student.institution?.name}</p>
                    </div>
                    <Badge variant={pitch.matchPercentage >= 80 ? 'verified' : 'secondary'} className="text-sm">
                      {pitch.matchPercentage}% Match
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-ink-600">
                    <span className="font-semibold block">Reasoning:</span> {pitch.matchReason}
                  </div>

                  <div className="text-sm text-ink-900 bg-white/50 p-3 rounded-md border border-glass-border">
                    <span className="font-semibold block mb-1">Pitch:</span>
                    {pitch.pitchText}
                  </div>

                  <div className="flex justify-end mt-2">
                    <PitchConfirmButton 
                      pitchId={pitch.id} 
                      defaultMentorId={problem.reviewerId}
                      mentors={mentors.map(m => ({ id: m.id, user: { name: m.user.name }, tier: m.tier, activeMenteeCount: m.activeMenteeCount, maxActiveMentees: m.maxActiveMentees }))} 
                    />
                  </div>
                </GlassCard>
              ))}
              {pendingPitches.length === 0 && (
                <p className="text-ink-500 text-sm italic">No pending pitches for this problem.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Confirmed & In Progress ({activePitches.length})</h2>
            <div className="space-y-4">
              {activePitches.map(pitch => (
                <GlassCard key={pitch.id} className="flex flex-col gap-2 opacity-75">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-ink-900">{pitch.student.user.name}</h3>
                    <Badge variant="default" className="text-[10px]">{pitch.status}</Badge>
                  </div>
                  <p className="text-xs text-ink-600">Working with mentor: {problem.reviewer.user.name}</p>
                </GlassCard>
              ))}
              {activePitches.length === 0 && (
                <p className="text-ink-500 text-sm italic">No active pitches yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
