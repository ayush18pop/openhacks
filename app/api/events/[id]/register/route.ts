import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAuth } from '@/src/lib/auth'; // <-- Use your custom auth function
import { Prisma } from '@prisma/client';

// A clearer type definition for the route context
type RouteContext = {
  params: {
    id: string; // Event ID
  };
};

// --- POST (Register) for an Event ---
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // This function now handles auth AND user syncing
    const dbUser = await requireAuth();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = context.params.id;

    const eventExists = await prisma.event.findUnique({ where: { id: eventId } });
    if (!eventExists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: dbUser.id, // Use the ID from the synced user
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'You are already registered for this event' }, { status: 409 });
    }

    const newRegistration = await prisma.registration.create({
      data: {
        eventId: eventId,
        userId: dbUser.id, // This is now guaranteed to exist in your User table
      },
    });

    return NextResponse.json({ success: true, data: newRegistration }, { status: 201 });
  } catch (error: unknown) {
    console.error(`Error registering user for event:`, error);
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
}

// --- DELETE (Unregister) from an Event ---
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const dbUser = await requireAuth();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = context.params.id;

    await prisma.registration.delete({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: dbUser.id,
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Successfully unregistered from the event' });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    console.error(`Error unregistering user from event:`, error);
    return NextResponse.json({ error: 'Failed to unregister from event' }, { status: 500 });
  }
}