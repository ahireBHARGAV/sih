import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { role } = await getSession();
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedSkill = await prisma.skill.update({
      where: { id: params.id },
      data: {
        name: body.name,
        category: body.category
      }
    });

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { role } = await getSession();
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: params.id },
      include: {
        studentSkills: true,
        requirements: true,
        opportunitySkills: true,
        problems: true,
      }
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Do not allow deleting a skill if it is in use
    if (
      skill.studentSkills.length > 0 ||
      skill.requirements.length > 0 ||
      skill.opportunitySkills.length > 0 ||
      skill.problems.length > 0
    ) {
      return NextResponse.json({ error: "Cannot delete skill that is currently in use" }, { status: 400 });
    }

    await prisma.skill.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
