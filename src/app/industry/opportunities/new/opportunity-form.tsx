"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function OpportunityForm({ 
  industryId, 
  availableSkills 
}: { 
  industryId: string, 
  availableSkills: { id: string, name: string, category: string }[] 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<{id: string, name: string}[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherSkillName, setOtherSkillName] = useState("");

  const handleAddOther = () => {
    if (!otherSkillName.trim()) return;
    const newId = `custom-${otherSkillName.trim()}`;
    setCustomSkills([...customSkills, { id: newId, name: otherSkillName.trim() }]);
    setSelectedSkills([...selectedSkills, newId]);
    setOtherSkillName("");
    setShowOtherInput(false);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industryId,
          title: formData.get("title"),
          type: formData.get("type"),
          location: formData.get("location"),
          description: formData.get("description"),
          skillIds: selectedSkills
        })
      });
      
      if (!res.ok) throw new Error("Failed to create opportunity");
      
      router.push("/industry");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create opportunity.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">Job/Role Title *</label>
          <input 
            name="title"
            type="text" 
            required 
            placeholder="e.g. Frontend Developer Intern"
            className="w-full h-12 px-4 rounded-xl border border-glass-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">Type *</label>
          <select 
            name="type"
            required 
            className="w-full h-12 px-4 rounded-xl border border-glass-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="INTERNSHIP">Internship</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PROJECT">Project / Contract</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">Location</label>
          <input 
            name="location"
            type="text" 
            placeholder="e.g. Remote, Bangalore"
            className="w-full h-12 px-4 rounded-xl border border-glass-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Description</label>
        <textarea 
          name="description"
          rows={4}
          placeholder="Describe the opportunity..."
          className="w-full p-4 rounded-xl border border-glass-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-4">Required Skills</label>
        <div className="flex flex-wrap gap-2">
          {[...availableSkills, ...customSkills].map(skill => (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedSkills.includes(skill.id)
                  ? "bg-primary text-white border-primary"
                  : "bg-white/40 text-ink-600 border-glass-border hover:bg-white/60 hover:text-ink-900"
              }`}
            >
              {skill.name}
            </button>
          ))}
          
          {!showOtherInput ? (
            <button
              type="button"
              onClick={() => setShowOtherInput(true)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-ink-400 text-ink-600 hover:bg-white/60 transition-colors"
            >
              + Other
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={otherSkillName}
                onChange={(e) => setOtherSkillName(e.target.value)}
                placeholder="Skill name..."
                className="h-8 px-3 rounded-full border border-glass-border bg-white text-sm focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOther())}
                autoFocus
              />
              <button type="button" onClick={handleAddOther} className="px-3 py-1 bg-ink-900 text-white rounded-full text-sm">Add</button>
              <button type="button" onClick={() => setShowOtherInput(false)} className="px-3 py-1 bg-white text-ink-900 border border-glass-border rounded-full text-sm">Cancel</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Opportunity"}</Button>
      </div>
    </form>
  );
}
