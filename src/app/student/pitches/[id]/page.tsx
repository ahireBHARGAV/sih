import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PitchDraftEditor } from "./pitch-draft-editor";
import { MintCertificateButton } from "./mint-certificate-button";
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
      mentor: { include: { user: true } }
    }
  });

  if (!pitch) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
        { label: "Academics", href: "/student/academics" },
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
                <div className="space-y-3">
                  <p className="text-sm text-ink-700"><span className="font-medium">Mentor:</span> {pitch.mentor.user.name}</p>
                  {pitch.mentorFeedback ? (
                    <div className="bg-gold/10 p-3 rounded-md border border-gold/20 text-sm text-ink-800">
                      {pitch.mentorFeedback}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500 italic">No feedback provided yet. Submit a draft to get started.</p>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
