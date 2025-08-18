import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/src/lib/mongo";
import { requireRole } from "@/src/lib/auth";

export async function GET(req: NextRequest) {
  const db = await getMongoDb();
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
  const items = await db.collection("announcements").find({ eventId }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ announcements: items });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["ORGANIZER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getMongoDb();
  const data = await req.json();
  const doc = {
    eventId: data.eventId,
    title: data.title,
    body: data.body,
    createdBy: user.id,
    createdAt: new Date(),
  };
  const res = await db.collection("announcements").insertOne(doc);
  return NextResponse.json({ id: String(res.insertedId) }, { status: 201 });
}
