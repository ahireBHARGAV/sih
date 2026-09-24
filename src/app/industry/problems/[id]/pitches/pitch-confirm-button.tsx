"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PitchConfirmButton({ 
  pitchId, 
  defaultMentorId, 
  mentors 
}: { 
  pitchId: string,
  defaultMentorId: string,
  mentors: { id: string, user: { name: string }, tier: string, activeMenteeCount: number, maxActiveMentees: number }[] 
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState(defaultMentorId);

  const sortedMentors = [...mentors].sort((a, b) => a.activeMenteeCount - b.activeMenteeCount);

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      const res = await fetch(`/api/pitches/${pitchId}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId: selectedMentorId })
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
    <div className="flex gap-2 items-center">
      <select 
        value={selectedMentorId}
        onChange={e => setSelectedMentorId(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs outline-none"
      >
        {sortedMentors.map(m => {
          const atCapacity = m.activeMenteeCount >= m.maxActiveMentees;
          return (
            <option key={m.id} value={m.id}>
              {m.user.name} ({m.tier}) {atCapacity ? " - ⚠️ At capacity" : ` - Load: ${m.activeMenteeCount}/${m.maxActiveMentees}`}
            </option>
          );
        })}
      </select>
      <Button size="sm" onClick={handleConfirm} disabled={isConfirming}>
        {isConfirming ? "Confirming..." : "Confirm & Assign"}
      </Button>
    </div>
  );
}
