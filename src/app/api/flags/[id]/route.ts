import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { role } = await getSession();
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const flagId = params.id;
    const body = await request.json();
    const { status } = body;

    const flag = await prisma.adminFlag.update({
      where: { id: flagId },
      data: { status }
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error updating flag:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
