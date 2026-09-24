import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';

export async function POST() {
  try {
    const { role, userId } = await getSession();
    if (role !== 'ACADEMICIAN' || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId }
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
    }

    // Upsert the MentorProfile, linking it to the same user and institution
    const mentor = await prisma.mentorProfile.upsert({
      where: { userId },
      update: {
        institutionId: faculty.institutionId,
        expertiseTags: faculty.expertiseTags
      },
      create: {
        userId: faculty.userId,
        expertiseTags: faculty.expertiseTags,
        tier: 'ACADEMIC',
        verified: true,
        institutionId: faculty.institutionId
      }
    });

    return NextResponse.json(mentor);
  } catch (error) {
    console.error('Error becoming mentor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
