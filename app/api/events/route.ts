import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/auth";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "asc" },
  });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["ORGANIZER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      theme: data.theme,
  tracksJson: data.tracks ? JSON.stringify(data.tracks) : null,
      mode: data.mode ?? "online",
      rules: data.rules,
      timeline: data.timeline,
      prizes: data.prizes,
      sponsors: data.sponsors,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      createdById: user.id,
    },
  });
  return NextResponse.json({ event }, { status: 201 });
}
