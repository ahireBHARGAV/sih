import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';

export async function PATCH(request: Request) {
  try {
    const { role, userId } = await getSession();
    if (role !== 'MENTOR' || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { available } = body;

    const mentor = await prisma.mentorProfile.update({
      where: { userId },
      data: { available }
    });

    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
