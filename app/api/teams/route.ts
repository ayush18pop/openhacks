import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

// GET /api/teams?eventId=evtId
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || undefined;

    const where: import('@prisma/client').Prisma.TeamWhereInput = {
      OR: [
        { ownerId: userId },
        { members: { some: { id: userId } } },
      ],
      ...(eventId ? { eventId } : {}),
    };

    const teams = await prisma.team.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error('Error listing teams:', error);
    return NextResponse.json({ error: 'Failed to list teams' }, { status: 500 });
  }
}

const createTeamSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(3).max(50),
});

// POST /api/teams
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createTeamSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { eventId, name } = validation.data;

    // Ensure user is registered for the event
    const registration = await prisma.registration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!registration) {
      return NextResponse.json({ error: 'You must register for the event before creating a team.' }, { status: 400 });
    }

    // Ensure owner doesn't already own a team for this event
    const existingOwnerTeam = await prisma.team.findFirst({
      where: { eventId, ownerId: userId },
    });
    if (existingOwnerTeam) {
      return NextResponse.json({ error: 'You already own a team for this event.' }, { status: 409 });
    }

    const team = await prisma.team.create({
      data: {
        name,
        eventId,
        ownerId: userId,
        members: { connect: { id: userId } },
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true } },
        event: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}


