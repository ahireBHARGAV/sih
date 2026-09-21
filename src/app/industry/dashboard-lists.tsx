"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type DashboardItem = {
  id: string;
  title: string;
  status: string;
  pitches?: { id: string }[];
};

export function DashboardLists({ problems, opportunities }: { problems: DashboardItem[], opportunities: DashboardItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/problems/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Cannot delete problem (might have active pitches)");
    } catch (e) {
      console.error(e);
    }
    setLoadingId(null);
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Failed to delete opportunity");
    } catch (e) {
      console.error(e);
    }
    setLoadingId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-display font-bold text-ink-900 mb-4">Manage Problems</h2>
        <div className="flex flex-col gap-4">
          {problems.map((p) => (
            <GlassCard key={p.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-ink-900">{p.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                  <span className="text-xs text-ink-600">{p.pitches?.length || 0} Pitches</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" disabled={loadingId === p.id} onClick={() => handleDeleteProblem(p.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
          {problems.length === 0 && <p className="text-ink-600 text-sm">No problems posted yet.</p>}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-display font-bold text-ink-900 mb-4">Manage Opportunities</h2>
        <div className="flex flex-col gap-4">
          {opportunities.map((o) => (
            <GlassCard key={o.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-ink-900">{o.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" disabled={loadingId === o.id} onClick={() => handleDeleteOpportunity(o.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
          {opportunities.length === 0 && <p className="text-ink-600 text-sm">No opportunities posted yet.</p>}
        </div>
      </div>
    </div>
  );
}
