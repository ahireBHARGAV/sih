import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const skills = await prisma.studentSkill.findMany({
      where: { studentId: params.id },
      include: {
        skill: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching student skills:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
