"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export function MintCertificateButton({ pitchId }: { pitchId: string }) {
  const router = useRouter();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    setIsMinting(true);

    try {
      const res = await fetch(`/api/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitchId }),
      });

      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF5A1F", "#FDFBF8"]
        });
        alert("Certificate minted! Your skill is now INDUSTRY_VERIFIED.");
        router.refresh();
      } else {
        alert("Failed to mint certificate.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Button onClick={handleMint} disabled={isMinting}>
      {isMinting ? "Minting..." : "Mint Proof of Work"}
    </Button>
  );
}
