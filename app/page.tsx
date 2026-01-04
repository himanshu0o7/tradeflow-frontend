'use client';

import { useEffect, useState, useRef } from "react";

type GreekRow = {
  strike: number;
  delta_change: number;
  iv_change: number;
  gamma_change: number;
};

type TF = "1m" | "5m" | "15m";

const SYMBOL = "BANKNIFTY";
const EXPIRY = "2026-01-27";
const STRIKE_BAND = 5; // ±5 strikes around ATM

export default function Home() {
  const [rows, setRows] = useState<GreekRow[]>([]);
  const [tf, setTf] = useState<TF>("1m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadGreeks = () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    fetch(`/api/greeks/${tf}?symbol=${SYMBOL}&expiry=${EXPIRY}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: GreekRow[]) => {
        setRows(data || []);
        setError(null);
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load greeks data");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGreeks();
    return () => abortRef.current?.abort();
  }, [tf]);

  // 🔍 ATM auto-detect + band
  const filteredRows = (() => {
    if (rows.length === 0) return [];

    const sorted = [...rows].sort((a, b) => a.strike - b.strike);
    const atmIndex = Math.floor(sorted.length / 2);

    return sorted.slice(
      Math.max(0, atmIndex - STRIKE_BAND),
      Math.min(sorted.length, atmIndex + STRIKE_BAND + 1)
    );
  })();

  const cellColor = (v: number) => {
    if (v > 0.05) return "#e6fff0";    // strong positive
    if (v > 0) return "#f3fff8";
    if (v < -0.05) return "#ffecec";  // strong negative
    if (v < 0) return "#fff5f5";
    return "#f5f5f5";
  };

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>🔥 Greeks Heatmap — {SYMBOL}</h1>
      <p style={{ fontSize: 13 }}>
        Expiry: <b>{EXPIRY}</b> | View: ATM ±{STRIKE_BAND}
      </p>

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

      {!loading && !error && filteredRows.length === 0 && (
        <p style={{ color: "#666" }}>
          No greeks data available.
        </p>
      )}

      {filteredRows.length > 0 && (
        <table
          border={1}
          cellPadding={8}
          style={{
            fontSize: 12,
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
          }}
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
            {filteredRows.map(r => (
              <tr key={r.strike}>
                <td><b>{r.strike}</b></td>
                <td style={{ background: cellColor(r.delta_change) }}>
                  {r.delta_change.toFixed(3)}
                </td>
                <td style={{ background: cellColor(r.iv_change) }}>
                  {r.iv_change.toFixed(3)}
                </td>
                <td style={{ background: cellColor(r.gamma_change) }}>
                  {r.gamma_change.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}