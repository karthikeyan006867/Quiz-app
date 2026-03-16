import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createTeacherSession, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teacherLoginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = teacherLoginSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const { slug, password } = parsed.data;

    const teacher = await prisma.teacher.findUnique({ where: { slug } });
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const matched = await bcrypt.compare(password, teacher.passwordHash);
    if (!matched) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const session = await createTeacherSession(teacher.id);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
