"use client";

import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";

export function StudyLottie() {
  return (
    <div className="absolute -bottom-16 -right-16 w-80 h-80 opacity-90 pointer-events-none mix-blend-multiply">
      <Player
        autoplay
        loop
        src="/lottie/study-discussion.json"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
