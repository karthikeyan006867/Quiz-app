"use client";

import { useEffect, useMemo, useState } from "react";

type QuizRunnerProps = {
  test: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    teacherName: string;
    subject: string;
    questions: {
      id: string;
      prompt: string;
      options: {
        id: string;
        text: string;
      }[];
    }[];
  };
};

type SubmissionResult = {
  score: number;
  totalQuestions: number;
};

export function QuizRunner({ test }: QuizRunnerProps) {
  const [studentName, setStudentName] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(test.durationMinutes * 60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState("");

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  useEffect(() => {
    if (!attemptId || result) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, result]);

  useEffect(() => {
    if (attemptId && timeLeftSeconds === 0 && !result) {
      void submitQuiz();
    }
  }, [attemptId, timeLeftSeconds, result]);

  async function startQuiz() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: test.id, studentName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start test");
      }

      setAttemptId(data.attemptId);
      setTimeLeftSeconds(test.durationMinutes * 60);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Unable to start quiz");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (!attemptId) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/attempts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to submit quiz");
      }

      setResult({
        score: data.score,
        totalQuestions: data.totalQuestions,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit quiz");
    } finally {
      setLoading(false);
    }
  }

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = String(timeLeftSeconds % 60).padStart(2, "0");

  if (!attemptId) {
    return (
      <section className="card mx-auto w-full max-w-3xl space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="badge">{test.subject}</span>
          <span>Teacher: {test.teacherName}</span>
          <span>Duration: {test.durationMinutes} mins</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
        {test.description ? <p className="text-sm text-slate-600">{test.description}</p> : null}

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900">
          You can take this test without login. Just enter your name and start.
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">Student Name</span>
          <input
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
            placeholder="Enter your full name"
          />
        </label>

        <button
          type="button"
          onClick={startQuiz}
          disabled={loading || studentName.trim().length < 2}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start Test"}
        </button>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </section>
    );
  }

  if (result) {
    const percentage = Math.round((result.score / Math.max(1, result.totalQuestions)) * 100);
    return (
      <section className="card mx-auto w-full max-w-3xl space-y-4 p-8 text-center">
        <span className="badge mx-auto">Test Completed</span>
        <h2 className="text-3xl font-bold">Your Score: {result.score} / {result.totalQuestions}</h2>
        <p className="text-lg font-semibold text-indigo-700">{percentage}%</p>
        <p className="text-sm text-slate-600">Great effort. You can close this page now.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h1 className="text-lg font-bold">{test.title}</h1>
          <p className="text-sm text-slate-600">Answered {answeredCount}/{test.questions.length}</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          Time Left: {minutes}:{seconds}
        </div>
      </div>

      <div className="space-y-4">
        {test.questions.map((question, index) => (
          <div key={question.id} className="card p-5">
            <h3 className="font-semibold text-slate-900">
              {index + 1}. {question.prompt}
            </h3>
            <div className="mt-3 space-y-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: option.id,
                      }))
                    }
                    className={`w-full rounded-xl border px-4 py-2 text-left text-sm transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-slate-600">Review answers before submission.</p>
        <button
          type="button"
          onClick={() => void submitQuiz()}
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Test"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  );
}
