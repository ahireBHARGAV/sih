import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/app/actions';
import { ProblemStatus } from '@prisma/client';

export async function POST(request: Request) {
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

    // "Nothing goes live until verified" business rule
    // But they can create it in DRAFT or UNDER_VERIFICATION
    
    const body = await request.json();
    const { title, problemStatement, deliverable, rubric, reviewerId, reviewTurnaroundDays, skillId } = body;

    if (!title || !problemStatement || !deliverable || !rubric || !reviewerId || !skillId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Let's create it as DRAFT. If they want to submit for verification they can update it.
    // Or we can just set it to UNDER_VERIFICATION directly for MVP to save clicks.
    // Spec says: "industry creates a Problem (status: DRAFT)"
    
    const problem = await prisma.problem.create({
      data: {
        industryId: industry.id,
        title,
        problemStatement,
        deliverable,
        rubric,
        reviewerId,
        reviewTurnaroundDays: Number(reviewTurnaroundDays) || 3,
        skillId,
        status: ProblemStatus.DRAFT
      }
    });

    return NextResponse.json(problem);
  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
