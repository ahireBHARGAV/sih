"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ApplicationStage } from "@prisma/client";
import { useRouter } from "next/navigation";

type ApplicationData = {
  id: string;
  stage: ApplicationStage;
  student: {
    user: { name: string };
    institutionName: string;
    level: string;
  };
  opportunity: { title: string };
};

export function PipelineKanban({ initialApplications }: { initialApplications: ApplicationData[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const stages: ApplicationStage[] = ["APPLIED", "SHORTLISTED", "SELECTED", "REJECTED"];

  const handleStageChange = async (id: string, newStage: ApplicationStage) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage })
      });
      if (!res.ok) throw new Error("Failed to update");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update application stage.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
      {["APPLIED", "SHORTLISTED", "SELECTED"].map(stage => {
        const columnApps = initialApplications.filter(a => a.stage === stage);
        
        return (
          <div key={stage} className="flex-none w-80 snap-center">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-ink-900 tracking-wide uppercase text-sm">
                {stage}
              </h3>
              <Badge variant="default" className="bg-white/50 text-ink-600">{columnApps.length}</Badge>
            </div>
            
            <div className="flex flex-col gap-4">
              {columnApps.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-glass-border rounded-xl text-ink-400 text-sm">
                  Empty
                </div>
              ) : (
                columnApps.map(app => (
                  <GlassCard key={app.id} className={`p-4 ${loadingId === app.id ? 'opacity-50' : ''}`}>
                    <h4 className="font-semibold text-ink-900 mb-1">{app.student.user.name}</h4>
                    <p className="text-xs text-ink-600 mb-2">{app.student.institutionName} • Level {app.student.level}</p>
                    <p className="text-sm font-medium text-ink-900 mb-4">{app.opportunity.title}</p>
                    
                    <select
                      value={app.stage}
                      onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                      disabled={loadingId === app.id}
                      className="w-full text-xs px-2 py-1.5 rounded-lg border border-glass-border bg-white/50 focus:outline-none"
                    >
                      {stages.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
