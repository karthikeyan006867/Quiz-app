import Link from "next/link";
import { notFound } from "next/navigation";

import { TestModePicker } from "@/components/TestModePicker";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const test = await prisma.quizTest.findFirst({
    where: {
      id,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      durationMinutes: true,
      teacher: {
        select: {
          name: true,
          subject: true,
        },
      },
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          prompt: true,
          options: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  if (!test) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <TestModePicker
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
      <div className="mx-auto mt-6 max-w-4xl">
        <Link href="/" className="text-sm font-semibold text-indigo-700">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
