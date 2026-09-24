import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { industryId, title, type, location, description, skillIds } = body;

    if (!industryId || !title || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validSkillIds: string[] = [];
    for (const skillId of skillIds) {
      if (skillId.startsWith("custom-")) {
        const skillName = skillId.replace("custom-", "");
        let skill = await prisma.skill.findUnique({ where: { name: skillName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName, category: "TECH" } });
        }
        validSkillIds.push(skill.id);
      } else {
        validSkillIds.push(skillId);
      }
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        industryId,
        title,
        type,
        location: location || "",
        description: description || "",
        requiredSkills: {
          create: validSkillIds.map((id: string) => ({
            skillId: id,
          }))
        }
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
