import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { role, userId } = await getSession();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pitchId = params.id;
    const body = await request.json();
    const { content } = body;

    const pitch = await prisma.pitch.findUnique({
      where: { id: pitchId },
      include: { student: true, mentor: true }
    });

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    if (pitch.status !== 'DRAFT_WITH_MENTOR') {
      return NextResponse.json({ error: 'Cannot send messages at this stage' }, { status: 400 });
    }

    // Verify sender
    let senderRole = '';
    if (role === 'STUDENT' && pitch.student.userId === userId) {
      senderRole = 'STUDENT';
    } else if (role === 'MENTOR' && pitch.mentor?.userId === userId) {
      senderRole = 'MENTOR';
    } else {
      return NextResponse.json({ error: 'Unauthorized to send message on this pitch' }, { status: 403 });
    }

    const message = await prisma.mentorMessage.create({
      data: {
        pitchId,
        content,
        senderId: userId,
        senderRole
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error posting message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
