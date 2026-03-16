"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PublishToggle({
  testId,
  published,
}: {
  testId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onToggle() {
    setLoading(true);
    try {
      await fetch(`/api/tests/${testId}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? "Saving..." : published ? "Unpublish" : "Publish"}
    </button>
  );
}
