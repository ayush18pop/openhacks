import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"; // assuming Clerk auth

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: body.role,
        // if you want, add metadata JSON to schema for answers
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
