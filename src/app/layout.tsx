import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

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
    <html lang="en" className={cn("font-sans", inter.variable, jakarta.variable)}>
      <body className="antialiased min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-white">
        <SmoothScrollProvider>
          <div className="fixed inset-0 z-[-1] pointer-events-none bg-background" />

          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
