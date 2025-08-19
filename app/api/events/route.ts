import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is in lib
import { requireAuth } from '@/lib/auth'; // Assuming auth helper is in lib
import { z } from 'zod';

// GET function remains the same, no changes needed here.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '9', 10), 50));
    const cursor = searchParams.get('cursor');
    const sortBy = searchParams.get('sortBy') || 'startAt';
    const order = searchParams.get('order') || 'asc';
    const mode = searchParams.get('mode');

    const whereClause: import('@prisma/client').Prisma.EventWhereInput = {};
    if (mode && ['ONLINE', 'OFFLINE', 'HYBRID'].includes(mode)) {
      whereClause.mode = mode;
    }

    // Fetch limit+1 items to check if there's a next page
    const events = await prisma.event.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: whereClause,
      orderBy: { [sortBy]: order },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { registrations: true, teams: true },
        },
      },
    });

    let nextCursor: string | null = null;
    let pageData = events;
    if (events.length > limit) {
      nextCursor = events[limit].id;
      pageData = events.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: pageData,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// --- Updated Zod Schema ---
const createEventSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).default('ONLINE'),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    theme: z.string().optional(),
    rules: z.string().optional(),
    prizes: z.string().optional(),
    // Add thumbnail and banner fields, validated as URLs
    thumbnail: z.string().url().optional().nullable(),
    banner: z.string().url().optional().nullable(),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'End date must be after the start date',
    path: ['endAt'],
  });

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(); // Assuming requireAuth returns the user object or throws
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    // The validated data now includes thumbnail and banner
    const eventData = validation.data;

    const newEvent = await prisma.event.create({
      data: {
        ...eventData,
        startAt: new Date(eventData.startAt),
        endAt: new Date(eventData.endAt),
        organizerId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}