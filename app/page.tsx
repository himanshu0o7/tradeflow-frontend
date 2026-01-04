'use client';

import { useEffect, useState } from "react";

type GreekRow = {
  strike: number;
  delta_change: number;
  iv_change: number;
  gamma_change: number;
};

type TF = "1m" | "5m" | "15m";

export default function Home() {
  const [rows, setRows] = useState<GreekRow[]>([]);
  const [tf, setTf] = useState<TF>("1m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGreeks = () => {
    setLoading(true);
    fetch(`/api/greeks/${tf}?symbol=BANKNIFTY&expiry=2026-01-27`, {
      cache: "no-store",
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setRows)
      .catch(err => {
        console.error(err);
        setError("Failed to load greeks");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGreeks();
  }, [tf]);

  const color = (v: number) => {
    if (v > 0.05) return "#e6fff0";   // strong positive
    if (v > 0) return "#f3fff8";
    if (v < -0.05) return "#ffecec"; // strong negative
    if (v < 0) return "#fff5f5";
    return "#f5f5f5";
  };

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>🔥 Greeks Heatmap — BANKNIFTY</h1>

      {/* Timeframe Switch */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["1m", "5m", "15m"] as TF[]).map(t => (
          <button
            key={t}
            onClick={() => setTf(t)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: tf === t ? "#000" : "#fff",
              color: tf === t ? "#fff" : "#000",
            }}
          >
            {t}
          </button>
        ))}
        <button
          onClick={loadGreeks}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading && <p>⏳ Loading greeks…</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {/* Heatmap */}
      <table
        border={1}
        cellPadding={8}
        style={{ fontSize: 12, width: "100%", textAlign: "center" }}
      >
        <thead>
          <tr>
            <th>Strike</th>
            <th>Δ Delta</th>
            <th>Δ IV</th>
            <th>Δ Gamma</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.strike}>
              <td><b>{r.strike}</b></td>
              <td style={{ background: color(r.delta_change) }}>
                {r.delta_change.toFixed(3)}
              </td>
              <td style={{ background: color(r.iv_change) }}>
                {r.iv_change.toFixed(3)}
              </td>
              <td style={{ background: color(r.gamma_change) }}>
                {r.gamma_change.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}