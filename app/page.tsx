'use client';

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type Risk = {
  capital: number;
  lot_size: number;
  quantity: number;
  stoploss_points: number | null;
  risk_pct: number;
};

type SignalResponse = {
  meta: {
    symbol: string;
    expiry: string;
    timestamp: string;
  };
  signal: {
    action: string;
    confidence: string;
    why: string;
  };
  risk?: Risk;
};

/* ================= COMPONENT ================= */

export default function Home() {
  const [data, setData] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [paperMsg, setPaperMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH SIGNAL ================= */

  const fetchSignal = () => {
    setLoading(true);
    setError(null);

    fetch("/api/signal?symbol=BANKNIFTY&expiry=2026-01-27", {
      cache: "no-store",
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Failed to fetch signal"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSignal();
  }, []);

  /* ================= PAPER TRADE ================= */

  const paperTrade = async () => {
    if (!data) return;

    setPaperMsg("Placing paper trade…");

    const res = await fetch("/api/paper-trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: data.meta.symbol,
        expiry: data.meta.expiry,
        action: data.signal.action,
        confidence: data.signal.confidence,
        reason: data.signal.why,
      }),
    });

    const json = await res.json();
    setPaperMsg(json.status === "ok" ? "✅ Paper trade placed" : "❌ Failed");
  };

  /* ================= STATES ================= */

  if (loading) {
    return <main style={{ padding: 20 }}>⏳ Loading signal…</main>;
  }

  if (error) {
    return <main style={{ padding: 20, color: "red" }}>❌ {error}</main>;
  }

  if (!data) {
    return <main style={{ padding: 20 }}>No data</main>;
  }

  const r = data.risk;

  /* ================= RISK CALCULATIONS ================= */

  let maxAllowedLoss = 0;
  let actualLoss = 0;
  let targetPoints: number | null = null;
  let rrRatio: string | number = "-";
  let riskExceeded = false;

  if (r && r.stoploss_points && r.quantity) {
    maxAllowedLoss = r.capital * (r.risk_pct / 100);
    actualLoss = r.stoploss_points * r.quantity;
    targetPoints = r.stoploss_points * 2; // default 1:2 RR
    rrRatio = (targetPoints / r.stoploss_points).toFixed(2);
    riskExceeded = actualLoss > maxAllowedLoss;
  }

  /* ================= UI ================= */

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>📈 TradeFlow Signal</h1>

      {/* SIGNAL BOX */}
      <div
        style={{
          padding: 14,
          borderRadius: 10,
          background:
            data.signal.action === "BUY_CE"
              ? "#e6fff0"
              : data.signal.action === "BUY_PE"
              ? "#ffecec"
              : "#f5f5f5",
          marginBottom: 12,
        }}
      >
        <h2>{data.signal.action}</h2>
        <p>{data.signal.why}</p>
      </div>

      {/* NO TRADE CASE */}
      {!r && (
        <p style={{ color: "#666" }}>
          ℹ No trade conditions met. Waiting for alignment.
        </p>
      )}

      {/* 🛡️ RISK BOX */}
      {r && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            border: "2px solid",
            borderColor: riskExceeded ? "red" : "black",
            background: riskExceeded ? "#ffecec" : "#fafafa",
          }}
        >
          <h3>🛡️ Risk Management</h3>

          <table>
            <tbody>
              <tr><td>Capital</td><td>₹{r.capital}</td></tr>
              <tr><td>Lot Size</td><td>{r.lot_size}</td></tr>
              <tr><td>Quantity</td><td>{r.quantity}</td></tr>
              <tr><td>Stoploss</td><td>{r.stoploss_points} pts</td></tr>
              <tr><td>Target</td><td>{targetPoints} pts</td></tr>
              <tr>
                <td><b>RR Ratio</b></td>
                <td><b>{rrRatio}</b></td>
              </tr>
              <tr>
                <td>Max Allowed Loss</td>
                <td>₹{maxAllowedLoss}</td>
              </tr>
              <tr>
                <td><b>Actual Loss</b></td>
                <td><b>₹{actualLoss}</b></td>
              </tr>
            </tbody>
          </table>

          {riskExceeded && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              ⚠ Risk exceeds allowed limit — trade blocked
            </p>
          )}

          {/* ▶ PAPER TRADE */}
          <button
            disabled={riskExceeded}
            onClick={paperTrade}
            style={{
              marginTop: 12,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #000",
              background: riskExceeded ? "#ccc" : "#000",
              color: "#fff",
              cursor: riskExceeded ? "not-allowed" : "pointer",
            }}
          >
            ▶ Paper Trade
          </button>

          {paperMsg && <p>{paperMsg}</p>}
        </div>
      )}
    </main>
  );
}