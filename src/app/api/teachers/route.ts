import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { teacherCreateSchema } from "@/lib/validators";

async function uniqueSlugFrom(name: string, subject: string) {
  const base = slugify(`${name}-${subject}`) || "teacher";

  for (let index = 0; index < 1000; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index}`;
    const exists = await prisma.teacher.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
  }

  return `${base}-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = teacherCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const { name, subject, password } = parsed.data;
    const slug = await uniqueSlugFrom(name, subject);
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.teacher.create({
      data: {
        name,
        subject,
        slug,
        passwordHash,
      },
    });

    return NextResponse.json({ slug });
  } catch {
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}
