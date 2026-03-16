import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getTeacherFromSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { testCreateSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = testCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const teacher = await getTeacherFromSessionToken(token);

    if (!teacher || teacher.slug !== parsed.data.slug) {
      return NextResponse.json({ error: "Unauthorized teacher session" }, { status: 401 });
    }

    const { title, description, durationMinutes, questions } = parsed.data;

    const test = await prisma.quizTest.create({
      data: {
        teacherId: teacher.id,
        title,
        description: description || null,
        durationMinutes,
        isPublished: false,
        questions: {
          create: questions.map((question, questionIndex) => ({
            prompt: question.prompt,
            order: questionIndex,
            options: {
              create: question.options.map((option, optionIndex) => ({
                text: option,
                isCorrect: optionIndex === question.correctIndex,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: test.id });
  } catch {
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}
