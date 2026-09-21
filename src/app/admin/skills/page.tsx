import { TopNav } from "@/components/ui/top-nav";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SkillsManager } from "./skills-manager";

export const dynamic = 'force-dynamic';

export default async function AdminSkills() {
  const { role, userId } = await getSession();
  if (role !== "ADMIN" || !userId) {
    redirect("/");
  }

  const skills = await prisma.skill.findMany({
    orderBy: { category: 'asc' },
    include: {
      _count: {
        select: {
          studentSkills: true,
          requirements: true,
          opportunitySkills: true,
          problems: true,
        }
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Admin" items={[
        { label: "Dashboard", href: "/admin" },
        { label: "Flags Queue", href: "/admin/queue/flags" },
        { label: "Manage Skills", href: "/admin/skills", isActive: true }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Manage Skills Taxonomy</h1>
        <p className="text-ink-600 mb-8">Add, edit, or remove skills from the platform&apos;s standard taxonomy.</p>

        <SkillsManager initialSkills={skills} />
      </main>
    </div>
  );
}
