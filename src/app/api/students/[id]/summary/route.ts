import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: params.id },
      include: {
        user: true,
        skills: {
          include: { skill: true }
        },
        pitches: {
          where: { status: 'PITCHED' }
        },
        applications: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Calculate gap count - typically done dynamically but for summary we can 
    // fetch the industry requirements for their targetRole and compare.
    let gapCount = 0;
    if (student.targetRole) {
      const requirements = await prisma.industryRequirement.findMany({
        where: { roleTitle: student.targetRole },
        select: { skillId: true },
        distinct: ['skillId']
      });

      const requiredSkillIds = requirements.map(r => r.skillId);
      const verifiedStates = ["MENTOR_ENDORSED", "VERIFIED", "INDUSTRY_VERIFIED"];
      
      let verified = 0;
      for (const skillId of requiredSkillIds) {
        const studentSkill = student.skills.find(s => s.skillId === skillId);
        if (studentSkill && verifiedStates.includes(studentSkill.state)) {
          verified++;
        }
      }
      gapCount = requiredSkillIds.length - verified;
    }

    const summary = {
      xp: student.xp,
      level: student.level,
      gapCount,
      activeProblemsCount: student.pitches.length,
      matchedOpportunitiesCount: 3 // mock for now, implement properly in matching loop
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching student summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
