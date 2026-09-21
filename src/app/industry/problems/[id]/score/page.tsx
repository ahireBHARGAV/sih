import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PitchScoreForm } from "./pitch-score-form";

export const dynamic = 'force-dynamic';

export default async function ProblemScorePage({ params }: { params: { id: string } }) {
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
      pitches: {
        where: {
          status: { in: ['SUBMITTED_TO_INDUSTRY', 'SCORED', 'PROOF_ISSUED'] }
        },
        include: {
          student: { include: { user: true } },
          mentor: { include: { user: true } }
        },
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  if (!problem) redirect("/");

  const pendingScores = problem.pitches.filter(p => p.status === 'SUBMITTED_TO_INDUSTRY');
  const completedScores = problem.pitches.filter(p => p.status === 'SCORED' || p.status === 'PROOF_ISSUED');

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
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">{problem.title} - Final Evaluation</h1>
          <p className="text-ink-600">Review mentor-approved deliverables and provide final scores.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Awaiting Score ({pendingScores.length})</h2>
            <div className="space-y-6">
              {pendingScores.map(pitch => (
                <GlassCard key={pitch.id} className="flex flex-col gap-4 border-teal/40 border-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-ink-900">{pitch.student.user.name}</h3>
                      <p className="text-xs text-ink-600">Mentor: {pitch.mentor?.user.name}</p>
                    </div>
                    <Badge variant="mentorEndorsed">Mentor Approved</Badge>
                  </div>

                  <div className="text-sm text-ink-900 bg-white/40 p-3 rounded-md border border-glass-border">
                    <span className="font-semibold block mb-1">Final Draft:</span>
                    <pre className="text-sm text-ink-700 whitespace-pre-wrap font-mono">{pitch.draftContent}</pre>
                  </div>

                  <div className="bg-gold/10 p-3 rounded-md border border-gold/20 text-sm text-ink-800">
                    <span className="font-semibold block mb-1">Mentor Endorsement:</span>
                    {pitch.mentorFeedback}
                  </div>

                  <div className="pt-4 border-t border-glass-border">
                    <PitchScoreForm pitchId={pitch.id} />
                  </div>
                </GlassCard>
              ))}
              {pendingScores.length === 0 && (
                <p className="text-ink-500 text-sm italic">No submissions awaiting score.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Recently Scored</h2>
            <div className="space-y-4">
              {completedScores.map(pitch => (
                <GlassCard key={pitch.id} className="opacity-80">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-ink-900">{pitch.student.user.name}</h3>
                    <Badge variant={pitch.status === 'PROOF_ISSUED' ? 'industryVerified' : 'verified'} className="text-[10px]">
                      Score: {pitch.industryScore}/100
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-600 truncate">Remarks: {pitch.industryRemarks}</p>
                </GlassCard>
              ))}
              {completedScores.length === 0 && (
                <p className="text-sm text-ink-500 italic">No completed scores yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
