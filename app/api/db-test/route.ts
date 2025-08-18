import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getMongoDb } from "@/src/lib/mongo";

type Check = { ok: boolean; [key: string]: unknown };
type Result = { ok: boolean; checks: { prisma?: Check; mongo?: Check } };

export async function GET() {
  const result: Result = { ok: true, checks: {} };
  try {
    const ping = await prisma.$queryRawUnsafe("SELECT 1 AS ok");
    // Convert BigInt values to numbers for JSON serialization
    const serializedPing = JSON.parse(JSON.stringify(ping, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    result.checks.prisma = { ok: true, ping: serializedPing };
  } catch (err) {
    result.ok = false;
    result.checks.prisma = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // Check MongoDB
  try {
    const db = await getMongoDb();
    const collections = await db.listCollections().toArray();
    result.checks.mongo = { ok: true, collections: collections.map(c => c.name) };
  } catch (err) {
    result.ok = false;
    result.checks.mongo = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const status = result.ok ? 200 : 500;
  return NextResponse.json(result, { status });
}
