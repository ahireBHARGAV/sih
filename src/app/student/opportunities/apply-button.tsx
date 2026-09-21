"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ApplyButton({ 
  studentId, 
  opportunityId, 
  hasApplied 
}: { 
  studentId: string; 
  opportunityId: string; 
  hasApplied: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (hasApplied) {
    return <Button disabled variant="secondary" className="opacity-50">Applied</Button>;
  }

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, opportunityId })
      });

      if (!res.ok) throw new Error("Failed to apply");

      router.refresh();
      router.push("/student/applications");
    } catch (error) {
      console.error(error);
      alert("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleApply} disabled={loading}>
      {loading ? "Applying..." : "Apply Now"}
    </Button>
  );
}
