import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getTeacherFromSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { published } = (await request.json()) as { published?: boolean };

    if (typeof published !== "boolean") {
      return NextResponse.json({ error: "published is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const teacher = await getTeacherFromSessionToken(token);

    if (!teacher) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const test = await prisma.quizTest.findUnique({ where: { id }, select: { teacherId: true } });
    if (!test || test.teacherId !== teacher.id) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    await prisma.quizTest.update({
      where: { id },
      data: {
        isPublished: published,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update publish status" }, { status: 500 });
  }
}
