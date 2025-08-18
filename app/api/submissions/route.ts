import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/src/lib/mongo";
import { requireAuth } from "@/src/lib/auth";

export async function GET(req: NextRequest) {
  const db = await getMongoDb();
  const eventId = new URL(req.url).searchParams.get("eventId");
  const filter: Record<string, string> = eventId ? { eventId } : {};
  const submissions = await db.collection("submissions").find(filter).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getMongoDb();
  const data = await req.json();
  const doc = {
    eventId: data.eventId,
    teamId: data.teamId ?? null,
    userId: user.id,
    title: data.title,
    description: data.description,
    repoUrl: data.repoUrl,
    demoUrl: data.demoUrl,
    videoUrl: data.videoUrl,
    files: data.files ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await db.collection("submissions").insertOne(doc);
  return NextResponse.json({ submissionId: String(res.insertedId) }, { status: 201 });
}
