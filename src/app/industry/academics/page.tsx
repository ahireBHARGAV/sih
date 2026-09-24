import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";

export default function IndustryAcademicsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Industry" items={[
        { label: "Dashboard", href: "/industry" },
        { label: "Hiring", href: "/industry/hiring" },
        { label: "Pipeline", href: "/industry/pipeline" },
        { label: "Academics", href: "/industry/academics", isActive: true }
      ]} />
      <main className="flex-1 container mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-8">Academics Integration</h1>
        <GlassCard className="p-6">
          <p className="text-ink-600">University partnerships and curriculum design tools will appear here.</p>
        </GlassCard>
      </main>
    </div>
  );
}
