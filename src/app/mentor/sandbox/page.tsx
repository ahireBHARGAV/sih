import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MentorReviewForm } from "./mentor-review-form";

export const dynamic = 'force-dynamic';

export default async function MentorSandboxPage() {
  const { role, userId } = await getSession();
  if (role !== "MENTOR" || !userId) {
    redirect("/");
  }

  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId }
  });

  if (!mentor) redirect("/");

  // Fetch pitches assigned to this mentor that need review (DRAFT_WITH_MENTOR)
  const pendingPitches = await prisma.pitch.findMany({
    where: { 
      mentorId: mentor.id,
      status: 'DRAFT_WITH_MENTOR'
    },
    include: {
      problem: { include: { industry: true } },
      student: { include: { user: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Also fetch recently reviewed ones for context
  const historyPitches = await prisma.pitch.findMany({
    where: {
      mentorId: mentor.id,
      status: { notIn: ['PITCHED', 'CONFIRMED', 'DRAFT_WITH_MENTOR', 'REJECTED'] }
    },
    include: {
      problem: { include: { industry: true } },
      student: { include: { user: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Mentor" items={[
        { label: "Dashboard", href: "/mentor" },
        { label: "Sandbox", href: "/mentor/sandbox", isActive: true }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Mentor Sandbox</h1>
        <p className="text-ink-600 mb-8">Review student drafts. Only mentor-approved work reaches the industry.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-display font-semibold text-ink-900">Pending Reviews ({pendingPitches.length})</h2>
            
            {pendingPitches.map(pitch => (
              <GlassCard key={pitch.id} className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-ink-900">{pitch.problem.title}</h3>
                    <p className="text-sm font-medium text-ink-600">Student: {pitch.student.user.name}</p>
                    <p className="text-xs text-ink-500">Industry: {pitch.problem.industry.companyName}</p>
                  </div>
                  <Badge variant="mentorEndorsed">Needs Review</Badge>
                </div>

                <div className="text-sm text-ink-900 bg-white/40 p-3 rounded-md border border-glass-border">
                  <span className="font-semibold block mb-1">Current Draft:</span>
                  <pre className="text-sm text-ink-700 whitespace-pre-wrap font-mono">{pitch.draftContent}</pre>
                </div>
                
                <MentorReviewForm pitchId={pitch.id} existingFeedback={pitch.mentorFeedback || ""} />
              </GlassCard>
            ))}

            {pendingPitches.length === 0 && (
              <GlassCard className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 opacity-70">
                <p className="text-ink-600 font-medium">No pending drafts to review.</p>
                <p className="text-sm text-ink-500 mt-1">Students are working on their solutions.</p>
              </GlassCard>
            )}
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Recent History</h2>
            <div className="space-y-4">
              {historyPitches.map(pitch => (
                <GlassCard key={pitch.id} className="opacity-80">
                  <h3 className="font-semibold text-ink-900 text-sm mb-1">{pitch.problem.title}</h3>
                  <p className="text-xs text-ink-600 mb-2">Student: {pitch.student.user.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant={pitch.status === 'SCORED' || pitch.status === 'PROOF_ISSUED' ? 'verified' : 'secondary'} className="text-[10px]">
                      {pitch.status}
                    </Badge>
                  </div>
                </GlassCard>
              ))}
              {historyPitches.length === 0 && (
                <p className="text-sm text-ink-500 italic">No reviewed pitches yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
