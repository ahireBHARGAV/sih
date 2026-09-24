import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "./print-button";

export const dynamic = 'force-dynamic';

export default async function CertificatePage({ params }: { params: { id: string } }) {
  // This is a public route. No session check required to view it.
  
  const certificate = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: {
      pitch: {
        include: {
          student: { include: { user: true } },
          problem: { 
            include: { 
              industry: true,
              skill: true 
            } 
          },
          mentor: { include: { user: true } }
        }
      }
    }
  });

  if (!certificate) {
    notFound();
  }

  const { pitch } = certificate;
  const { student, problem, mentor } = pitch;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-4xl mb-8 flex justify-between items-center">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight text-ink-900">
          ASCEND
        </Link>
        <Badge variant="industryVerified" className="px-3 py-1 text-sm">
          Cryptographically Verified
        </Badge>
      </div>

      <GlassCard className="w-full max-w-4xl p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-4 tracking-tight">
            Certificate of Achievement
          </h1>
          <p className="text-xl text-ink-600">
            This certifies that
          </p>
          <h2 className="text-4xl font-display font-bold text-orange-600 mt-4 mb-8">
            {student.user.name}
          </h2>
          <p className="text-lg text-ink-900 max-w-2xl mx-auto leading-relaxed">
            has successfully completed the industry problem <span className="font-semibold text-ink-900">&quot;{problem.title}&quot;</span> provided by <span className="font-semibold text-ink-900">{problem.industry.companyName}</span>, demonstrating proficiency in <span className="font-semibold text-ink-900">{problem.skill.name}</span>.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-glass-border">
          <div className="text-center">
            <p className="text-sm text-ink-600 uppercase tracking-wider font-semibold mb-1">Mentor-endorsed by</p>
            <p className="text-lg font-semibold text-ink-900">{mentor?.user.name}</p>
            <p className="text-xs text-ink-600">{mentor?.tier} Mentor</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-ink-600 uppercase tracking-wider font-semibold mb-1">Industry-verified by</p>
            <p className="text-lg font-semibold text-ink-900">{problem.industry.companyName}</p>
            <p className="text-xs text-ink-600">Score: {pitch.industryScore}/100</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-ink-600 uppercase tracking-wider font-semibold mb-1">Issue Date</p>
            <p className="text-lg font-semibold text-ink-900">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="relative z-10 mt-12 bg-white/55 rounded-lg p-4 border border-glass-border flex flex-col md:flex-row items-center gap-4 text-left">
          <div className="h-16 w-16 bg-white/55 rounded-md border border-glass-border flex items-center justify-center shrink-0">
            {/* Mock QR Code space */}
            <div className="w-12 h-12 bg-ink-900" style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--bg-canvas) 25%, transparent 25%, transparent 75%, var(--bg-canvas) 75%, var(--bg-canvas)), repeating-linear-gradient(45deg, var(--bg-canvas) 25%, transparent 25%, transparent 75%, var(--bg-canvas) 75%, var(--bg-canvas))', backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px' }} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-ink-600 uppercase tracking-wider">Verification Hash</p>
            <p className="text-sm font-mono text-ink-900 truncate" title={certificate.signedHash}>
              {certificate.signedHash}
            </p>
            <p className="text-xs text-ink-600 mt-1">ID: {certificate.id}</p>
          </div>
        </div>
      </GlassCard>

      <div className="mt-8 flex gap-4">
        <PrintButton />
      </div>
    </div>
  );
}
