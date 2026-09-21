import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { role, userId } = await getSession();
    if (role !== 'INDUSTRY' || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const industry = await prisma.industryProfile.findUnique({
      where: { userId }
    });

    if (!industry) {
      return NextResponse.json({ error: 'Industry profile not found' }, { status: 404 });
    }

    const pitchId = params.id;
    const body = await request.json();
    const { industryScore, industryRemarks } = body;

    if (industryScore === undefined || !industryRemarks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pitch = await prisma.pitch.findUnique({
      where: { id: pitchId },
      include: { problem: true }
    });

    if (!pitch || pitch.problem.industryId !== industry.id) {
      return NextResponse.json({ error: 'Pitch not found or unauthorized' }, { status: 404 });
    }

    if (pitch.status !== 'SUBMITTED_TO_INDUSTRY') {
      return NextResponse.json({ error: 'Cannot score at this stage' }, { status: 400 });
    }

    const updatedPitch = await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        industryScore: Number(industryScore),
        industryRemarks,
        status: 'SCORED',
        scoredAt: new Date()
      }
    });

    return NextResponse.json(updatedPitch);
  } catch (error) {
    console.error('Error scoring pitch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
