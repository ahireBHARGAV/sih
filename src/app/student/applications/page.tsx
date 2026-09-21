import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function StudentApplicationsPage() {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    redirect("/");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!student) redirect("/");

  const applications = await prisma.application.findMany({
    where: { studentId: student.id },
    include: {
      opportunity: { include: { industry: true } }
    },
    orderBy: { appliedAt: 'desc' }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Opportunities", href: "/student/opportunities" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">My Applications</h1>
        <p className="text-ink-600 mb-8">Track the status of your internships and jobs.</p>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <GlassCard>
              <p className="text-ink-600">You haven&apos;t applied to any opportunities yet.</p>
            </GlassCard>
          ) : (
            applications.map(app => (
              <GlassCard key={app.id} className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-display font-semibold text-ink-900 mb-1">{app.opportunity.title}</h2>
                  <p className="text-sm font-medium text-ink-900 mb-2">{app.opportunity.industry.companyName}</p>
                  <p className="text-sm text-ink-600">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant={
                      app.stage === 'SELECTED' ? 'industryVerified' :
                      app.stage === 'SHORTLISTED' ? 'verified' :
                      app.stage === 'REJECTED' ? 'destructive' :
                      'default'
                    }
                    className={app.stage === 'APPLIED' ? 'bg-white/60 text-ink-600 border-glass-border' : ''}
                  >
                    {app.stage}
                  </Badge>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
