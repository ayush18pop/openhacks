import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '../../../../../src/lib/prisma';
import { requireEventJudge } from '../../../../../src/lib/auth';
import clientPromise, { Submission } from '../../../../../src/lib/mongodb';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const submissionSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  projectName: z.string().min(1, 'Project name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  githubUrl: z.string().url('Must be a valid GitHub URL').refine(
    (url) => url.includes('github.com'),
    'Must be a GitHub URL'
  ),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = submissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { teamId, projectName, description, githubUrl } = validation.data;

    // Check if user is a member of the team they're submitting for
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        eventId: eventId,
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } }
        ]
      },
      include: {
        members: true,
        owner: true
      }
    });

    if (!team) {
      return NextResponse.json({ 
        error: 'Unauthorized: You are not a member of this team or team not found' 
      }, { status: 403 });
    }

    // Connect to MongoDB and check if submission already exists
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB || 'openhacks');
    const submissionsCollection = db.collection<Submission>('submissions');

    const existingSubmission = await submissionsCollection.findOne({
      eventId: eventId,
      teamId: teamId
    });

    if (existingSubmission) {
      return NextResponse.json({ 
        error: 'Submission already exists for this team' 
      }, { status: 409 });
    }

    // Create new submission
    const now = new Date();
    const submission: Omit<Submission, '_id'> = {
      projectName,
      description,
      githubUrl,
      eventId,
      teamId,
      createdAt: now,
      updatedAt: now
    };

    const result = await submissionsCollection.insertOne(submission);

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: result.insertedId.toString(),
        ...submission 
      } 
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ 
      error: 'Failed to create submission' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const isJudge = searchParams.get('judge') === 'true';

    // Connect to MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB || 'openhacks');
    const submissionsCollection = db.collection<Submission>('submissions');

    // If it's a judge request, return all submissions for the event
    if (isJudge) {
      // Verify user is authorized as a judge for this event
      const authResult = await requireEventJudge(eventId);
      if (!authResult) {
        return NextResponse.json({ 
          error: 'Unauthorized: You are not a judge for this event' 
        }, { status: 403 });
      }

      // Get all submissions for this event with team information
      const submissions = await submissionsCollection.find({
        eventId: eventId
      }).toArray();

      // Get team information for each submission
      const teamIds = submissions.map(s => s.teamId);
      const teams = await prisma.team.findMany({
        where: {
          id: { in: teamIds }
        },
        include: {
          owner: { select: { id: true, name: true } },
          members: { select: { id: true, name: true } }
        }
      });

      // Combine submission and team data
      const submissionsWithTeams = submissions.map(submission => {
        const team = teams.find(t => t.id === submission.teamId);
        return {
          id: submission._id?.toString(),
          projectName: submission.projectName,
          description: submission.description,
          githubUrl: submission.githubUrl,
          eventId: submission.eventId,
          teamId: submission.teamId,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
          team: team ? {
            id: team.id,
            name: team.name,
            owner: team.owner,
            members: team.members
          } : null
        };
      });

      return NextResponse.json({ 
        success: true, 
        data: submissionsWithTeams 
      });
    }

    // Standard team-specific submission query
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const submission = await submissionsCollection.findOne({
      eventId: eventId,
      teamId: teamId
    });

    if (!submission) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: submission._id?.toString(),
        projectName: submission.projectName,
        description: submission.description,
        githubUrl: submission.githubUrl,
        eventId: submission.eventId,
        teamId: submission.teamId,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch submission' 
    }, { status: 500 });
  }
}
