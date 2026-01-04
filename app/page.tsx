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
    timeframe?: string;
    action: string;
    confidence?: string;
    why?: string;
    reason?: string;
  };
};

export default function Home() {
  const [data, setData] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const cardStyle = (action?: string) => ({
    padding: 16,
    borderRadius: 12,
    border: "1px solid #ddd",
    background:
      action === "BUY_CE"
        ? "#e7fff1"
        : action === "BUY_PE"
        ? "#ffecec"
        : "#f5f5f5",
  });

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>📈 TradeFlow — Signal Engine</h1>

      {loading && <p>⏳ Fetching signal…</p>}
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

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <div style={cardStyle(data.signal.action)}>
              <h2>
                Signal:{" "}
                <span>
                  {data.signal.action.replace("_", " ")}
                </span>
              </h2>
              {data.signal.confidence && (
                <p>Confidence: <b>{data.signal.confidence}</b></p>
              )}
              <p>
                {data.signal.why || data.signal.reason || "—"}
              </p>
            </div>

            {data.bias && (
              <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                <h3>15m Bias</h3>
                <p>
                  <b>{data.bias.state}</b> — {data.bias.reason}
                </p>
                <p>Allow Trade: {data.bias.allow_trade ? "YES" : "NO"}</p>
              </div>
            )}

            {data.confirmation && (
              <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                <h3>5m Confirmation</h3>
                <p>Strength: <b>{data.confirmation.strength}</b></p>
                <pre style={{ fontSize: 12 }}>
                  {JSON.stringify(data.confirmation.checks, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}