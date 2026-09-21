"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PitchDraftEditor({ 
  pitchId, 
  initialContent 
}: { 
  pitchId: string; 
  initialContent: string;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(initialContent || "");

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const res = await fetch(`/api/pitches/${pitchId}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftContent: content }),
      });

      if (res.ok) {
        alert("Draft saved and sent to mentor for review!");
        router.refresh();
      } else {
        alert("Failed to save draft.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ink-900 resize-none font-mono"
        placeholder="Draft your solution here... (e.g. Github links, design files, methodology)"
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || content.trim() === ""}>
          {isSaving ? "Saving..." : "Submit to Mentor"}
        </Button>
      </div>
    </div>
  );
}
