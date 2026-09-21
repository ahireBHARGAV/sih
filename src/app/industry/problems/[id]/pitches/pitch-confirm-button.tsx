"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PitchConfirmButton({ pitchId }: { pitchId: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      const res = await fetch(`/api/pitches/${pitchId}/confirm`, {
        method: "PATCH",
      });

      if (res.ok) {
        alert("Pitch confirmed! Student can now begin drafting.");
        router.refresh();
      } else {
        alert("Failed to confirm pitch.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Button size="sm" onClick={handleConfirm} disabled={isConfirming}>
      {isConfirming ? "Confirming..." : "Confirm & Assign Mentor"}
    </Button>
  );
}
