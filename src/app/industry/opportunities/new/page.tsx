import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OpportunityForm } from "./opportunity-form";

export const dynamic = 'force-dynamic';

export default async function NewOpportunityPage() {
  const { role, userId } = await getSession();
  if (role !== "INDUSTRY" || !userId) {
    redirect("/");
  }

  const industry = await prisma.industryProfile.findUnique({
    where: { userId }
  });

  if (!industry) redirect("/");

  // Fetch all skills so industry can select requirements
  const skills = await prisma.skill.findMany({
    orderBy: { category: 'asc' }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Industry" items={[
        { label: "Dashboard", href: "/industry" },
        { label: "Hiring", href: "/industry/hiring" },
        { label: "Pipeline", href: "/industry/pipeline" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Post New Opportunity</h1>
        <p className="text-ink-600 mb-8">Define your demand profile to attract verified talent.</p>
        
        <GlassCard>
          <OpportunityForm industryId={industry.id} availableSkills={skills} />
        </GlassCard>
      </main>
    </div>
  );
}
