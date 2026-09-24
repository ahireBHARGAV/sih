"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MentorMessage } from "@prisma/client";

export function MentorMessageThread({
  pitchId,
  messages,
  currentUserRole,
  canReply
}: {
  pitchId: string;
  messages: MentorMessage[];
  currentUserRole: "STUDENT" | "MENTOR";
  canReply: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setIsSending(true);

    try {
      const res = await fetch(`/api/pitches/${pitchId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        setContent("");
        router.refresh();
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <p className="text-sm text-ink-500 italic text-center py-4">No messages yet.</p>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderRole === currentUserRole;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white border border-glass-border text-ink-900 rounded-bl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-ink-500'}`}>
                    {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canReply && (
        <div className="flex gap-2 shrink-0">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-[120px] rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            rows={2}
          />
          <Button onClick={handleSend} disabled={isSending || !content.trim()} className="self-end">
            {isSending ? "..." : "Send"}
          </Button>
        </div>
      )}
    </div>
  );
}
