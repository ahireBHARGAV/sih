"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MentorReviewForm({ 
  pitchId, 
  existingFeedback 
}: { 
  pitchId: string; 
  existingFeedback: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(existingFeedback || "");

  const handleReview = async (approved: boolean) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/pitches/${pitchId}/mentor-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorFeedback: feedback, approved }),
      });

      if (res.ok) {
        alert(approved ? "Approved! Sent to industry." : "Changes requested.");
        router.refresh();
      } else {
        alert("Failed to submit review.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 border-t border-glass-border pt-4 mt-4">
      <h3 className="font-semibold text-ink-900 text-sm">Provide Feedback</h3>
      <textarea 
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 resize-none"
        placeholder="What should the student improve? If approving, write a brief endorsement..."
      />
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => handleReview(false)} disabled={isSubmitting || feedback.trim() === ""}>
          Request Changes
        </Button>
        <Button onClick={() => handleReview(true)} disabled={isSubmitting}>
          Approve & Submit to Industry
        </Button>
      </div>
    </div>
  );
}
