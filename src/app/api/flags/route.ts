import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';
import { FlagType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    await getSession(); // Just to ensure session exists, though we aren't enforcing roles for MVP flags.
    // In a real app, any user could report something (USER_REPORT),
    // or system could auto-flag (SLA_BREACH).
    // For MVP, we'll allow anyone to submit a flag.
    
    const body = await request.json();
    const { type, relatedProblemId, relatedPitchId, note } = body;

    if (!type || !note) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const flag = await prisma.adminFlag.create({
      data: {
        type: type as FlagType,
        relatedProblemId,
        relatedPitchId,
        note
      }
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error creating flag:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
