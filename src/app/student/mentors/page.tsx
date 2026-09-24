import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function StudentMentorsPage() {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      pitches: {
        where: { mentorId: { not: null } },
        include: {
          problem: true,
          mentor: { include: { user: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  if (!student) redirect("/");

  // De-duplicate mentors by mapping them from pitches, but since a mentor can mentor multiple pitches for the same student, 
  // it's best to show a list of *Mentorships* (Pitch contexts) or group pitches by mentor.
  // The spec says: "each card showing the mentor, the linked Problem(s), status, and an unread-message indicator, linking into that pitch's thread."
  // So a card per pitch makes sense, or grouped by mentor. Let's group by mentor.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mentorGroups = new Map<string, { mentor: any, pitches: any[] }>();

  student.pitches.forEach(pitch => {
    if (!pitch.mentorId) return;
    if (!mentorGroups.has(pitch.mentorId)) {
      mentorGroups.set(pitch.mentorId, { mentor: pitch.mentor, pitches: [] });
    }
    mentorGroups.get(pitch.mentorId)!.pitches.push(pitch);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "My Mentors", href: "/student/mentors", isActive: true },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Opportunities", href: "/student/opportunities" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">My Mentors</h1>
          <p className="text-ink-600">Mentors assigned by industry partners who have coached you across your problem statements.</p>
        </div>

        {mentorGroups.size === 0 ? (
          <GlassCard className="text-center py-12">
            <p className="text-ink-500 italic">You haven&apos;t been assigned any mentors yet. Pitch to a problem statement and get confirmed by the industry to start working with a mentor.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(mentorGroups.values()).map(({ mentor, pitches }) => (
              <GlassCard key={mentor.id} className="flex flex-col gap-4">
                <div className="flex items-start gap-4 pb-4 border-b border-glass-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {mentor.user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-ink-900">{mentor.user.name}</h2>
                    <p className="text-sm text-ink-600 mb-2">{mentor.tier} Mentor</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertiseTags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Mentored Problem Statements</h3>
                  {pitches.map(pitch => {
                    // Check if last message was from mentor (simple unread proxy for MVP)
                    const lastMsg = pitch.messages[0];
                    const hasUnread = lastMsg && lastMsg.senderRole === 'MENTOR' && pitch.status === 'DRAFT_WITH_MENTOR';

                    return (
                      <Link key={pitch.id} href={`/student/pitches/${pitch.id}`} className="block group">
                        <div className="p-3 bg-white/40 rounded-lg border border-glass-border hover:border-primary/30 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-ink-900 text-sm group-hover:text-primary transition-colors">{pitch.problem.title}</h4>
                            {hasUnread && (
                              <Badge variant="default" className="text-[10px] bg-orange-500 gap-1 pl-1 pr-2">
                                <MessageSquare className="w-3 h-3" /> New
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-ink-500">
                            Status: <span className="font-medium">{pitch.status.replace(/_/g, ' ')}</span>
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
