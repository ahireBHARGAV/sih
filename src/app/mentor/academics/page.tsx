import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";

export default function MentorAcademicsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Mentor" items={[
        { label: "Dashboard", href: "/mentor" },
        { label: "Sandbox", href: "/mentor/sandbox" },
        { label: "Academics", href: "/mentor/academics", isActive: true }
      ]} />
      <main className="flex-1 container mx-auto max-w-[1440px] px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-8">Academics Integration</h1>
        <GlassCard className="p-6">
          <p className="text-ink-600">Academic mentorship and curriculum feedback tools will appear here.</p>
        </GlassCard>
      </main>
    </div>
  );
}
