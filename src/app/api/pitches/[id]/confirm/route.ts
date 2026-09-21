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

    const pitch = await prisma.pitch.findUnique({
      where: { id: pitchId },
      include: { problem: true }
    });

    if (!pitch || pitch.problem.industryId !== industry.id) {
      return NextResponse.json({ error: 'Pitch not found or unauthorized' }, { status: 404 });
    }

    // Confirm pitch and assign the mentor (reviewer) from the problem
    const updatedPitch = await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        status: 'CONFIRMED',
        mentorId: pitch.problem.reviewerId
      }
    });

    return NextResponse.json(updatedPitch);
  } catch (error) {
    console.error('Error confirming pitch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
