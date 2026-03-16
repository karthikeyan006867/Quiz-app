import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { attemptSubmitSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = attemptSubmitSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const { attemptId, answers } = parsed.data;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          select: {
            questions: {
              select: {
                id: true,
                options: {
                  select: {
                    id: true,
                    isCorrect: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.submittedAt) {
      return NextResponse.json({ error: "Attempt already submitted" }, { status: 400 });
    }

    const correctOptionByQuestion = new Map<string, string>();
    for (const question of attempt.test.questions) {
      const correctOption = question.options.find((option) => option.isCorrect);
      if (correctOption) {
        correctOptionByQuestion.set(question.id, correctOption.id);
      }
    }

    const dedupedAnswers = new Map<string, string>();
    for (const answer of answers) {
      if (!dedupedAnswers.has(answer.questionId)) {
        dedupedAnswers.set(answer.questionId, answer.optionId);
      }
    }

    const createdAnswers = Array.from(dedupedAnswers.entries()).map(([questionId, optionId]) => ({
      attemptId,
      questionId,
      selectedOptionId: optionId,
      isCorrect: correctOptionByQuestion.get(questionId) === optionId,
    }));

    const validQuestionIds = new Set(attempt.test.questions.map((question) => question.id));
    const filteredAnswers = createdAnswers.filter((answer) => validQuestionIds.has(answer.questionId));

    const score = filteredAnswers.filter((answer) => answer.isCorrect).length;

    await prisma.$transaction(async (tx) => {
      if (filteredAnswers.length > 0) {
        await tx.attemptAnswer.createMany({
          data: filteredAnswers,
        });
      }

      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          score,
          submittedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      score,
      totalQuestions: attempt.test.questions.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 });
  }
}
