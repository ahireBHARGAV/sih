import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, CheckCircle, ShieldCheck, Trophy } from "lucide-react";
import { getActiveMenteeCount } from "@/lib/mentor-load";

export const dynamic = 'force-dynamic';

export default async function MentorDashboard() {
  const { role, userId } = await getSession();
  if (role !== "MENTOR" || !userId) {
    redirect("/");
  }

  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: {
      pitchesMentoring: {
        include: {
          student: { include: { user: true, institution: true } },
          problem: { include: { industry: true } }
        }
      }
    }
  });

  if (!mentor) redirect("/");

  const activeMenteesCount = await getActiveMenteeCount(mentor.id);
  const activePitches = mentor.pitchesMentoring.filter(p => p.status === 'CONFIRMED' || p.status === 'DRAFT_WITH_MENTOR');
  
  const endorsedPitches = mentor.pitchesMentoring.filter(p => 
    ['SUBMITTED_TO_INDUSTRY', 'SCORED', 'PROOF_ISSUED'].includes(p.status)
  );
  
  const successfulPitches = endorsedPitches.filter(p => 
    ['SCORED', 'PROOF_ISSUED'].includes(p.status)
  );

  const verificationRate = endorsedPitches.length > 0 
    ? Math.round((successfulPitches.length / endorsedPitches.length) * 100) 
    : 0;

  const xpGenerated = successfulPitches.length * 100; // Assume 100 XP per successful problem statement

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Mentor" items={[
        { label: "Dashboard", href: "/mentor", isActive: true },
        { label: "Sandbox", href: "/mentor/sandbox" },
        { label: "Academics", href: "/mentor/academics" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Mentor Overview</h1>
          <p className="text-ink-600">Track your mentorship impact, active students, and industry success rate.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6 flex flex-col items-center text-center justify-center border-t-4 border-primary/60">
            <Users className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-1">Active Roster</p>
            <p className="text-3xl font-bold text-ink-900">{activeMenteesCount}<span className="text-lg text-ink-500"> / {mentor.maxActiveMentees}</span></p>
          </GlassCard>
          
          <GlassCard className="p-6 flex flex-col items-center text-center justify-center border-t-4 border-gold/60">
            <CheckCircle className="w-8 h-8 text-gold mb-2" />
            <p className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-1">Total Endorsed</p>
            <p className="text-3xl font-bold text-ink-900">{endorsedPitches.length}</p>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col items-center text-center justify-center border-t-4 border-teal/60">
            <ShieldCheck className="w-8 h-8 text-teal mb-2" />
            <p className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-ink-900">{verificationRate}%</p>
            <p className="text-xs text-ink-500 mt-1">Verified by Industry</p>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col items-center text-center justify-center border-t-4 border-blue-500/60">
            <Trophy className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-1">XP Impact</p>
            <p className="text-3xl font-bold text-ink-900">+{xpGenerated}</p>
            <p className="text-xs text-ink-500 mt-1">Total Student XP Gained</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Mentees */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Current Mentees</h2>
            {activePitches.length === 0 ? (
              <GlassCard className="text-center py-12 border-dashed opacity-70">
                <p className="text-ink-600 font-medium">You have no active mentees.</p>
                <p className="text-sm text-ink-500 mt-1">Make sure you are marked as &quot;Available&quot; in the Sandbox.</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {activePitches.map(pitch => (
                  <GlassCard key={pitch.id} className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-ink-900">{pitch.student.user.name}</h3>
                        <p className="text-xs text-ink-500">{pitch.student.institution?.name}</p>
                      </div>
                      <Badge variant={pitch.status === 'DRAFT_WITH_MENTOR' ? 'default' : 'secondary'}>
                        {pitch.status === 'DRAFT_WITH_MENTOR' ? 'Needs Review' : 'Drafting'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm bg-white/40 p-3 rounded-md border border-glass-border flex justify-between items-center">
                      <div>
                        <span className="font-semibold block mb-1">Working on:</span>
                        <span className="text-ink-800">{pitch.problem.title}</span>
                      </div>
                      <Link href="/mentor/sandbox">
                        <button className="text-xs font-semibold text-primary hover:underline">
                          Go to Sandbox →
                        </button>
                      </Link>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Recent Successes */}
          <div>
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-4">Recent Successes</h2>
            {successfulPitches.length === 0 ? (
              <GlassCard className="text-center py-8 border-dashed opacity-70">
                <p className="text-ink-500 text-sm italic">Endorse drafts to see them appear here once verified.</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {successfulPitches.slice(0, 5).map(pitch => (
                  <GlassCard key={pitch.id} className="opacity-90 border-l-4 border-l-teal">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-ink-900 text-sm">{pitch.student.user.name}</h3>
                      <Badge variant="verified" className="text-[10px]">Score: {pitch.industryScore}</Badge>
                    </div>
                    <p className="text-xs font-medium text-ink-700 truncate">{pitch.problem.title}</p>
                    <p className="text-xs text-ink-500 mt-2 truncate text-ellipsis">Industry: {pitch.problem.industry.companyName}</p>
                  </GlassCard>
                ))}
                {successfulPitches.length > 5 && (
                  <p className="text-center text-xs text-ink-500 font-medium pt-2">+{successfulPitches.length - 5} more</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
