"use client";

import rough from "roughjs";
import { useEffect, useRef } from "react";

const STEPS = [
  "Industry Demand", "Skill Assessment", "Skill Gap", "Learn & Build",
  "Proof-of-Work", "Verification", "Verified Passport", "Match & Apply", "Outcome",
];

export function ClosedLoopDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    // Clear previous render
    svgRef.current.innerHTML = "";
    
    const rc = rough.svg(svgRef.current);
    const boxW = 140, boxH = 60, gapX = 40, y = 40;
    
    // Render twice for infinite marquee effect
    const loopSteps = [...STEPS, ...STEPS];
    
    loopSteps.forEach((label, i) => {
      const x = i * (boxW + gapX) + 10;
      const node = rc.rectangle(x, y, boxW, boxH, {
        stroke: "#111111", strokeWidth: 2, roughness: 1.5, fill: "#FF7A1A", fillStyle: "zigzag", fillWeight: 0.5,
      });
      svgRef.current!.appendChild(node);
      
      if (i < loopSteps.length - 1) {
        const arrow = rc.line(x + boxW + 5, y + boxH / 2, x + boxW + gapX - 5, y + boxH / 2, {
          stroke: "#111111", strokeWidth: 2, roughness: 2,
        });
        svgRef.current!.appendChild(arrow);
      }
    });
  }, []);

  const boxW = 140;
  const gapX = 40;
  const singleSetWidth = STEPS.length * (boxW + gapX);

  return (
    <div className="overflow-hidden pb-8 pt-4 w-full relative">
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${singleSetWidth}px); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="animate-marquee flex relative w-fit cursor-default">
        <svg ref={svgRef} width={singleSetWidth * 2 + 20} height={140} className="relative z-0 shrink-0" />
        <div className="absolute top-[40px] left-0 right-0 h-[60px] pointer-events-none z-10 flex w-max">
          {[...STEPS, ...STEPS].map((label, i) => (
            <div 
              key={`${label}-${i}`}
              className="flex items-center justify-center text-center font-display font-semibold text-[13px] text-charcoal shrink-0"
              style={{
                width: boxW,
                marginLeft: i === 0 ? 10 : gapX,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Fade gradients to make the edges blend smoothly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent" />
    </div>
  );
}
