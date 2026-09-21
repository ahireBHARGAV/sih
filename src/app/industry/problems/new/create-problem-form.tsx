"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateProblemForm({ 
  skills, 
  mentors 
}: { 
  skills: { id: string, name: string }[],
  mentors: { id: string, user: { name: string }, tier: string }[]
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      problemStatement: formData.get("problemStatement"),
      deliverable: formData.get("deliverable"),
      rubric: formData.get("rubric"),
      skillId: formData.get("skillId"),
      reviewerId: formData.get("reviewerId"),
      reviewTurnaroundDays: formData.get("reviewTurnaroundDays")
    };

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/industry");
        router.refresh();
      } else {
        alert("Failed to create problem.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Problem Title</label>
        <Input name="title" required placeholder="e.g. Build a specific component..." />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Target Skill</label>
        <select 
          name="skillId" 
          required 
          className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900"
        >
          <option value="">Select a skill</option>
          {skills.map(skill => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Problem Statement</label>
        <textarea 
          name="problemStatement" 
          required 
          rows={4}
          className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 resize-none"
          placeholder="Describe the context and what the student needs to solve..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Deliverable</label>
        <Input name="deliverable" required placeholder="e.g. GitHub Repository Link, PDF Report" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Evaluation Rubric</label>
        <textarea 
          name="rubric" 
          required 
          rows={3}
          className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 resize-none"
          placeholder="e.g. Code Quality: 40%, Performance: 30%, Tests: 30%"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-ink-900 mb-2">Named Reviewer (Mentor)</label>
          <select 
            name="reviewerId" 
            required 
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900"
          >
            <option value="">Select a mentor</option>
            {mentors.map(mentor => (
              <option key={mentor.id} value={mentor.id}>{mentor.user.name} ({mentor.tier})</option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-sm font-semibold text-ink-900 mb-2">Turnaround (Days)</label>
          <Input type="number" name="reviewTurnaroundDays" required min="1" max="14" defaultValue="3" />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Save as Draft"}
        </Button>
      </div>
    </form>
  );
}
