import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get("skillId");
  
  try {
    const students = await prisma.studentProfile.findMany({
      where: {
        ...(skillId ? {
          skills: {
            some: {
              skillId,
              state: { in: ['VERIFIED', 'INDUSTRY_VERIFIED'] }
            }
          }
        } : {})
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        skills: {
          include: { skill: true }
        }
      }
    });

    return NextResponse.json(students);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
