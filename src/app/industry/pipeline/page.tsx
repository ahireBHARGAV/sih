import { TopNav } from "@/components/ui/top-nav";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PipelineKanban } from "./pipeline-kanban";

export const dynamic = 'force-dynamic';

export default async function IndustryPipelinePage() {
  const { role, userId } = await getSession();
  if (role !== "INDUSTRY" || !userId) {
    redirect("/");
  }

  const industry = await prisma.industryProfile.findUnique({
    where: { userId }
  });

  if (!industry) redirect("/");

  const applications = await prisma.application.findMany({
    where: {
      opportunity: { industryId: industry.id },
      stage: { not: "COMPLETED" } // hide completed for now
    },
    include: {
      student: { include: { user: true } },
      opportunity: true
    },
    orderBy: { appliedAt: 'desc' }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Industry" items={[
        { label: "Dashboard", href: "/industry" },
        { label: "Hiring", href: "/industry/hiring" },

        { label: "Pipeline", href: "/industry/pipeline", isActive: true }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Applicant Pipeline</h1>
        <p className="text-ink-600 mb-8">Manage incoming applications for your opportunities.</p>

        <PipelineKanban initialApplications={applications} />
      </main>
    </div>
  );
}
