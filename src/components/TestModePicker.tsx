"use client";

import { useState } from "react";

import { QuizRunner } from "./QuizRunner";

type TestModePickerProps = {
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
      options: { id: string; text: string }[];
    }[];
  };
};

export function TestModePicker({ test }: TestModePickerProps) {
  const [individual, setIndividual] = useState(false);

  if (individual) {
    return <QuizRunner test={test} />;
  }

  return (
    <section className="card mx-auto w-full max-w-3xl space-y-6 p-8">
      <div className="space-y-2 text-center">
        <span className="badge mx-auto">{test.subject}</span>
        <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
        <p className="text-sm text-slate-500">
          {test.teacherName} &bull; {test.durationMinutes} mins &bull; {test.questions.length} questions
        </p>
        {test.description ? (
          <p className="text-sm text-slate-600">{test.description}</p>
        ) : null}
      </div>

      <p className="text-center text-sm font-semibold text-slate-700">Choose how to attend this test:</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setIndividual(true)}
          className="flex flex-col items-start gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6 text-left transition hover:border-indigo-400 hover:bg-indigo-100"
        >
          <span className="text-3xl">🧑‍💻</span>
          <div>
            <p className="font-bold text-indigo-900">Individual Mode</p>
            <p className="mt-1 text-xs text-indigo-700">
              Each student takes the test on their own device and receives a personal score.
            </p>
          </div>
        </button>

        <a
          href={`/test/${test.id}/board`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-start gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-left transition hover:border-emerald-400 hover:bg-emerald-100"
        >
          <span className="text-3xl">📺</span>
          <div>
            <p className="font-bold text-emerald-900">Class Board Mode</p>
            <p className="mt-1 text-xs text-emerald-700">
              Display on a projector or smart board. Teacher leads the whole class through each question together.
            </p>
          </div>
        </a>
      </div>
    </section>
  );
}
