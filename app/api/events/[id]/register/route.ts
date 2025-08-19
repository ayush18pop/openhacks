import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

type RouteContext = {
  // Align with Next.js: params is a Promise of segment params
  params: Promise<{
    id: string; // Event ID
  }>;
};

// --- POST (Register) for an Event ---
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await context.params;

    // Check if the event exists
    const eventExists = await prisma.event.findUnique({ where: { id: eventId } });
    if (!eventExists) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user is already registered to prevent duplicates
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'You are already registered for this event' }, { status: 409 }); // 409 Conflict
    }

    // Create the new registration
    const newRegistration = await prisma.registration.create({
      data: {
        eventId: eventId,
        userId: userId,
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
        const { userId } = getAuth(request);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
    const { id: eventId } = await context.params;
    
        // Delete the registration record
        // The unique composite key ensures we delete the correct one
        await prisma.registration.delete({
          where: {
            eventId_userId: {
              eventId: eventId,
              userId: userId,
            },
          },
        });
    
        return NextResponse.json({ success: true, message: 'Successfully unregistered from the event' });
  } catch (error: unknown) {
    // Prisma throws a specific error code if the record to delete is not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    console.error(`Error unregistering user from event:`, error);
        return NextResponse.json({ error: 'Failed to unregister from event' }, { status: 500 });
    }
}