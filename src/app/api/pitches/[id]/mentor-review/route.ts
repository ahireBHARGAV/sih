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
      where: { id: pitchId },
      include: { problem: true }
    });

    if (!pitch || pitch.mentorId !== mentor.id) {
      return NextResponse.json({ error: 'Pitch not found or unauthorized' }, { status: 404 });
    }

    if (pitch.status !== 'DRAFT_WITH_MENTOR') {
      return NextResponse.json({ error: 'Cannot review at this stage' }, { status: 400 });
    }

    // Only mentor-approved work reaches industry.
    if (approved) {
      await prisma.studentSkill.upsert({
        where: {
          studentId_skillId: {
            studentId: pitch.studentId,
            skillId: pitch.problem.skillId
          }
        },
        update: {
          state: 'MENTOR_ENDORSED',
          evidenceRef: pitch.id
        },
        create: {
          studentId: pitch.studentId,
          skillId: pitch.problem.skillId,
          state: 'MENTOR_ENDORSED',
          evidenceRef: pitch.id
        }
      });
    }

    const updatedPitch = await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        status: approved ? 'SUBMITTED_TO_INDUSTRY' : 'DRAFT_WITH_MENTOR',
        mentorApprovedAt: approved ? new Date() : null,
        messages: mentorFeedback ? {
          create: {
            content: mentorFeedback,
            senderId: userId,
            senderRole: 'MENTOR'
          }
        } : undefined
      }
    });

    return NextResponse.json(updatedPitch);
  } catch (error) {
    console.error('Error in mentor review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
