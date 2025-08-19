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

// Check if user is organizer of a specific event
export async function requireEventOrganizer(eventId: string) {
  const user = await requireAuth();
  if (!user) return null;
  
  const event = await prisma.event.findFirst({
    where: { 
      id: eventId,
      organizerId: user.id 
    }
  });
  
  if (!event) return null;
  return { user, event };
}

// Check if user is judge for a specific event
export async function requireEventJudge(eventId: string) {
  const user = await requireAuth();
  if (!user) return null;
  
  const event = await prisma.event.findFirst({
    where: { 
      id: eventId,
      judges: {
        some: { id: user.id }
      }
    }
  });
  
  if (!event) return null;
  return { user, event };
}

// Check if user is organizer OR judge for a specific event
export async function requireEventStaff(eventId: string) {
  const user = await requireAuth();
  if (!user) return null;
  
  const event = await prisma.event.findFirst({
    where: { 
      id: eventId,
      OR: [
        { organizerId: user.id },
        { judges: { some: { id: user.id } } }
      ]
    }
  });
  
  if (!event) return null;
  return { user, event };
}

// Get user's role for a specific event
export async function getUserEventRole(eventId: string, userId?: string) {
  const user = userId ? { id: userId } : await requireAuth();
  if (!user) return null;
  
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      judges: { where: { id: user.id } }
    }
  });
  
  if (!event) return null;
  
  if (event.organizerId === user.id) return 'ORGANIZER';
  if (event.judges.length > 0) return 'JUDGE';
  return 'PARTICIPANT';
}
