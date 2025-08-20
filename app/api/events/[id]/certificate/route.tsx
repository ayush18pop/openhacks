import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requireAuth } from '../../../../../src/lib/auth';
import { join } from 'path';
import { promises as fs } from 'fs';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user and get user data
    const dbUser = await requireAuth();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get event ID from params
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        endAt: true,
        registrations: {
          where: { userId: dbUser.id },
          select: { id: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event has ended
    const eventEndDate = new Date(event.endAt);
    const currentDate = new Date();
    if (currentDate < eventEndDate) {
      return NextResponse.json(
        { error: 'Event has not ended yet' },
        { status: 400 }
      );
    }

    // Check if user is registered for the event
    if (event.registrations.length === 0) {
      return NextResponse.json(
        { error: 'You are not registered for this event' },
        { status: 403 }
      );
    }

    // Read the SVG template
    const templatePath = join(process.cwd(), 'public', 'certificate-template-new.svg');
    let svgTemplate = '';
    
    try {
      svgTemplate = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error('Error reading certificate template:', error);
      return NextResponse.json(
        { error: 'Certificate template not found' },
        { status: 500 }
      );
    }

    // Replace placeholders with actual data
    const participantName = dbUser.name || 'Participant';
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    svgTemplate = svgTemplate
      .replace(/\{\{PARTICIPANT_NAME\}\}/g, participantName)
      .replace(/\{\{EVENT_NAME\}\}/g, event.title)
      .replace(/\{\{CURRENT_DATE\}\}/g, formattedDate);

    // Return the SVG wrapped in JSON so the client can render to PNG
    return new NextResponse(JSON.stringify({
      svg: svgTemplate,
      filename: `certificate-${eventId}.svg`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
