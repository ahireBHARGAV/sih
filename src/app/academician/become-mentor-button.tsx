"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function BecomeMentorButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBecomeMentor = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/academician/become-mentor`, {
        method: "POST",
      });

      if (res.ok) {
        alert("You are now registered as an Institution Mentor!");
        router.refresh();
      } else {
        alert("Failed to register as mentor.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      className="w-full mt-4 flex items-center justify-center gap-2" 
      onClick={handleBecomeMentor} 
      disabled={isSubmitting}
    >
      <GraduationCap className="w-4 h-4" />
      {isSubmitting ? "Registering..." : "Become an Institution Mentor"}
    </Button>
  );
}
