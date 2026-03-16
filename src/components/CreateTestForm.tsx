"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type QuestionDraft = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

const emptyQuestion = (): QuestionDraft => ({
  prompt: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

export function CreateTestForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      )
    );
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const target = questions[questionIndex];
    const options = target.options.map((option, currentIndex) =>
      currentIndex === optionIndex ? value : option
    );
    updateQuestion(questionIndex, { options });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const preparedQuestions = questions
      .map((question) => ({
        ...question,
        prompt: question.prompt.trim(),
        options: question.options.map((option) => option.trim()).filter(Boolean),
      }))
      .filter((question) => question.prompt.length > 0 && question.options.length >= 2)
      .map((question) => ({
        ...question,
        correctIndex: Math.min(question.correctIndex, question.options.length - 1),
      }));

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          description,
          durationMinutes,
          questions: preparedQuestions,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to create test");
      }

      setTitle("");
      setDescription("");
      setDurationMinutes(30);
      setQuestions([emptyQuestion()]);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Create New Test</h2>
        <p className="text-sm text-slate-600">Add title, duration, and questions. Publish after review.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Test Title</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
            placeholder="Unit 3 - Science Quiz"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Description (optional)</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-20 w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
            placeholder="Short instructions for students"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Duration (minutes)</span>
          <input
            required
            type="number"
            min={5}
            max={180}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
          />
        </label>
      </div>

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <div key={`question-${questionIndex}`} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Question {questionIndex + 1}</h3>
              {questions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setQuestions((prev) => prev.filter((_, index) => index !== questionIndex))}
                  className="text-sm font-medium text-rose-600"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <label className="mb-4 block space-y-2">
              <span className="text-sm font-medium">Question text</span>
              <input
                required
                value={question.prompt}
                onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
                placeholder="What is photosynthesis?"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <label key={`question-${questionIndex}-option-${optionIndex}`} className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Option {optionIndex + 1}</span>
                  <input
                    required
                    value={option}
                    onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium">Correct option</span>
              <select
                value={question.correctIndex}
                onChange={(event) =>
                  updateQuestion(questionIndex, { correctIndex: Number(event.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none ring-indigo-200 transition focus:ring"
              >
                {question.options.map((_, optionIndex) => (
                  <option key={`correct-${questionIndex}-${optionIndex}`} value={optionIndex}>
                    Option {optionIndex + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          + Add Question
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Test"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
