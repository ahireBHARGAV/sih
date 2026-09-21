import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VerificationState } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, skillId, score } = body;

    if (!studentId || !skillId || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert the student skill
    const studentSkill = await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId,
          skillId
        }
      },
      update: {
        proficiencyScore: score,
        state: VerificationState.UNVERIFIED
      },
      create: {
        studentId,
        skillId,
        proficiencyScore: score,
        state: VerificationState.UNVERIFIED
      }
    });

    return NextResponse.json(studentSkill);
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
