"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Trash2, Edit2 } from "lucide-react";

type Skill = {
  id: string;
  name: string;
  category: string;
  _count: {
    studentSkills: number;
    requirements: number;
    opportunitySkills: number;
    problems: number;
  };
};

export function SkillsManager({ initialSkills }: { initialSkills: Skill[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("TECH");

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoadingId("new");
    try {
      if (editingId) {
        const res = await fetch(`/api/skills/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category }),
        });
        if (res.ok) {
          setName("");
          setCategory("TECH");
          setEditingId(null);
          router.refresh();
        } else {
          alert("Failed to update skill");
        }
      } else {
        const res = await fetch(`/api/skills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category }),
        });
        if (res.ok) {
          setName("");
          setCategory("TECH");
          router.refresh();
        } else {
          alert("Failed to create skill");
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingId(null);
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setName(skill.name);
    setCategory(skill.category);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Cannot delete skill");
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <GlassCard className="p-6">
          <h2 className="text-xl font-display font-bold text-ink-900 mb-4">{editingId ? 'Edit Skill' : 'Add New Skill'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-2">Skill Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/55 border border-glass-border rounded-xl px-4 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. React.js"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/55 border border-glass-border rounded-xl px-4 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="TECH">TECH</option>
                <option value="AYUSH_ALLIED">AYUSH_ALLIED</option>
                <option value="SOFT_SKILL">SOFT_SKILL</option>
              </select>
            </div>
            <Button type="submit" disabled={loadingId === "new"} className="mt-2 w-full">
              {editingId ? 'Save Changes' : 'Create Skill'}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setName(''); setCategory('TECH'); }}>
                Cancel Edit
              </Button>
            )}
          </form>
        </GlassCard>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-4">
        {initialSkills.map((s) => {
          const usageCount = s._count.studentSkills + s._count.requirements + s._count.opportunitySkills + s._count.problems;
          
          return (
            <GlassCard key={s.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-ink-900">{s.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                  <span className="text-xs text-ink-600 font-medium">Used in {usageCount} places</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" disabled={loadingId === s.id} onClick={() => handleEdit(s)}>
                  <Edit2 className="w-4 h-4 text-ink-600" />
                </Button>
                <Button variant="ghost" size="icon" disabled={loadingId === s.id || usageCount > 0} onClick={() => handleDelete(s.id)} className={usageCount > 0 ? "opacity-30 cursor-not-allowed" : "text-red-500 hover:text-red-600"}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
