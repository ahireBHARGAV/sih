import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const { role } = await getSession();
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSkill = await prisma.skill.create({
      data: {
        name: body.name,
        category: body.category
      }
    });

    return NextResponse.json(newSkill);
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
