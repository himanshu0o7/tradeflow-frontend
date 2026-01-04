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
const STRIKE_BAND = 5;

const REFRESH_MS: Record<TF, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
};

export default function Home() {
  const [rows, setRows] = useState<GreekRow[]>([]);
  const [spot, setSpot] = useState<number | null>(null);
  const [tf, setTf] = useState<TF>("1m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGreeks = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      // 1️⃣ Fetch greeks
      const gRes = await fetch(
        `/api/greeks/${tf}?symbol=${SYMBOL}&expiry=${EXPIRY}`,
        { cache: "no-store", signal: controller.signal }
      );
      if (!gRes.ok) throw new Error(`Greeks HTTP ${gRes.status}`);
      const gData: GreekRow[] = await gRes.json();
      setRows(gData || []);

      // 2️⃣ Fetch spot (option chain)
      const ocRes = await fetch(
        `/api/option-chain?symbol=${SYMBOL}&expiry=${EXPIRY}`,
        { cache: "no-store", signal: controller.signal }
      );
      if (ocRes.ok) {
        const oc = await ocRes.json();
        const s =
          oc.spot ??
          oc.underlying_value ??
          oc.underlying ??
          null;
        setSpot(typeof s === "number" ? s : null);
      }

      setError(null);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
        setError("Failed to load greeks / spot");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGreeks();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(fetchGreeks, REFRESH_MS[tf]);

    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tf]);

  // 🔍 TRUE ATM LOGIC (spot-based)
  const filteredRows = (() => {
    if (rows.length === 0) return [];

    const sorted = [...rows].sort((a, b) => a.strike - b.strike);

    let atmIndex = Math.floor(sorted.length / 2); // fallback

    if (spot !== null) {
      atmIndex = sorted.reduce((best, r, i) =>
        Math.abs(r.strike - spot) <
        Math.abs(sorted[best].strike - spot)
          ? i
          : best,
        0
      );
    }

    return sorted.slice(
      Math.max(0, atmIndex - STRIKE_BAND),
      Math.min(sorted.length, atmIndex + STRIKE_BAND + 1)
    );
  })();

  // 🔢 Composite Score
  const composite = (r: GreekRow) =>
    r.delta_change * 100 +
    r.gamma_change * 1000 +
    r.iv_change * 50;

  const scoreColor = (s: number) => {
    if (s > 8) return "#b7ffda";
    if (s > 3) return "#e6fff0";
    if (s < -8) return "#ffb7b7";
    if (s < -3) return "#ffecec";
    return "#f5f5f5";
  };

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>📊 True ATM Greeks — {SYMBOL}</h1>

      <p style={{ fontSize: 13 }}>
        Expiry: <b>{EXPIRY}</b> | TF: <b>{tf}</b> | Spot:{" "}
        <b>{spot ?? "—"}</b>
      </p>

      {/* TF */}
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
      </div>

      {loading && <p>⏳ Updating…</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

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
              <th>Δ</th>
              <th>Γ</th>
              <th>IV</th>
              <th>🔥 Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(r => {
              const s = composite(r);
              return (
                <tr key={r.strike}>
                  <td><b>{r.strike}</b></td>
                  <td>{r.delta_change.toFixed(3)}</td>
                  <td>{r.gamma_change.toFixed(3)}</td>
                  <td>{r.iv_change.toFixed(3)}</td>
                  <td style={{ background: scoreColor(s), fontWeight: "bold" }}>
                    {s.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}