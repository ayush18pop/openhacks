import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

type RouteContext = {
  params: Promise<{
    id: string; // Event ID
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      // If no user is logged in, they are not registered.
      return NextResponse.json({ isRegistered: false });
    }

    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: (await context.params).id,
          userId: userId,
        },
      },
    });

    return NextResponse.json({ isRegistered: !!registration });
  } catch (error) {
    console.error('Error fetching registration status:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}