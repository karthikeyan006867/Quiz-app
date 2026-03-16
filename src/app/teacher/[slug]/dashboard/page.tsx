import Link from "next/link";
import { cookies } from "next/headers";

import { CreateTestForm } from "@/components/CreateTestForm";
import { DeleteTestButton } from "@/components/DeleteTestButton";
import { LogoutButton } from "@/components/LogoutButton";
import { PublishToggle } from "@/components/PublishToggle";
import { getTeacherFromSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  const teacher = await prisma.teacher.findUnique({
    where: { id: sessionTeacher.id },
    include: {
      tests: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="badge">Teacher Dashboard</span>
            <h1 className="mt-3 text-3xl font-black">{teacher.name}</h1>
            <p className="mt-1 text-sm text-slate-600">Subject: {teacher.subject}</p>
            <p className="mt-2 text-xs text-slate-500">Teacher URL: /teacher/{teacher.slug}/login</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <LogoutButton slug={teacher.slug} />
            <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-center">
              <p className="text-xs text-indigo-700">Total Tests</p>
              <p className="text-xl font-bold text-indigo-900">{teacher.tests.length}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-xs text-emerald-700">Published</p>
              <p className="text-xl font-bold text-emerald-900">
                {teacher.tests.filter((test) => test.isPublished).length}
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>

      <CreateTestForm slug={teacher.slug} />

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Your Tests</h2>
        {teacher.tests.length === 0 ? (
          <div className="card p-6 text-sm text-slate-600">No tests yet. Create your first test above.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teacher.tests.map((test) => (
              <article key={test.id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className={`badge ${test.isPublished ? "bg-emerald-100 text-emerald-700" : ""}`}>
                    {test.isPublished ? "Published" : "Draft"}
                  </span>
                  <PublishToggle testId={test.id} published={test.isPublished} />
                </div>

                <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                <p className="text-sm text-slate-600">{test.description ?? "No description provided"}</p>

                <p className="text-xs text-slate-500">
                  {test._count.questions} questions • {test.durationMinutes} mins • {test._count.attempts} attempts
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {test.isPublished ? (
                    <Link
                      href={`/test/${test.id}`}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      Open Student View
                    </Link>
                  ) : null}
                  <Link
                    href={`/teacher/${teacher.slug}/tests/${test.id}/attempts`}
                    className="rounded-xl border border-indigo-200 px-4 py-2 text-center text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    View Results
                  </Link>
                  <DeleteTestButton testId={test.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link href="/" className="text-sm font-semibold text-indigo-700">
        ← Back to home
      </Link>
    </main>
  );
}
