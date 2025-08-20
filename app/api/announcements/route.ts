import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { z } from 'zod';
import { requireEventOrganizer } from '../../../src/lib/auth';

export const runtime = 'nodejs';

// Validate request body
const BodySchema = z.object({
  message: z.string().min(1, 'Message is required'),
  eventId: z.string().min(1, 'eventId is required'),
});

// Initialize Pusher server client
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid body', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, eventId } = parsed.data;

    // Ensure caller is the organizer of the event
    const ctx = await requireEventOrganizer(eventId);
    if (!ctx) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = {
      message,
      eventId,
      organizerId: ctx.user.id,
      timestamp: new Date().toISOString(),
    } as const;

    await pusher.trigger('announcements-channel', 'new-announcement', payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Announcements POST error:', err);
    return NextResponse.json({ error: 'Failed to send announcement' }, { status: 500 });
  }
}
