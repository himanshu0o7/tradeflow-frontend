'use client';

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_BASE;

    if (!API) {
      setError("API base URL not configured");
      return;
    }

    fetch(`${API}/api/health`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>TradeFlow</h1>

      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}