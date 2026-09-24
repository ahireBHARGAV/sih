import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PitchDraftEditor } from "./pitch-draft-editor";
import { MintCertificateButton } from "./mint-certificate-button";
import { MentorMessageThread } from "@/components/mentor-message-thread";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function PitchSandboxPage({ params }: { params: { id: string } }) {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!student) redirect("/");

  const pitch = await prisma.pitch.findUnique({
    where: { id: params.id, studentId: student.id },
    include: {
      problem: { include: { industry: true } },
      mentor: { include: { user: true } },
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });

  if (!pitch) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6">
          <Link href="/student" className="text-sm text-ink-500 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">{pitch.problem.title} Sandbox</h1>
            <Badge variant="secondary" className="mb-2">{pitch.status}</Badge>
          </div>
          <p className="text-ink-600">Draft your solution and iterate with your mentor before submitting to {pitch.problem.industry.companyName}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Editor */}
          <div className="lg:col-span-2">
            <GlassCard className="h-full flex flex-col">
              <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Draft Editor</h2>
              
              {pitch.status === 'PITCHED' ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-glass-border rounded-lg p-12 text-center">
                  <div>
                    <h3 className="font-semibold text-ink-900 mb-2">Waiting for Confirmation</h3>
                    <p className="text-sm text-ink-600">You can start drafting once the industry confirms your pitch and assigns a mentor.</p>
                  </div>
                </div>
              ) : pitch.status === 'SUBMITTED_TO_INDUSTRY' || pitch.status === 'SCORED' || pitch.status === 'PROOF_ISSUED' ? (
                <div className="flex-1 flex flex-col">
                  <div className="bg-white/40 p-4 rounded-md border border-glass-border mb-4">
                    <h3 className="font-semibold text-ink-900 text-sm mb-2">Final Draft</h3>
                    <pre className="text-sm text-ink-700 whitespace-pre-wrap font-mono">{pitch.draftContent}</pre>
                  </div>
                  
                  {pitch.status === 'SCORED' || pitch.status === 'PROOF_ISSUED' ? (
                    <div className="bg-teal/10 p-4 rounded-md border border-teal/20 mb-4">
                      <h3 className="font-semibold text-teal-900 text-sm mb-2">Industry Evaluation (Score: {pitch.industryScore}/100)</h3>
                      <p className="text-sm text-teal-800">{pitch.industryRemarks}</p>
                    </div>
                  ) : null}

                  {pitch.status === 'SCORED' ? (
                    <div className="mt-auto flex justify-end">
                      <MintCertificateButton pitchId={pitch.id} />
                    </div>
                  ) : pitch.status === 'PROOF_ISSUED' ? (
                    <div className="text-sm text-teal font-medium mt-auto">Certificate minted successfully! View it in your Skill Passport.</div>
                  ) : (
                    <div className="text-sm text-teal font-medium mt-auto">This draft has been approved by your mentor and is locked for industry review.</div>
                  )}
                </div>
              ) : (
                <div className="flex-1">
                  <PitchDraftEditor pitchId={pitch.id} initialContent={pitch.draftContent || ""} />
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Problem Context & Mentor Feedback */}
          <div className="space-y-6">
            <GlassCard>
              <h3 className="font-semibold text-ink-900 mb-2">Problem Context</h3>
              <p className="text-sm text-ink-700 mb-4">{pitch.problem.problemStatement}</p>
              
              <h3 className="font-semibold text-ink-900 mb-2">Deliverable</h3>
              <p className="text-sm text-ink-700 mb-4">{pitch.problem.deliverable}</p>

              <h3 className="font-semibold text-ink-900 mb-2">Rubric</h3>
              <p className="text-sm text-ink-700">{pitch.problem.rubric}</p>
            </GlassCard>

            <GlassCard>
              <h3 className="font-semibold text-ink-900 mb-2">Mentor Feedback</h3>
              {!pitch.mentor ? (
                <p className="text-sm text-ink-500 italic">No mentor assigned yet.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/40 p-3 rounded-lg border border-glass-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {pitch.mentor.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{pitch.mentor.user.name}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {pitch.mentor.expertiseTags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-glass-border">
                    <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">Feedback Thread</h4>
                    <div className="h-[400px]">
                      <MentorMessageThread 
                        pitchId={pitch.id} 
                        messages={pitch.messages} 
                        currentUserRole="STUDENT" 
                        canReply={pitch.status === 'DRAFT_WITH_MENTOR'} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
