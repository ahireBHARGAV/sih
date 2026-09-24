"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions";
import { revalidatePath } from "next/cache";

export async function addMentionedSkill(skillId: string) {
  const { role, userId } = await getSession();
  if (role !== "STUDENT" || !userId) {
    throw new Error("Unauthorized");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Check if skill already exists for student
  const existing = await prisma.studentSkill.findUnique({
    where: {
      studentId_skillId: {
        studentId: student.id,
        skillId: skillId,
      },
    },
  });

  if (!existing) {
    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        skillId,
        state: "UNVERIFIED",
      },
    });
  }

  revalidatePath("/student");
  revalidatePath("/student/passport");
}
