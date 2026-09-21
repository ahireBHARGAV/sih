import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { role, userId } = await getSession();
    if (role !== 'STUDENT' || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { pitchId } = body;

    if (!pitchId) {
      return NextResponse.json({ error: 'Missing pitchId' }, { status: 400 });
    }

    const pitch = await prisma.pitch.findUnique({
      where: { id: pitchId },
      include: { problem: true }
    });

    if (!pitch || pitch.studentId !== student.id) {
      return NextResponse.json({ error: 'Pitch not found or unauthorized' }, { status: 404 });
    }

    if (pitch.status !== 'SCORED') {
      return NextResponse.json({ error: 'Cannot mint certificate at this stage' }, { status: 400 });
    }

    // Generate a mock hash for the certificate
    const payload = `${pitch.id}-${student.id}-${pitch.industryScore}`;
    const signedHash = crypto.createHash('sha256').update(payload).digest('hex');

    // Perform operations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Certificate
      const cert = await tx.certificate.create({
        data: {
          pitchId: pitch.id,
          studentId: student.id,
          problemTitle: pitch.problem.title,
          signedHash,
          employabilityScoreAtIssue: student.employabilityScore,
        }
      });

      // 2. Update Pitch Status
      await tx.pitch.update({
        where: { id: pitch.id },
        data: { status: 'PROOF_ISSUED' }
      });

      // 3. Upgrade StudentSkill to INDUSTRY_VERIFIED and link evidence
      await tx.studentSkill.update({
        where: {
          studentId_skillId: {
            studentId: student.id,
            skillId: pitch.problem.skillId
          }
        },
        data: {
          state: 'INDUSTRY_VERIFIED',
          proficiencyScore: pitch.industryScore,
          evidenceRef: `/certificate/${cert.id}`
        }
      });

      // 4. Update Gamification (XP and Level) & Employability Score
      const newXp = student.xp + 100;
      const newLevelNum = Math.floor(newXp / 100) + 1; // Basic level formula: 1 level per 100 XP
      const newLevel = `Level ${newLevelNum}`;

      await tx.studentProfile.update({
        where: { id: student.id },
        data: {
          employabilityScore: { increment: 100 },
          xp: newXp,
          level: newLevel
        }
      });

      return cert;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error minting certificate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// NOTE: Do NOT add a DELETE endpoint for Certificates. 
// A certificate is a signed, immutable record of a verified achievement. 
// If it needs correction, it should undergo an AdminFlag review, not a silent deletion.
