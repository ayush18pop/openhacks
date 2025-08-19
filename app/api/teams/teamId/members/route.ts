import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

type RouteContext = {
  // Align with Next.js generated types: params is a Promise
  params: Promise<{
    teamId: string;
  }>;
};

async function authorizeOwnerAndGetEvent(userId: string, teamId:string) {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { event: { select: { startAt: true, id: true } } }
    });

    if (!team) {
        return { success: false, error: 'Team not found', status: 404 };
    }
    if (team.ownerId !== userId) {
        return { success: false, error: 'Forbidden: You are not the team owner', status: 403 };
    }
    if (new Date() > new Date(team.event.startAt)) {
        return { success: false, error: 'Cannot modify team members after the event has started.', status: 403 };
    }
    return { success: true, eventId: team.event.id };
}

const memberActionSchema = z.object({
  memberId: z.string().min(1, 'memberId is required'),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { teamId } = await context.params;
  const auth = await authorizeOwnerAndGetEvent(userId, teamId);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validation = memberActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { memberId } = validation.data;

    // Business Logic: Check if the user to be added is registered for the same event
    const registration = await prisma.registration.findFirst({
      where: { userId: memberId, eventId: auth.eventId },
    });
    if (!registration) {
      return NextResponse.json({ error: 'User must be registered for the event to join a team.' }, { status: 400 });
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          connect: { id: memberId },
        },
      },
      include: { members: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ success: true, data: team.members });
  } catch (error: unknown) {
    console.error(`Error adding member to team:`, error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}


// --- DELETE (Remove) a Member from a Team ---
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

  const { teamId } = await context.params;
  const auth = await authorizeOwnerAndGetEvent(userId, teamId);
        if (!auth.success) {
          return NextResponse.json({ error: auth.error }, { status: auth.status });
        }
    
        const body = await request.json();
        const validation = memberActionSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const { memberId } = validation.data;

        // Business Logic: The owner cannot remove themselves from the team
    const teamOwner = await prisma.team.findUnique({
      where: { id: teamId },
            select: { ownerId: true }
        });

        if (teamOwner?.ownerId === memberId) {
            return NextResponse.json({ error: 'Owner cannot be removed from the team. To leave, transfer ownership or delete the team.' }, { status: 400 });
        }

        await prisma.team.update({
          where: { id: teamId },
          data: {
            members: {
              disconnect: { id: memberId },
            },
          },
        });
    
        return NextResponse.json({ success: true, message: 'Member removed successfully' });
      } catch (error: unknown) {
        console.error(`Error removing member from team:`, error);
        return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
      }
}