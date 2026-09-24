"use client";

import React, { useRef, useState, useTransition } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { User, CheckCircle, Circle, Plus, Loader2 } from "lucide-react";

interface SkillItem {
  skillId: string;
  name: string;
  state: string;
}

interface AvailableSkill {
  id: string;
  name: string;
}

interface MetallicSkillCardProps {
  name: string;
  level: string;
  targetRole: string | null;
  xp: number;
  skills: SkillItem[];
  availableSkills?: AvailableSkill[];
  onAddSkill?: (skillId: string) => Promise<void>;
  onRemoveSkill?: (skillId: string) => Promise<void>;
}

export function MetallicSkillCard({
  name,

  targetRole,
  xp,
  skills,
  availableSkills,
  onAddSkill,
  onRemoveSkill,
}: MetallicSkillCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val || !onAddSkill) return;
    
    setIsAdding(false);
    startTransition(async () => {
      await onAddSkill(val);
    });
  };

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-[1000px] w-full max-w-2xl my-8 mx-auto">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full rounded-2xl p-8 shadow-2xl overflow-hidden cursor-pointer"
      >
        {/* Metallic Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 via-zinc-100 to-zinc-400 opacity-95 z-0 border-2 border-white/50 rounded-2xl" />
        
        {/* Dynamic Glare Effect */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 50%)",
            backgroundSize: "200% 200%",
            x: glareX,
            y: glareY,
            mixBlendMode: "overlay",
          }}
        />

        {/* Content */}
        <div className="relative z-20 flex flex-col gap-6 transform-gpu" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-zinc-200 shadow-inner">
                <User className="w-8 h-8 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-3xl font-display font-bold tracking-tight text-zinc-900 drop-shadow-sm">{name}</h3>
                <p className="text-sm font-semibold text-zinc-600 tracking-wide uppercase">
                  {targetRole || "Student"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-display font-black text-zinc-800 flex items-center justify-end gap-1">
                {xp} <span className="text-base font-semibold text-zinc-600">XP</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-400/40 pt-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Skill Passport</h4>
            <div className="flex flex-wrap gap-2 items-center">
              {skills.length > 0 ? skills.map((skill) => (
                <div 
                  key={skill.skillId} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
                    ["MENTOR_ENDORSED", "VERIFIED", "INDUSTRY_VERIFIED"].includes(skill.state)
                      ? "bg-zinc-800 text-zinc-100 border-zinc-700" 
                      : "bg-white text-zinc-600 border-zinc-300"
                  }`}
                >
                  {["MENTOR_ENDORSED", "VERIFIED", "INDUSTRY_VERIFIED"].includes(skill.state) ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 opacity-40 text-zinc-500" />
                  )}
                  {skill.name}
                  {onRemoveSkill && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startTransition(async () => {
                          await onRemoveSkill(skill.skillId);
                        });
                      }}
                      className="ml-1 opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
                      title="Remove skill"
                      disabled={isPending}
                    >
                      ×
                    </button>
                  )}
                </div>
              )) : (
                <div className="text-sm font-medium text-zinc-500 italic">No skills added yet.</div>
              )}

              {availableSkills && availableSkills.length > 0 && (
                <div className="relative z-50">
                  {isAdding ? (
                    <select 
                      className="text-xs px-2 py-1.5 rounded-full border border-zinc-300 bg-white text-zinc-700 outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer shadow-sm"
                      onChange={handleAdd}
                      onBlur={() => setIsAdding(false)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    >
                      <option value="">Select a skill...</option>
                      {availableSkills.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                      disabled={isPending}
                      className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-zinc-400 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer bg-white/50"
                      title="Add Mentioned Skill"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
