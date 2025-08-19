import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

// List invites for current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const invites = await prisma.teamInvite.findMany({
      where: { inviteeId: userId, status: 'PENDING' },
      include: { Team: { select: { id: true, name: true, event: { select: { id: true, title: true } } } } },
      orderBy: { id: 'desc' },
    });
    const shaped = invites.map((inv) => ({
      ...inv,
      team: inv.Team,
    }));
    return NextResponse.json({ success: true, data: shaped });
  } catch (e) {
    console.error('Error listing my invites:', e);
    return NextResponse.json({ error: 'Failed to list invites' }, { status: 500 });
  }
}

const respondSchema = z.object({ inviteId: z.string().min(1), action: z.enum(['ACCEPT', 'DECLINE']) });

// Respond to an invite
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = respondSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });

    const invite = await prisma.teamInvite.findUnique({ where: { id: validation.data.inviteId }, include: { Team: true } });
    if (!invite || invite.inviteeId !== userId) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    if (invite.status !== 'PENDING') return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });

    if (validation.data.action === 'DECLINE') {
      await prisma.teamInvite.update({ where: { id: invite.id }, data: { status: 'DECLINED' } });
      return NextResponse.json({ success: true, message: 'Invite declined' });
    }

    // ACCEPT: connect user to team members and set accepted
    await prisma.$transaction([
      prisma.teamInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } }),
      prisma.team.update({ where: { id: invite.teamId! }, data: { members: { connect: { id: userId } } } }),
    ]);

    return NextResponse.json({ success: true, message: 'Invite accepted' });
  } catch (e) {
    console.error('Error responding to invite:', e);
    return NextResponse.json({ error: 'Failed to respond to invite' }, { status: 500 });
  }
}


