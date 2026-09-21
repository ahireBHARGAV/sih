import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { role, userId } = await getSession();
    if (role !== 'MENTOR' || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mentor = await prisma.mentorProfile.findUnique({
      where: { userId }
    });

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
    }

    const pitchId = params.id;
    const body = await request.json();
    const { mentorFeedback, approved } = body;

    const pitch = await prisma.pitch.findUnique({
      where: { id: pitchId }
    });

    if (!pitch || pitch.mentorId !== mentor.id) {
      return NextResponse.json({ error: 'Pitch not found or unauthorized' }, { status: 404 });
    }

    if (pitch.status !== 'DRAFT_WITH_MENTOR') {
      return NextResponse.json({ error: 'Cannot review at this stage' }, { status: 400 });
    }

    // Only mentor-approved work reaches industry.
    const updatedPitch = await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        mentorFeedback,
        status: approved ? 'SUBMITTED_TO_INDUSTRY' : 'CONFIRMED', // If not approved, goes back to CONFIRMED (sandbox draft mode)
        mentorApprovedAt: approved ? new Date() : null
      }
    });

    return NextResponse.json(updatedPitch);
  } catch (error) {
    console.error('Error in mentor review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
