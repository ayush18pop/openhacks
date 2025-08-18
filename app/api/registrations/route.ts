import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requireAuth } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const where: Prisma.RegistrationWhereUniqueInput = { eventId_userId: { eventId: data.eventId, userId: user.id } };
  const reg = await prisma.registration.upsert({
    where,
    update: { role: data.role ?? user.role },
    create: { userId: user.id, eventId: data.eventId, role: data.role ?? "PARTICIPANT" },
  });
  return NextResponse.json({ registration: reg }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
  const regs = await prisma.registration.findMany({ where: { eventId } });
  return NextResponse.json({ registrations: regs });
}
