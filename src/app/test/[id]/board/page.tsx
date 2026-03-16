import { notFound } from "next/navigation";

import { BoardRunner } from "@/components/BoardRunner";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const test = await prisma.quizTest.findFirst({
    where: { id, isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      durationMinutes: true,
      teacher: {
        select: { name: true, subject: true },
      },
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          prompt: true,
          options: {
            select: { id: true, text: true, isCorrect: true },
          },
        },
      },
    },
  });

  if (!test) {
    notFound();
  }

  return (
    <BoardRunner
      test={{
        id: test.id,
        title: test.title,
        description: test.description,
        durationMinutes: test.durationMinutes,
        teacherName: test.teacher.name,
        subject: test.teacher.subject,
        questions: test.questions,
      }}
    />
  );
}
