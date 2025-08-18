import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/auth";

export async function GET(req: NextRequest) {
  const submissionId = new URL(req.url).searchParams.get("submissionId");
  if (!submissionId) return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  const scores = await prisma.score.findMany({ where: { submissionId } });
  return NextResponse.json({ scores });
}

export async function POST(req: NextRequest) {
  const judge = await requireRole(["JUDGE", "ORGANIZER"]);
  if (!judge) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const score = await prisma.score.upsert({
    where: { submissionId_roundId_judgeId: { submissionId: data.submissionId, roundId: data.roundId, judgeId: judge.id } },
    update: { score: data.score, feedback: data.feedback },
    create: { submissionId: data.submissionId, roundId: data.roundId, judgeId: judge.id, score: data.score, feedback: data.feedback },
  });
  return NextResponse.json({ score }, { status: 201 });
}
