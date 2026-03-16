import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { attemptStartSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = attemptStartSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const { testId, studentName } = parsed.data;

    const test = await prisma.quizTest.findUnique({ where: { id: testId }, select: { isPublished: true } });
    if (!test || !test.isPublished) {
      return NextResponse.json({ error: "Test is not available" }, { status: 404 });
    }

    const attempt = await prisma.attempt.create({
      data: {
        testId,
        studentName,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ attemptId: attempt.id });
  } catch {
    return NextResponse.json({ error: "Failed to start attempt" }, { status: 500 });
  }
}
