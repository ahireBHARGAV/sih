import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { computeMatch } from '@/lib/gap-analysis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId parameter' }, { status: 400 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: {
        skills: {
          include: { skill: true }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Default to a sensible role if targetRole isn't set, for the demo
    const targetRole = student.targetRole || "Frontend Developer Intern";

    // 1. Fetch industry requirements for the target role
    const requirements = await prisma.industryRequirement.findMany({
      where: { roleTitle: { contains: targetRole, mode: 'insensitive' } },
      include: { skill: true }
    });

    // Deduplicate required skills
    const requiredSkillsMap = new Map();
    for (const req of requirements) {
      if (!requiredSkillsMap.has(req.skillId)) {
        requiredSkillsMap.set(req.skillId, req.skill);
      }
    }
    const requiredSkillIds = Array.from(requiredSkillsMap.keys());

    // 2. Compute match against student's verified skills
    const matchResult = computeMatch(
      requiredSkillIds,
      student.skills.map(s => ({ skillId: s.skillId, state: s.state }))
    );

    // 3. For the missing and developing skills, return the actual skill objects
    // so the frontend can display them on the roadmap.
    const missingSkills = matchResult.missing.map(id => requiredSkillsMap.get(id));
    const developingSkills = student.skills
      .filter(s => matchResult.developing > 0 && !["MENTOR_VERIFIED", "INDUSTRY_EVALUATED", "EXPERIENCE_VERIFIED"].includes(s.state))
      .map(s => s.skill);

    return NextResponse.json({
      targetRole,
      matchResult,
      missingSkills,
      developingSkills
    });

  } catch (error) {
    console.error('Error in gap analysis:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
