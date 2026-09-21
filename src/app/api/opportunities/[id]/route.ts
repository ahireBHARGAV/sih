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

    const opp = await prisma.opportunity.findUnique({ where: { id: params.id } });
    if (!opp || opp.industryId !== industry.id) {
      return NextResponse.json({ error: "Opportunity not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const updatedOpp = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        location: body.location,
        status: body.status,
      }
    });

    return NextResponse.json(updatedOpp);
  } catch (error) {
    console.error("Error updating opportunity:", error);
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

    const opp = await prisma.opportunity.findUnique({ 
      where: { id: params.id },
      include: { applications: true }
    });
    
    if (!opp || opp.industryId !== industry.id) {
      return NextResponse.json({ error: "Opportunity not found or unauthorized" }, { status: 404 });
    }

    // Spec: industry removes their own posting (we should also delete related OpportunitySkills)
    await prisma.$transaction(async (tx) => {
      await tx.opportunitySkill.deleteMany({ where: { opportunityId: opp.id } });
      await tx.application.deleteMany({ where: { opportunityId: opp.id } });
      await tx.opportunity.delete({ where: { id: opp.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
