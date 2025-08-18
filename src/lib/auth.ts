import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/src/lib/prisma";

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  const name = `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim() || clerkUser?.username || email || userId;
  const dbUser = await prisma.user.upsert({
    where: { id: userId },
    update: { email: email ?? `${userId}@example.local`, name },
    create: { id: userId, email: email ?? `${userId}@example.local`, name },
  });
  return dbUser;
}

export async function requireRole(roles: Array<"ORGANIZER" | "JUDGE" | "PARTICIPANT">) {
  const user = await requireAuth();
  if (!user) return null;
  const role = (user.role || "PARTICIPANT").toUpperCase() as "ORGANIZER" | "JUDGE" | "PARTICIPANT";
  if (!roles.includes(role)) return null;
  return user;
}
