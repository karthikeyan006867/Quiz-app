"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, use, useState } from "react";

export default function TeacherLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/teacher-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Login failed");
      }

      router.push(`/teacher/${slug}/dashboard`);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-10 sm:px-6">
      <section className="card space-y-5 p-6 sm:p-8">
        <span className="badge">Teacher Login</span>
        <h1 className="text-2xl font-black">{slug}</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
              placeholder="Enter your teacher password"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </section>

      <Link href="/" className="text-sm font-semibold text-indigo-700">
        ← Back to home
      </Link>
    </main>
  );
}
