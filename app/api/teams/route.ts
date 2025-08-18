import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const team = await prisma.team.create({
    data: {
      name: data.name,
      eventId: data.eventId,
      ownerId: user.id,
      members: { connect: [{ id: user.id }] },
    },
    include: { members: true },
  });
  return NextResponse.json({ team }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const team = await prisma.team.update({
    where: { id: data.teamId },
    data: {
      members: { connect: [{ id: data.userId }] },
    },
    include: { members: true },
  });
  return NextResponse.json({ team });
}
