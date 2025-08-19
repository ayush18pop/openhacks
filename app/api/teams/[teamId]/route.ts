import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

type RouteContext = {
  // Align with Next.js generated types: params is a Promise
  params: Promise<{
    teamId: string;
  }>;
};

// --- GET a Single Team by ID ---
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { teamId } = await context.params;
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true } },
        event: { select: { id: true, title: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error: unknown) {
    console.error(`Error fetching team:`, error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

// --- PUT (Update) a Team by ID ---
const updateTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters').max(50),
});

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { teamId } = await context.params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    if (team.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not the team owner' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateTeamSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { name: validation.data.name },
    });

    return NextResponse.json({ success: true, data: updatedTeam });
  } catch (error: unknown) {
    console.error(`Error updating team:`, error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

// --- DELETE a Team by ID (with business logic) ---
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
      const { userId } = getAuth(request);
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // Fetch the team and include its event details for the date check
      const { teamId } = await context.params;
      const team = await prisma.team.findUnique({ 
        where: { id: teamId },
        include: { event: { select: { startAt: true } } }
      });

      if (!team) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      if (team.ownerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You are not the team owner' }, { status: 403 });
      }
  
      // --- Business Logic Implementation ---
      // Check if the current time is past the event's start time
      if (new Date() > new Date(team.event.startAt)) {
        return NextResponse.json(
          { error: 'Cannot delete a team after the event has started.' }, 
          { status: 403 }
        );
      }

      // If the check passes, proceed with deletion
      await prisma.team.delete({ where: { id: teamId } });
  
      return NextResponse.json({ success: true, message: 'Team deleted successfully' });
    } catch (error: unknown) {
      console.error(`Error deleting team:`, error);
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
}