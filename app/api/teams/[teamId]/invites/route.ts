import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{ teamId: string }>;
};

const inviteSchema = z.object({ inviteeId: z.string().min(1) });

async function authorizeOwner(teamId: string, userId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return { ok: false, status: 404, error: 'Team not found' } as const;
  if (team.ownerId !== userId) return { ok: false, status: 403, error: 'Only team owner can invite' } as const;
  return { ok: true, team } as const;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { teamId } = await context.params;
    const invites = await prisma.teamInvite.findMany({
      where: { teamId },
      include: {
        invitee: { select: { id: true, name: true, email: true, avatar: true } },
        Team: { select: { id: true, name: true, event: { select: { id: true, title: true } } } },
      },
      // TeamInvite doesn't have createdAt in schema; sort by id desc for recency
      orderBy: { id: 'desc' },
    });
    const shaped = invites.map((inv) => ({
      id: inv.id,
      teamId: inv.teamId,
      inviterId: inv.inviterId,
      inviteeId: inv.inviteeId,
      status: inv.status,
      invitee: inv.invitee,
      team: inv.Team,
    }));
    return NextResponse.json({ success: true, data: shaped });
  } catch (e) {
    console.error('Error listing invites:', e);
    return NextResponse.json({ error: 'Failed to list invites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { teamId } = await context.params;
    const authz = await authorizeOwner(teamId, userId);
    if (!authz.ok) return NextResponse.json({ error: authz.error }, { status: authz.status });

    const body = await request.json();
    const validation = inviteSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });

    // Ensure invitee is registered for the same event
    const team = await prisma.team.findUnique({ where: { id: teamId }, include: { event: true } });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    const registration = await prisma.registration.findUnique({ where: { eventId_userId: { eventId: team.eventId, userId: validation.data.inviteeId } } });
    if (!registration) return NextResponse.json({ error: 'Invitee must be registered for this event' }, { status: 400 });

    // If a pending invite already exists for same team/invitee, return it
    const existing = await prisma.teamInvite.findFirst({ where: { teamId, inviteeId: validation.data.inviteeId, status: 'PENDING' } });
    if (existing) {
      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    }

    const invite = await prisma.teamInvite.create({
      data: { teamId, inviterId: userId, inviteeId: validation.data.inviteeId, status: 'PENDING' },
    });
    return NextResponse.json({ success: true, data: invite }, { status: 201 });
  } catch (e) {
    console.error('Error creating invite:', e);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}


