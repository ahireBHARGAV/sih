"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ResolveFlagButton({ flagId }: { flagId: string }) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);

    try {
      const res = await fetch(`/api/flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to resolve flag.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Button size="sm" onClick={handleResolve} disabled={isResolving}>
      {isResolving ? "Resolving..." : "Mark Resolved"}
    </Button>
  );
}
