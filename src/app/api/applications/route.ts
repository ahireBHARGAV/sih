import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, opportunityId } = body;

    if (!studentId || !opportunityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure they haven't already applied
    const existing = await prisma.application.findFirst({
      where: {
        studentId,
        opportunityId
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        studentId,
        opportunityId,
        stage: "APPLIED"
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
