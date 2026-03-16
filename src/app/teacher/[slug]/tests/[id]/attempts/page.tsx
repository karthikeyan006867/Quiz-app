import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { getTeacherFromSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TestAttemptsPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionTeacher = await getTeacherFromSessionToken(token);

  if (!sessionTeacher || sessionTeacher.slug !== slug) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <section className="card space-y-3 p-6">
          <h1 className="text-2xl font-bold">Teacher session required</h1>
          <p className="text-sm text-slate-600">Please login with your teacher password.</p>
          <Link
            href={`/teacher/${slug}/login`}
            className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Login
          </Link>
        </section>
      </main>
    );
  }

  const test = await prisma.quizTest.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      teacherId: true,
      questions: { select: { id: true } },
      attempts: {
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          studentName: true,
          score: true,
          startedAt: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!test || test.teacherId !== sessionTeacher.id) {
    notFound();
  }

  const totalQuestions = test.questions.length;
  const submitted = test.attempts.filter((a) => a.submittedAt);
  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((sum, a) => sum + (a.score ?? 0), 0) / submitted.length)
      : null;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="badge">Attempt Results</span>
            <h1 className="mt-3 text-2xl font-black">{test.title}</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-center">
              <p className="text-xs text-indigo-700">Total Attempts</p>
              <p className="text-xl font-bold text-indigo-900">{test.attempts.length}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-xs text-emerald-700">Submitted</p>
              <p className="text-xl font-bold text-emerald-900">{submitted.length}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-center">
              <p className="text-xs text-amber-700">Avg Score</p>
              <p className="text-xl font-bold text-amber-900">
                {avgScore !== null ? `${avgScore}/${totalQuestions}` : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">All Attempts</h2>
        {test.attempts.length === 0 ? (
          <div className="card p-6 text-sm text-slate-600">No attempts yet for this test.</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {test.attempts.map((attempt) => {
                  const isSubmitted = Boolean(attempt.submittedAt);
                  const percentage =
                    isSubmitted && attempt.score !== null && totalQuestions > 0
                      ? Math.round((attempt.score / totalQuestions) * 100)
                      : null;
                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-900">{attempt.studentName}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {isSubmitted && attempt.score !== null
                          ? `${attempt.score} / ${totalQuestions}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {percentage !== null ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              percentage >= 75
                                ? "bg-emerald-100 text-emerald-700"
                                : percentage >= 50
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {percentage}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isSubmitted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isSubmitted ? "Submitted" : "In Progress"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {attempt.startedAt.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link href={`/teacher/${slug}/dashboard`} className="text-sm font-semibold text-indigo-700">
        ← Back to Dashboard
      </Link>
    </main>
  );
}
