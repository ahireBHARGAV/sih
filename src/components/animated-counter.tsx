"use client";
import { useEffect, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export function AnimatedCounter({ value, className = "" }: { value: number; className?: string }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1200 }); // duration in ms doesn't exist directly for spring, we use damping/stiffness, but let's use default spring. Or we can use animation frame.
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => {
      setDisplay(Math.round(v));
    });
  }, [spring]);

  return <span className={className}>{display}</span>;
}
