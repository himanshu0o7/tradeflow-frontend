'use client';

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service?: string;
  time: string;
};

export default function Home() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json: HealthResponse) => {
        setData(json);
        setError(null);
      })
      .catch((err: any) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setError(err.message || "Failed to fetch backend");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>🚀 TradeFlow</h1>

      {loading && <p>⏳ Connecting to backend…</p>}

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ❌ {error}
        </p>
      )}

      {data && (
        <>
          <p style={{ color: "green" }}>✅ Backend Connected</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </main>
  );
}