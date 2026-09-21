"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PitchProblemForm({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pitchText, setPitchText] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, pitchText }),
      });

      if (res.ok) {
        alert("Pitch submitted successfully!");
        router.refresh();
      } else {
        alert("Failed to submit pitch.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-glass-border pt-4">
      <label className="block text-sm font-semibold text-ink-900 mb-2">Your Pitch</label>
      <textarea 
        required 
        rows={3}
        value={pitchText}
        onChange={(e) => setPitchText(e.target.value)}
        className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 resize-none mb-3"
        placeholder="Why are you the right fit to solve this problem?"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Pitch"}
        </Button>
      </div>
    </form>
  );
}
