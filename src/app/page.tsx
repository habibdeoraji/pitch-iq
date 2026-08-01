"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function callHello() {
    setLoading(true);
    try {
      const res = await fetch("/api/hello", { method: "POST" });
      const { data } = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">PitchIQ</h1>
      <button
        onClick={callHello}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Calling..." : "Call /api/hello"}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}
