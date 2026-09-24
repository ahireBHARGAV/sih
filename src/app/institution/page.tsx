import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SkillDemandChart, FunnelChart } from "./charts";
import { AnimatedCounter } from "@/components/animated-counter";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function InstitutionPage() {
  const { role, userId } = await getSession();
  if (role !== "INSTITUTION" || !userId) {
    redirect("/");
  }

  const institution = await prisma.institutionProfile.findUnique({
    where: { userId }
  });

  if (!institution) redirect("/");

  // 1. Fetch Students & StudentSkills
  const students = await prisma.studentProfile.findMany({
    where: { institutionId: institution.id },
    include: {
      user: true,
      pitches: true,
      skills: { include: { skill: true } }
    },
    orderBy: { xp: 'desc' }
  });

  // --- A. SKILL DEVELOPMENT ---
  const skillGapCounts: Record<string, number> = {};
  students.forEach(student => {
    student.skills.forEach(s => {
      // Focus on skills that are not yet industry verified
      if (s.state !== 'INDUSTRY_VERIFIED') {
        skillGapCounts[s.skill.name] = (skillGapCounts[s.skill.name] || 0) + 1;
      }
    });
  });

  const skillGapData = Object.entries(skillGapCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5 unmet skills

  const suggestedProblems = skillGapData.slice(0, 3); // top 3 for suggestions

  // --- B. INTERNSHIP & PLACEMENT ---
  const applications = await prisma.application.findMany({
    where: {
      student: { institutionId: institution.id }
    },
    include: {
      opportunity: true
    }
  });

  // Internship Participation
  const internshipApps = applications.filter(a => a.opportunity.type === 'INTERNSHIP');
  const uniqueInterns = new Set(internshipApps.map(a => a.studentId)).size;
  const internshipRate = students.length > 0 ? Math.round((uniqueInterns / students.length) * 100) : 0;

  // Placement Progress (Jobs)
  const jobApps = applications.filter(a => a.opportunity.type === 'JOB');
  const jobFunnelCounts = jobApps.reduce((acc, curr) => {
    acc[curr.stage] = (acc[curr.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelData = [
    { stage: "APPLIED", count: jobFunnelCounts["APPLIED"] || 0 },
    { stage: "SHORTLISTED", count: jobFunnelCounts["SHORTLISTED"] || 0 },
    { stage: "SELECTED", count: jobFunnelCounts["SELECTED"] || 0 }
  ];

  // --- C. FACULTY ENGAGEMENT ---
  const facultyList = await prisma.facultyProfile.findMany({
    where: { institutionId: institution.id },
    include: { engagements: true }
  });
  
  const totalFdpConsultancy = facultyList.reduce((acc, f) => acc + f.engagements.length, 0);

  const institutionMentors = await prisma.mentorProfile.findMany({
    where: { institutionId: institution.id },
    include: { pitchesMentoring: true }
  });

  const totalMentorContributions = institutionMentors.reduce((acc, m) => acc + m.pitchesMentoring.length, 0);


  // --- D. ROSTER DATA ---
  let totalActivePitches = 0;
  let totalCertifications = 0;

  const rosterData = students.map(student => {
    const activePitches = student.pitches.filter(p => ['SUBMITTED_TO_INDUSTRY', 'PITCHED', 'DRAFT_WITH_MENTOR'].includes(p.status));
    const certs = student.pitches.filter(p => p.status === 'PROOF_ISSUED');
    
    totalActivePitches += activePitches.length;
    totalCertifications += certs.length;

    let highestStatus = "None";
    if (certs.length > 0) highestStatus = "Certified";
    else if (student.pitches.some(p => p.status === 'SCORED')) highestStatus = "Scored";
    else if (activePitches.some(p => p.status === 'SUBMITTED_TO_INDUSTRY')) highestStatus = "Under Industry Review";
    else if (activePitches.some(p => p.status === 'DRAFT_WITH_MENTOR')) highestStatus = "In Sandbox";
    else if (activePitches.some(p => p.status === 'PITCHED')) highestStatus = "Pending Mentor";

    return {
      id: student.id,
      name: student.user.name,
      xp: student.xp,
      highestStatus
    };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Institution" items={[
        { label: "Dashboard", href: "/institution", isActive: true }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">{institution.name}</h1>
        <p className="text-ink-600 mb-8">Monitor skill development, internship participation, placement progress, and faculty engagement.</p>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <GlassCard className="text-center py-6 px-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-600 mb-1">Registered Students</h3>
            <AnimatedCounter value={students.length} className="text-3xl font-display font-bold text-ink-900" />
          </GlassCard>
          <GlassCard className="text-center py-6 px-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-600 mb-1">Active Pitches</h3>
            <AnimatedCounter value={totalActivePitches} className="text-3xl font-display font-bold text-ink-900" />
          </GlassCard>
          <GlassCard className="text-center py-6 px-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-600 mb-1">Certifications Issued</h3>
            <AnimatedCounter value={totalCertifications} className="text-3xl font-display font-bold text-orange-500" />
          </GlassCard>
          <GlassCard className="text-center py-6 px-4 border-emerald-500/30 border-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 mb-1">Placed (Jobs)</h3>
            <AnimatedCounter value={jobFunnelCounts["SELECTED"] || 0} className="text-3xl font-display font-bold text-emerald-600" />
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECTION 1: Skill Development */}
          <GlassCard className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-display font-semibold text-ink-900 mb-1">Skill Development (Gaps)</h2>
              <p className="text-sm text-ink-600">Skills students are actively trying to build but haven&apos;t verified yet.</p>
            </div>
            <div className="flex-1">
              {skillGapData.length > 0 ? (
                <SkillDemandChart data={skillGapData} />
              ) : (
                <div className="h-48 flex items-center justify-center text-ink-400 text-sm italic">No skill gaps detected.</div>
              )}
            </div>
            {suggestedProblems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-glass-border">
                <h3 className="text-xs font-semibold text-ink-900 uppercase tracking-wider mb-2">Suggested Next Problems</h3>
                <p className="text-xs text-ink-600 mb-3">Reach out to industry partners to host problem statements on these topics:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedProblems.map(sp => (
                    <Badge key={sp.name} variant="outline" className="bg-white border-orange-200 text-orange-700">
                      {sp.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          <div className="flex flex-col gap-8">
            
            {/* SECTION 2 & 3: Internship & Placement Progress */}
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-display font-semibold text-ink-900 mb-1">Placement Progress (Jobs)</h2>
                <p className="text-sm text-ink-600">Application funnel for full-time roles.</p>
              </div>
              <div className="h-48">
                {jobApps.length > 0 ? (
                  <FunnelChart data={funnelData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-ink-400 text-sm italic">No job applications yet.</div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-glass-border">
                <h2 className="text-lg font-display font-semibold text-ink-900 mb-1">Internship Participation</h2>
                <div className="flex items-end gap-3 mt-2">
                  <span className="text-3xl font-display font-bold text-ink-900">{internshipRate}%</span>
                  <span className="text-sm text-ink-600 mb-1">of students applied to at least one internship.</span>
                </div>
              </div>
            </GlassCard>

            {/* SECTION 4: Faculty Engagement */}
            <GlassCard>
              <h2 className="text-xl font-display font-semibold text-ink-900 mb-1">Faculty Engagement</h2>
              <p className="text-sm text-ink-600 mb-4">How your faculty connects with the industry.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 p-3 rounded-md border border-glass-border">
                  <p className="text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1">FDP / Research</p>
                  <p className="text-2xl font-bold text-ink-900">{totalFdpConsultancy}</p>
                  <p className="text-xs text-ink-500 mt-1">Active engagements</p>
                </div>
                <div className="bg-white/40 p-3 rounded-md border border-glass-border relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-4 -mt-4" />
                  <p className="text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1 relative z-10">Mentoring</p>
                  <p className="text-2xl font-bold text-ink-900 relative z-10">{totalMentorContributions}</p>
                  <p className="text-xs text-ink-500 mt-1 relative z-10">Endorsements by {institutionMentors.length} mentors</p>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>

        {/* SECTION 5: Student Roster */}
        <div className="mt-12">
          <h2 className="text-xl font-display font-bold text-ink-900 mb-4">Student Roster</h2>
          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink-700">
                <thead className="bg-ink-50/50 text-ink-900 font-semibold border-b border-glass-border">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Total XP</th>
                    <th className="px-6 py-4">Highest Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {rosterData.map(student => (
                    <tr key={student.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-ink-900">{student.name}</td>
                      <td className="px-6 py-4 text-orange-600 font-semibold">{student.xp} XP</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ink-100 text-ink-800">
                          {student.highestStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {rosterData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-ink-500 italic">No students registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
