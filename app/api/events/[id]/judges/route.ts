import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function authorizeOrganizer(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  });
  if (!event) {
    return { success: false, error: 'Event not found', status: 404 };
  }
  if (event.organizerId !== userId) {
    return { success: false, error: 'Forbidden: You are not the organizer of this event', status: 403 };
  }
  return { success: true };
}

const judgeActionSchema = z.object({
  judgeId: z.string().min(1, 'judgeId is required'),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { id: eventId } = await context.params;
  const auth = await authorizeOrganizer(userId, eventId);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validation = judgeActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { judgeId } = validation.data;

    const judgeExists = await prisma.user.findUnique({ where: { id: judgeId } });
    if (!judgeExists) {
      return NextResponse.json({ error: 'User to be added as judge not found' }, { status: 404 });
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        judges: {
          connect: { id: judgeId },
        },
      },
      include: { 
        judges: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ success: true, data: event.judges });
  } catch (error: unknown) {
    console.error(`Error adding judge to event:`, error);
    return NextResponse.json({ error: 'Failed to add judge' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
  const { id: eventId } = await context.params;
  const auth = await authorizeOrganizer(userId, eventId);
        if (!auth.success) {
          return NextResponse.json({ error: auth.error }, { status: auth.status });
        }
    
        const body = await request.json();
        const validation = judgeActionSchema.safeParse(body);
    
        if (!validation.success) {
          return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
        }
    
        const { judgeId } = validation.data;

        await prisma.event.update({
          where: { id: eventId },
          data: {
            judges: {
              disconnect: { id: judgeId },
            },
          },
        });
    
        return NextResponse.json({ success: true, message: 'Judge removed successfully' });
      } catch (error: unknown) {
        console.error(`Error removing judge from event:`, error);
        return NextResponse.json({ error: 'Failed to remove judge' }, { status: 500 });
      }
}