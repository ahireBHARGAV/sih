"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export async function loginAsRole(role: string) {
  const dbRole = role.toUpperCase() as UserRole;
  
  // Find a default user for this role to act as the session
  const user = await prisma.user.findFirst({
    where: { role: dbRole },
  });

  if (!user) {
    throw new Error(`No seeded user found for role ${role}`);
  }

  cookies().set("ascend_role", role, { secure: true, httpOnly: true });
  cookies().set("ascend_user_id", user.id, { secure: true, httpOnly: true });
  
  redirect(`/${role.toLowerCase()}`);
}

export async function getSession() {
  const role = cookies().get("ascend_role")?.value;
  const userId = cookies().get("ascend_user_id")?.value;
  return { role, userId };
}

export async function logout() {
  cookies().delete("ascend_role");
  cookies().delete("ascend_user_id");
  redirect("/");
}
