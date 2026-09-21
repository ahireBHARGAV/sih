import { ClosedLoopDiagram } from "@/components/closed-loop-diagram";
import { TopNav } from "@/components/ui/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, GraduationCap, Briefcase, Building2, Library, UserCheck } from "lucide-react";
import { loginAsRole } from "./actions";
import { ScrollReveal } from "@/components/scroll-reveal";

import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const [studentCount, industryCount, certificateCount] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.industryProfile.count(),
    prisma.certificate.count(),
  ]);

  const roles = [
    { title: "Student", roleId: "STUDENT", icon: <GraduationCap className="w-5 h-5" />, desc: "Build a verified skill passport." },
    { title: "Industry", roleId: "INDUSTRY", icon: <Briefcase className="w-5 h-5" />, desc: "Discover talent & define demand." },
    { title: "Institution", roleId: "INSTITUTION", icon: <Library className="w-5 h-5" />, desc: "Track placement & faculty." },
    { title: "Academician", roleId: "ACADEMICIAN", icon: <Building2 className="w-5 h-5" />, desc: "Engage in FDPs & consultancy." },
    { title: "Mentor", roleId: "MENTOR", icon: <UserCheck className="w-5 h-5" />, desc: "Evaluate student proof-of-work." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role="Platform" items={[]} />
      
      <main className="flex-1 container mx-auto max-w-7xl px-6 py-24">
        {/* Hero Section */}
        <ScrollReveal className="mb-24 flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-block px-3 py-1 rounded-full bg-white/55 border border-glass-border text-xs font-semibold uppercase tracking-wider text-ink-600">
              Industry Connect Engine
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-ink-900 leading-[1.1] tracking-tight">
              Bridge the gap between <span className="text-orange-500">skills</span> and <span className="text-ink-900">demand.</span>
            </h1>
            <p className="text-lg md:text-xl text-ink-600 max-w-2xl leading-relaxed">
              ASCEND is a transparent, verify-first ecosystem. Industry defines the requirements, students build proof-of-work, and mentors validate it—creating a seamless pipeline from campus to career.
            </p>
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="text-4xl font-display font-bold text-ink-900">{studentCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-600 mt-1">Students</div>
              </div>
              <div className="w-px bg-glass-border"></div>
              <div>
                <div className="text-4xl font-display font-bold text-ink-900">{industryCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-600 mt-1">Companies</div>
              </div>
              <div className="w-px bg-glass-border"></div>
              <div>
                <div className="text-4xl font-display font-bold text-ink-900">{certificateCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-600 mt-1">Certificates Issued</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Closed Loop Diagram */}
        <ScrollReveal className="mb-32">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-600 border-b border-glass-border pb-2 w-full">
              The ASCEND Loop
            </h2>
          </div>
          <GlassCard className="p-8">
            <ClosedLoopDiagram />
          </GlassCard>
        </ScrollReveal>

        {/* Role Picker */}
        <ScrollReveal className="max-w-4xl">
          <h2 className="text-3xl font-display font-bold text-ink-900 mb-8 tracking-tight">Select a Demo Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <form key={role.roleId} action={loginAsRole.bind(null, role.roleId)} className="block h-full group cursor-pointer">
                <button type="submit" className="w-full h-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[28px]">
                  <GlassCard className="h-full flex flex-col p-6 transition-colors hover:bg-white/55">
                    <div className="p-3 bg-white/55 w-fit rounded-xl mb-4 text-ink-900 group-hover:bg-primary group-hover:text-white transition-colors">
                      {role.icon}
                    </div>
                    <h3 className="text-xl font-display font-semibold text-ink-900 mb-2">{role.title}</h3>
                    <p className="text-sm text-ink-600 mb-6 flex-1">{role.desc}</p>
                    
                    <div className="flex items-center text-sm font-medium text-ink-900 group-hover:text-primary transition-colors">
                      Continue as {role.title} <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </GlassCard>
                </button>
              </form>
            ))}
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
