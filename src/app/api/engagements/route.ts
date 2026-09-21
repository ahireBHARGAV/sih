import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { facultyId, type, title } = body;

    if (!facultyId || !type || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const engagement = await prisma.facultyEngagement.create({
      data: {
        facultyId,
        type,
        title,
        status: "OPEN"
      }
    });

    return NextResponse.json(engagement, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
