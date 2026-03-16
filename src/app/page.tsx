import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tests = await prisma.quizTest
    .findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          select: {
            name: true,
            subject: true,
            slug: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    })
    .catch(() => []);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <section className="card overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <span className="badge">School Quiz Platform</span>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Advanced quiz app for multiple teachers and subjects
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Students take tests without login. Teachers create separate accounts with their own password,
              manage many tests, and publish when ready.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/teacher/new"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Add Teacher
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-emerald-50 p-6">
            <h2 className="text-lg font-bold">Teacher Panel Features</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Multiple teachers with separate passwords</li>
              <li>• Each teacher can create unlimited tests</li>
              <li>• Easy question/option builder UI</li>
              <li>• Publish/unpublish per test instantly</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Available Tests</h2>
        {tests.length === 0 ? (
          <div className="card p-6 text-sm text-slate-600">
            No published tests yet. Teachers can create and publish from their dashboard.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => (
              <article key={test.id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="badge">{test.teacher.subject}</span>
                  <span className="text-xs text-slate-500">{test.durationMinutes} mins</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                <p className="text-sm text-slate-600">
                  Teacher: <span className="font-semibold">{test.teacher.name}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {test._count.questions} questions • {test._count.attempts} attempts
                </p>
                <Link
                  href={`/test/${test.id}`}
                  className="mt-auto rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Attend Test
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
