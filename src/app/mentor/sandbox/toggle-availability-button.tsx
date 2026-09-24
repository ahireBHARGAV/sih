"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export function ToggleAvailabilityButton({
  initialAvailable
}: {
  initialAvailable: boolean;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/mentor/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: checked })
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update availability.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-ink-700">
        {initialAvailable ? "Available for New Mentees" : "Taking a Break (Hidden)"}
      </span>
      <Switch 
        checked={initialAvailable} 
        onCheckedChange={handleToggle} 
        disabled={isUpdating}
      />
    </div>
  );
}
