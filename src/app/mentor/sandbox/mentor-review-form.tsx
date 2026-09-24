"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MentorReviewForm({ pitchId }: { pitchId: string; }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (approved: boolean) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/pitches/${pitchId}/mentor-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
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
    <div className="border-t border-glass-border pt-4 mt-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-ink-600">If the draft is ready for industry evaluation, approve it here.</p>
        <Button onClick={() => handleReview(true)} disabled={isSubmitting}>
          Approve & Submit to Industry
        </Button>
      </div>
    </div>
  );
}
