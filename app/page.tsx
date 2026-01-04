'use client';

import { useEffect, useState } from "react";

type SignalResponse = {
  meta: {
    symbol: string;
    expiry: string;
    timestamp: string;
    market_open: boolean;
  };
  bias?: {
    timeframe: string;
    state: string;
    reason: string;
    allow_trade: boolean;
  };
  confirmation?: {
    timeframe: string;
    strength: string;
    checks: Record<string, boolean>;
  };
  signal: {
    action: string;
    confidence?: string;
    why?: string;
    reason?: string;
  };
};

const REFRESH_MAP: Record<string, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
};

export default function Home() {
  const [data, setData] = useState<SignalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [intervalKey, setIntervalKey] = useState<"1m" | "5m" | "15m">("1m");

  const fetchSignal = () => {
    setLoading(true);
    fetch("/api/signal?symbol=BANKNIFTY&expiry=2026-01-27", {
      cache: "no-store",
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error(err);
        setError("Failed to load signal");
      })
      .finally(() => setLoading(false));
  };

  // 🔁 AUTO REFRESH
  useEffect(() => {
    fetchSignal(); // initial fetch

    const id = setInterval(fetchSignal, REFRESH_MAP[intervalKey]);

    return () => clearInterval(id);
  }, [intervalKey]);

  const cardBg = (action?: string) =>
    action === "BUY_CE"
      ? "#e6fff0"
      : action === "BUY_PE"
      ? "#ffecec"
      : "#f4f4f4";

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>📈 TradeFlow — Auto Signal Engine</h1>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["1m", "5m", "15m"] as const).map(k => (
          <button
            key={k}
            onClick={() => setIntervalKey(k)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: intervalKey === k ? "#000" : "#fff",
              color: intervalKey === k ? "#fff" : "#000",
            }}
          >
            {k}
          </button>
        ))}
        <button
          onClick={fetchSignal}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading && <p>⏳ Updating signal…</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {data && (
        <>
          <p>
            <b>{data.meta.symbol}</b> | Expiry: {data.meta.expiry}
          </p>
          <p>
            Market Open:{" "}
            <b style={{ color: data.meta.market_open ? "green" : "red" }}>
              {data.meta.market_open ? "YES" : "NO"}
            </b>
          </p>

          <div
            style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 12,
              background: cardBg(data.signal.action),
              border: "1px solid #ddd",
            }}
          >
            <h2>Signal: {data.signal.action.replace("_", " ")}</h2>
            {data.signal.confidence && (
              <p>Confidence: <b>{data.signal.confidence}</b></p>
            )}
            <p>{data.signal.why || data.signal.reason || "—"}</p>
          </div>

          {data.bias && (
            <div style={{ marginTop: 12 }}>
              <h3>15m Bias</h3>
              <p>
                <b>{data.bias.state}</b> — {data.bias.reason}
              </p>
              <p>Allow Trade: {data.bias.allow_trade ? "YES" : "NO"}</p>
            </div>
          )}

          {data.confirmation && (
            <div style={{ marginTop: 12 }}>
              <h3>5m Confirmation</h3>
              <p>Strength: <b>{data.confirmation.strength}</b></p>
            </div>
          )}
        </>
      )}
    </main>
  );
}