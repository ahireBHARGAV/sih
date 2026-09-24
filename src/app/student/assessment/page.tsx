"use client";

import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentPage() {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const [skills, setSkills] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("/api/skills");
        if (res.ok) {
          const data = await res.json();
          setSkills(data);
        }
      } catch (e) {
        console.error("Failed to fetch skills", e);
      }
    };
    fetchSkills();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Hardcoded for demo: we just mock a successful submission
    alert("Skill assessed successfully! In a real app, this would update your passport.");
    setLoading(false);
    router.push("/student/passport");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Student" items={[
        { label: "Dashboard", href: "/student" },
        { label: "Assessment", href: "/student/assessment", isActive: true },
        { label: "Skill Passport", href: "/student/passport" },
        { label: "Roadmap", href: "/student/roadmap" },
        { label: "Problem Statements", href: "/student/problems" },
        { label: "Opportunities", href: "/student/opportunities" },
        { label: "Applications", href: "/student/applications" },
        { label: "Academics", href: "/student/academics" },
      ]} />
      
      <main className="flex-1 container mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">Self-Assessment</h1>
        <p className="text-ink-600 mb-8">Take a short quiz to evaluate your current proficiency and unlock targeted challenges.</p>
        
        <GlassCard>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-2">Select a skill to assess</label>
              <select 
                className="w-full h-12 px-4 rounded-xl border border-glass-border bg-white/55 focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                required
              >
                <option value="" disabled>Choose a skill...</option>
                {skills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="p-4 bg-white/40 rounded-xl border border-glass-border">
              <p className="text-sm text-ink-600 italic">
                Note: In the full version, selecting a skill launches a 10-minute dynamic quiz. For this demo, clicking submit will grant you an &apos;Assessed&apos; state with a mock score.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Start & Complete Assessment"}
            </Button>
          </form>
        </GlassCard>
      </main>
    </div>
  );
}
