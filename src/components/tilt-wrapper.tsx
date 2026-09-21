"use client";
import { useRef, useState } from "react";

export function TiltWrapper({ children, max = 6, className = "" }: { children: React.ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setStyle({ transform: `perspective(600px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`, transition: 'transform 0.1s ease-out' });
  };
  
  const onLeave = () => {
    setStyle({ transform: "perspective(600px) rotateX(0) rotateY(0)", transition: 'transform 0.3s ease-out' });
  };

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </div>
  );
}
