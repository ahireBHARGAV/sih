"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PitchScoreForm({ pitchId }: { pitchId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      industryScore: Number(formData.get("industryScore")),
      industryRemarks: formData.get("industryRemarks"),
    };

    try {
      const res = await fetch(`/api/pitches/${pitchId}/score`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Pitch scored successfully! Student can now mint their certificate.");
        router.refresh();
      } else {
        alert("Failed to submit score.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleScore} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Final Score (0-100)</label>
        <Input 
          type="number" 
          name="industryScore" 
          required 
          min="0" 
          max="100" 
          className="w-32"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-2">Industry Remarks</label>
        <textarea 
          name="industryRemarks" 
          required 
          rows={3}
          className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 resize-none"
          placeholder="Final assessment of the student's deliverable..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Final Score"}
        </Button>
      </div>
    </form>
  );
}
