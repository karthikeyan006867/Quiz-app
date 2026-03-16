"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteTestButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    if (!confirm("Delete this test? This cannot be undone.")) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tests/${testId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to delete test");
      }
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
