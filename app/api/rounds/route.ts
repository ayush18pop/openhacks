import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/auth";

export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
  const rounds = await prisma.round.findMany({ where: { eventId }, orderBy: { index: "asc" } });
  return NextResponse.json({ rounds });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["ORGANIZER"]);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const round = await prisma.round.create({
    data: {
      name: data.name,
      index: data.index,
      eventId: data.eventId,
    },
  });
  return NextResponse.json({ round }, { status: 201 });
}
