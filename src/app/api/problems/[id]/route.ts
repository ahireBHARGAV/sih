import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { role, userId } = await getSession();
    if (role !== 'INDUSTRY' || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const industry = await prisma.industryProfile.findUnique({ where: { userId } });
    if (!industry) {
      return NextResponse.json({ error: "Industry profile not found" }, { status: 404 });
    }

    const problem = await prisma.problem.findUnique({ where: { id: params.id } });
    if (!problem || problem.industryId !== industry.id) {
      return NextResponse.json({ error: "Problem not found or unauthorized" }, { status: 404 });
    }

    if (problem.status !== "DRAFT") {
      return NextResponse.json({ error: "Can only edit problems in DRAFT status" }, { status: 400 });
    }

    const body = await request.json();
    const updatedProblem = await prisma.problem.update({
      where: { id: params.id },
      data: {
        title: body.title,
        problemStatement: body.problemStatement,
        deliverable: body.deliverable,
        rubric: body.rubric,
        skillId: body.skillId,
        reviewerId: body.reviewerId,
        reviewTurnaroundDays: body.reviewTurnaroundDays ? parseInt(body.reviewTurnaroundDays, 10) : undefined,
      }
    });

    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { role, userId } = await getSession();
    if (role !== 'INDUSTRY' || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const industry = await prisma.industryProfile.findUnique({ where: { userId } });
    if (!industry) {
      return NextResponse.json({ error: "Industry profile not found" }, { status: 404 });
    }

    const problem = await prisma.problem.findUnique({ 
      where: { id: params.id },
      include: { pitches: true }
    });
    
    if (!problem || problem.industryId !== industry.id) {
      return NextResponse.json({ error: "Problem not found or unauthorized" }, { status: 404 });
    }

    // Spec: industry removes, only while status = DRAFT or LIVE with no active pitches
    if (problem.status !== "DRAFT" && (problem.status !== "LIVE" || problem.pitches.length > 0)) {
      return NextResponse.json({ error: "Cannot delete problem that is actively being pitched or not DRAFT/LIVE" }, { status: 400 });
    }

    await prisma.problem.delete({ where: { id: problem.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
