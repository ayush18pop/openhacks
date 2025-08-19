import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Define a type for our route's context aligned with Next.js generated types
// See .next/types/... which expects: { params: Promise<SegmentParams> }
type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const baseEventSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().min(10, 'Description is required'),
    mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).default('ONLINE'),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    theme: z.string().optional(),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'End date must be after the start date',
    path: ['endAt'],
  });

const updateEventSchema = baseEventSchema.partial();

// --- GET a Single Event by ID ---
export async function GET(request: NextRequest, context: RouteContext) {
  try {
  const { id: eventId } = await context.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: { select: { id: true, name: true, avatar: true } },
        judges: { select: { id: true, name: true, avatar: true } },
        teams: true,
        registrations: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    // We cannot access context.params without awaiting; log without dereferencing
    console.error(`Error fetching event by id:`, error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// --- PUT (Update) an Event by ID ---
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
  const { id: eventId } = await context.params;
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not the organizer' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error(`Error updating event:`, error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// --- DELETE an Event by ID ---
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
  const { id: eventId } = await context.params;
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not the organizer' }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error(`Error deleting event:`, error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}