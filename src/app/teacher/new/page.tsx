"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function NewTeacherPage() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [password, setPassword] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCreatedSlug("");

    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create teacher");
      }

      setCreatedSlug(result.slug);
      setName("");
      setSubject("");
      setPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <section className="card space-y-5 p-6 sm:p-8">
        <h1 className="text-3xl font-black">Add Teacher</h1>
        <p className="text-sm text-slate-600">
          Create a separate teacher account with subject and password. No student login is required.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Teacher Name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
              placeholder="e.g., Ms. Priya"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Subject</span>
            <input
              required
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
              placeholder="e.g., Mathematics"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Teacher Password</span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
              placeholder="Minimum 6 characters"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Teacher"}
          </button>
        </form>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {createdSlug ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Teacher created successfully. Login URL:
            <div className="mt-2 break-all font-semibold">/teacher/{createdSlug}/login</div>
            <Link
              href={`/teacher/${createdSlug}/login`}
              className="mt-3 inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Go to Teacher Login
            </Link>
          </div>
        ) : null}
      </section>

      <Link href="/" className="text-sm font-semibold text-indigo-700">
        ← Back to home
      </Link>
    </main>
  );
}
