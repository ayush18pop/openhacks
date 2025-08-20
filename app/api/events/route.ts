import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { requireAuth } from '../../../src/lib/auth';
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
const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
});

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).default('ONLINE'),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  theme: z.string().optional(),
  rules: z.string().optional(),
  prizes: z.string().optional(),
  // timeline can be an array of strings or raw string
  timeline: z.union([z.array(z.string()), z.string()]).optional(),
  // organizers can be supplied as array of emails/ids or raw string
  organizers: z.union([z.array(z.string()), z.string()]).optional(),
  // tracks can be provided as an array of strings or a raw string (JSON or newline-separated)
  tracks: z.union([z.array(z.string()), z.string()]).optional(),
  // Add thumbnail and banner fields, validated as URLs
  thumbnail: z.string().url().optional().nullable(),
  banner: z.string().url().optional().nullable(),
  // FAQs array
  faqs: z.array(faqSchema).optional().default([]),
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
    
    // The validated data now includes thumbnail, banner and optional tracks
    const eventData = validation.data as z.infer<typeof createEventSchema>;

    // Normalize tracks into JSON string for tracksJson DB column
    let tracksJson: string | undefined = undefined;
    if (eventData.tracks !== undefined) {
      const t = eventData.tracks;
      if (Array.isArray(t)) {
        tracksJson = JSON.stringify(t);
      } else if (typeof t === 'string') {
        try {
          const parsed = JSON.parse(t);
          if (Array.isArray(parsed)) tracksJson = JSON.stringify(parsed);
          else {
            const parts = t.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
            tracksJson = JSON.stringify(parts);
          }
        } catch {
          const parts = t.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
          tracksJson = JSON.stringify(parts);
        }
      }
    }

    // Normalize timeline into JSON string for timeline DB column
    let timelineJson: string | undefined = undefined;
    if (eventData.timeline !== undefined) {
      const t = eventData.timeline;
      if (Array.isArray(t)) timelineJson = JSON.stringify(t);
      else if (typeof t === 'string') {
        try {
          const parsed = JSON.parse(t);
          if (Array.isArray(parsed)) timelineJson = JSON.stringify(parsed);
          else {
            const parts = t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
            timelineJson = JSON.stringify(parts);
          }
        } catch {
          const parts = t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
          timelineJson = JSON.stringify(parts);
        }
      }
    }

    // Normalize organizers into JSON string for organizersJson DB column
    let organizersJson: string | undefined = undefined;
    if (eventData.organizers !== undefined) {
      const o = eventData.organizers;
      if (Array.isArray(o)) organizersJson = JSON.stringify(o);
      else if (typeof o === 'string') {
        try {
          const parsed = JSON.parse(o);
          if (Array.isArray(parsed)) organizersJson = JSON.stringify(parsed);
          else {
            const parts = o.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
            organizersJson = JSON.stringify(parts);
          }
        } catch {
          const parts = o.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
          organizersJson = JSON.stringify(parts);
        }
      }
    }

    const event = await prisma.$transaction(async (prisma) => {
      // First create the event
      const newEvent = await prisma.event.create({
        data: {
          title: eventData.title,
          description: eventData.description,
          mode: eventData.mode,
          theme: eventData.theme || null,
          startAt: new Date(eventData.startAt),
          endAt: new Date(eventData.endAt),
          rules: eventData.rules || null,
          prizes: eventData.prizes || null,
          tracksJson: tracksJson || null,
          timeline: timelineJson || null,
          organizersJson: organizersJson || null,
          thumbnail: eventData.thumbnail || null,
          banner: eventData.banner || null,
          organizerId: user.id, // Set the organizer
          // Include FAQ creation in the same transaction
          faqs: eventData.faqs && eventData.faqs.length > 0 ? {
            createMany: {
              data: eventData.faqs.map(faq => ({
                question: faq.question,
                answer: faq.answer
              }))
            }
          } : undefined,
        },
        include: {
          faqs: true // Include the created FAQs in the response
        }
      });

      return newEvent;
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}