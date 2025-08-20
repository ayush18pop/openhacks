import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { prisma } from '../../../src/lib/prisma';
import { requireEventJudge } from '../../../src/lib/auth';
import clientPromise, { Submission } from '../../../src/lib/mongodb';

const scoreSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  roundId: z.string().min(1, 'Round ID is required'),
  score: z.number().min(0).max(10, 'Score must be between 0 and 10'),
  feedback: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = scoreSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { submissionId, roundId, score, feedback } = validation.data;

    // Fetch the submission from MongoDB to get eventId
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB || 'openhacks');
    const submissionsCollection = db.collection<Submission>('submissions');

    const submission = await submissionsCollection.findOne({
      _id: new ObjectId(submissionId)
    });

    if (!submission) {
      return NextResponse.json({ 
        error: 'Submission not found' 
      }, { status: 404 });
    }

    // Check if user is authorized as a judge for this event
    const authResult = await requireEventJudge(submission.eventId);
    if (!authResult) {
      return NextResponse.json({ 
        error: 'Unauthorized: You are not a judge for this event' 
      }, { status: 403 });
    }

    // Check if round exists
    const round = await prisma.round.findUnique({
      where: { id: roundId }
    });

    if (!round) {
      return NextResponse.json({ 
        error: 'Round not found' 
      }, { status: 404 });
    }

    // Upsert the score using the unique constraint
    const scoreRecord = await prisma.score.upsert({
      where: {
        submissionId_roundId_judgeId: {
          submissionId: submissionId,
          roundId: roundId,
          judgeId: userId
        }
      },
      update: {
        score: score,
        feedback: feedback || null
      },
      create: {
        submissionId: submissionId,
        roundId: roundId,
        judgeId: userId,
        score: score,
        feedback: feedback || null
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: scoreRecord 
    });

  } catch (error) {
    console.error('Error creating/updating score:', error);
    return NextResponse.json({ 
      error: 'Failed to save score' 
    }, { status: 500 });
  }
}
