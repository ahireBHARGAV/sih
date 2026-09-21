"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  primary: "#1F3A5F",
  teal: "#0E9B8A",
  gold: "#D9A441",
  grey: "#8A93A6"
};

export function SkillDemandChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.grey }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: COLORS.grey }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(23,33,61,0.05)' }} 
            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.primary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelChart({ data }: { data: { stage: string; count: number }[] }) {
  // We can use a simple BarChart customized to look like a funnel, or just a vertical bar chart
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: COLORS.primary, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(23,33,61,0.05)' }} 
            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry, index) => {
              // Color ramp based on stage
              let color = COLORS.grey;
              if (entry.stage === 'APPLIED') color = COLORS.primary;
              if (entry.stage === 'SHORTLISTED') color = COLORS.gold;
              if (entry.stage === 'SELECTED') color = COLORS.teal;
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
