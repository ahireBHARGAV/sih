import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MentorDashboard() {
  const { role } = await getSession();
  if (role !== "MENTOR") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Mentor" items={[
        { label: "Dashboard", href: "/mentor", isActive: true },
        { label: "Sandbox", href: "/mentor/sandbox" }
      ]} />
      
      <main className="flex-1 container mx-auto max-w-[1440px] px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-8">Mentor Queue</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-display font-semibold text-ink-900 mb-2">Pending Reviews</h2>
            <p className="text-ink-600 text-sm">Evaluate student submissions.</p>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
