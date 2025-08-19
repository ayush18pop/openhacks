import { NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { requireAuth } from '../../../src/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboardData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        university: true,
        // Participant Data
        registrations: {
          select: {
            event: {
              select: { id: true, title: true, startAt: true }
            }
          }
        },
        // Organizer Data
        organizedEvents: {
          select: {
            id: true,
            title: true,
            _count: { select: { registrations: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        // Judge Data
        judgedEvents: {
          select: {
            id: true,
            title: true,
            startAt: true
          },
          orderBy: { startAt: 'asc' }
        }
      }
    });

    if (!dashboardData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: dashboardData });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}