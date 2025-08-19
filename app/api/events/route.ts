import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAuth } from '@/src/lib/auth';
import { z } from 'zod';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        judges: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            registrations: true,
            teams: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

const createEventSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).default('ONLINE'),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    theme: z.string().optional(),
    rules: z.string().optional(),
    prizes: z.string().optional(),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'End date must be after the start date',
    path: ['endAt'],
  });

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In the new model, any user can create events (become organizers)
    const body = await request.json();
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { title, description, startAt, endAt, mode, ...otherData } = validation.data;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        mode,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        organizerId: user.id,
        ...otherData,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}