"use client";

import { useState } from "react";
import { GlassCard } from "./glass-card";
import { Badge } from "./badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, GraduationCap, Briefcase } from "lucide-react";
import Link from "next/link";

interface PitchData {
  id: string;
  status: string;
  problem: {
    title: string;
    skillId: string;
    industry: { companyName: string };
  };
}

interface SkillRoadmapCardProps {
  skill: {
    id: string;
    name: string;
    state: string; 
  };
  pitches: PitchData[];
}

export function SkillRoadmapCard({ skill, pitches }: SkillRoadmapCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Demo purpose override
  const isDemoVerified = ["Communication", "TypeScript", "React"].includes(skill.name);
  const effectiveState = isDemoVerified ? "INDUSTRY_VERIFIED" : skill.state;

  // Compute progress
  let progress = 0;
  if (effectiveState === "INDUSTRY_VERIFIED" || effectiveState === "VERIFIED") progress = 100;
  else if (effectiveState === "MENTOR_ENDORSED") progress = 66;
  else if (effectiveState === "UNVERIFIED") progress = 0; 

  // Mock certifications/courses
  const mockCourses = [
    { name: `Advanced ${skill.name} Patterns`, provider: "Coursera", completed: effectiveState === "VERIFIED" || effectiveState === "INDUSTRY_VERIFIED" }
  ];

  // Filter pitches related to this skill
  const relatedPitches = pitches.filter(p => p.problem.skillId === skill.id);
  const completedPitches = relatedPitches.filter(p => ['SCORED', 'PROOF_ISSUED', 'CONFIRMED', 'PITCHED'].includes(p.status));

  return (
    <GlassCard className="flex flex-col gap-4 overflow-hidden transition-all duration-300">
      {/* Header / collapsed state */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-2 w-full pr-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-display font-semibold text-ink-900 group-hover:text-primary transition-colors">
                {skill.name}
              </h3>
              {progress === 100 && (
                <Badge variant="industryVerified" className="text-[10px]">Verified</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-500">{progress}% Verified</span>
              <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-ink-200/50 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-orange-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Expanded state */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-4 border-t border-glass-border/50 flex flex-col gap-6"
          >
            
            {/* Industry Problem Statements (Proof of Completion) */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3 flex items-center gap-2">
                <Briefcase className="w-3 h-3" />
                Industry Problem Statements
              </h4>
              {completedPitches.length > 0 || isDemoVerified ? (
                <div className="flex flex-col gap-2">
                  {completedPitches.map(pitch => (
                    <div key={pitch.id} className="bg-white/40 border border-glass-border rounded-lg p-3 text-sm">
                      <div className="font-medium text-ink-900">{pitch.problem.title}</div>
                      <div className="text-ink-600 text-xs mt-1">Provided by: <span className="font-semibold">{pitch.problem.industry.companyName}</span></div>
                      <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Proof of Completion Verified
                      </div>
                    </div>
                  ))}
                  {isDemoVerified && completedPitches.length === 0 && (
                    <div className="bg-white/40 border border-glass-border rounded-lg p-3 text-sm">
                      <div className="font-medium text-ink-900">Build a Scalable {skill.name} Architecture</div>
                      <div className="text-ink-600 text-xs mt-1">Provided by: <span className="font-semibold">TechNova Solutions</span></div>
                      <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Proof of Completion Verified
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-ink-500 bg-white/40 border border-glass-border rounded-lg p-4 flex flex-col items-start gap-3">
                  <p>No problem statements completed for this skill yet.</p>
                  <Link href={`/student/problems?skillId=${skill.id}`} className="text-xs font-semibold bg-white text-ink-900 border border-glass-border px-4 py-2 rounded-md hover:bg-ink-100 transition-colors shadow-sm">
                    Find Problems to Solve
                  </Link>
                </div>
              )}
            </div>

            {/* Certifications / Courses */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3 flex items-center gap-2">
                <GraduationCap className="w-3 h-3" />
                Courses & Certifications
              </h4>
              <div className="flex flex-col gap-2">
                {mockCourses.map((course, idx) => (
                  <div key={idx} className="bg-white/40 border border-glass-border rounded-lg p-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink-900">{course.name}</div>
                      <div className="text-ink-600 text-xs mt-1">Provider: {course.provider}</div>
                    </div>
                    {course.completed ? (
                      <Badge variant="verified" className="text-[10px]">Completed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-ink-500 bg-white">Recommended</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
