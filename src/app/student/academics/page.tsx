import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";

export default function StudentAcademicsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment" },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
        { label: "Academics", href: "/student/academics", isActive: true },
      ]} />
      <main className="flex-1 container mx-auto max-w-[1440px] px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-8">Academics Integration</h1>
        <GlassCard className="p-6">
          <p className="text-ink-600">University curricula and course alignment will appear here.</p>
        </GlassCard>
      </main>
    </div>
  );
}
