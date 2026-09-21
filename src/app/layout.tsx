import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "ASCEND",
  description: "Industry Connect Platform",
};

import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, sora.variable)}>
      <body className="antialiased min-h-screen relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
        <SmoothScrollProvider>
          {/* Background blobs */}
          <div className="fixed inset-0 z-[-1] pointer-events-none bg-background overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blob-orange rounded-full glow-blob" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blob-amber rounded-full glow-blob" style={{ animationDelay: '-7s' }} />
          </div>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
