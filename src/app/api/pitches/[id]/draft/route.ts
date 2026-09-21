import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const pitchId = params.id;
    const body = await request.json();
    const { draftContent } = body;

    const pitch = await prisma.pitch.findUnique({
      where: { id: pitchId }
    });

    if (!pitch || pitch.studentId !== student.id) {
      return NextResponse.json({ error: 'Pitch not found or unauthorized' }, { status: 404 });
    }

    if (pitch.status !== 'CONFIRMED' && pitch.status !== 'DRAFT_WITH_MENTOR') {
      return NextResponse.json({ error: 'Cannot draft at this stage' }, { status: 400 });
    }

    const updatedPitch = await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        draftContent,
        status: 'DRAFT_WITH_MENTOR' // Move to draft with mentor so mentor can review it
      }
    });

    return NextResponse.json(updatedPitch);
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
