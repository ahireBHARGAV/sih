import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';
import { computeMatch } from '@/lib/gap-analysis';

export async function POST(request: Request) {
  try {
    const { role, userId } = await getSession();
    if (role !== 'STUDENT' || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { skills: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { problemId, pitchText } = body;

    if (!problemId || !pitchText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Compute match percentage dynamically for the pitch
    const match = computeMatch([problem.skillId], student.skills);
    const matchReason = `${match.verified}/${match.requiredCount} required skills verified`;

    const pitch = await prisma.pitch.create({
      data: {
        problemId,
        studentId: student.id,
        pitchText,
        matchPercentage: match.percentage,
        matchReason,
        status: 'PITCHED'
      }
    });

    return NextResponse.json(pitch);
  } catch (error) {
    console.error('Error creating pitch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
