"use client";

import { useCallback, useState } from "react";

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  prompt: string;
  options: Option[];
};

type BoardRunnerProps = {
  test: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    teacherName: string;
    subject: string;
    questions: Question[];
  };
};

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

const OPTION_COLORS = [
  "border-red-400 bg-red-600",
  "border-blue-400 bg-blue-600",
  "border-yellow-300 bg-yellow-500",
  "border-green-400 bg-green-600",
  "border-purple-400 bg-purple-600",
  "border-orange-400 bg-orange-600",
];

const OPTION_COLORS_DIM = [
  "border-red-800 bg-red-900/40 text-red-300",
  "border-blue-800 bg-blue-900/40 text-blue-300",
  "border-yellow-800 bg-yellow-900/40 text-yellow-300",
  "border-green-800 bg-green-900/40 text-green-300",
  "border-purple-800 bg-purple-900/40 text-purple-300",
  "border-orange-800 bg-orange-900/40 text-orange-300",
];

export function BoardRunner({ test }: BoardRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const total = test.questions.length;
  const question = test.questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  }, [isLast]);

  const goPrevious = useCallback(() => {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
      setRevealed(false);
    }
  }, [isFirst]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setRevealed(false);
    setFinished(false);
  }, []);

  if (finished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-8 text-center text-white">
        <div className="mb-6 text-6xl">🎉</div>
        <h2 className="text-4xl font-black sm:text-5xl">Quiz Complete!</h2>
        <p className="mt-4 text-xl text-slate-300">{test.title}</p>
        <p className="mt-3 text-lg text-slate-400">All {total} questions covered.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={restart}
            className="rounded-2xl bg-indigo-600 px-8 py-3 text-lg font-bold transition hover:bg-indigo-500"
          >
            Restart
          </button>
          <a
            href={`/test/${test.id}`}
            className="rounded-2xl border border-slate-600 px-8 py-3 text-lg font-bold text-slate-300 transition hover:bg-slate-800"
          >
            Back to Test Page
          </a>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4 sm:px-10">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-indigo-400">
            {test.subject} &bull; {test.teacherName}
          </p>
          <h1 className="truncate text-lg font-bold">{test.title}</h1>
        </div>
        <div className="shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-center">
          <p className="text-xs text-slate-400">Question</p>
          <p className="text-2xl font-black leading-none">
            {currentIndex + 1}
            <span className="text-base text-slate-500"> / {total}</span>
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
        <p className="mb-10 max-w-4xl text-center text-2xl font-bold leading-relaxed sm:text-3xl lg:text-4xl">
          {question.prompt}
        </p>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2">
          {question.options.map((option, i) => {
            const correctAndRevealed = revealed && option.isCorrect;
            const wrongAndRevealed = revealed && !option.isCorrect;

            let className =
              "flex items-center gap-4 rounded-2xl border-2 px-6 py-5 text-lg font-semibold transition";

            if (correctAndRevealed) {
              className +=
                " border-emerald-400 bg-emerald-600 text-white ring-4 ring-emerald-400/40";
            } else if (wrongAndRevealed) {
              className += ` ${OPTION_COLORS_DIM[i % OPTION_COLORS_DIM.length]}`;
            } else {
              className += ` ${OPTION_COLORS[i % OPTION_COLORS.length]} text-white`;
            }

            return (
              <div key={option.id} className={className}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/20 text-sm font-black">
                  {OPTION_LABELS[i % OPTION_LABELS.length]}
                </span>
                <span className="leading-snug">{option.text}</span>
                {correctAndRevealed ? (
                  <span className="ml-auto text-2xl">✓</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </main>

      {/* Controls */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 px-6 py-5 sm:px-10">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isFirst}
          className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-semibold transition hover:bg-slate-700 disabled:opacity-30"
        >
          ← Previous
        </button>

        <div className="flex gap-3">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-xl bg-amber-500 px-8 py-3 font-bold text-slate-950 transition hover:bg-amber-400"
            >
              🔍 Reveal Answer
            </button>
          ) : (
            <span className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">
              ✓ Answer Revealed
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500"
        >
          {isLast ? "Finish 🏁" : "Next →"}
        </button>
      </footer>
    </div>
  );
}
