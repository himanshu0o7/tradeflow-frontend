'use client';

import { useEffect, useState } from "react";

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

export default function Home() {
  const [data, setData] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [paperMsg, setPaperMsg] = useState<string | null>(null);

  const fetchSignal = () => {
    setLoading(true);
    fetch("/api/signal?symbol=BANKNIFTY&expiry=2026-01-27", {
      cache: "no-store",
    })
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSignal();
  }, []);

  const paperTrade = async () => {
    setPaperMsg("Placing paper trade…");
    const res = await fetch("/api/paper-trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setPaperMsg(json.status || "Paper trade placed");
  };

  if (!data || !data.risk) return <main>Loading…</main>;

  const r = data.risk;

  const maxAllowedLoss = r.capital * (r.risk_pct / 100);
  const actualLoss =
    r.stoploss_points && r.quantity
      ? r.stoploss_points * r.quantity
      : 0;

  const targetPoints = r.stoploss_points
    ? r.stoploss_points * 2
    : null;

  const rrRatio =
    r.stoploss_points && targetPoints
      ? (targetPoints / r.stoploss_points).toFixed(2)
      : "-";

  const riskExceeded = actualLoss > maxAllowedLoss;

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>📈 TradeFlow Signal</h1>

      {/* SIGNAL */}
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

      {/* 🛡️ RISK BOX */}
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
          }}
        >
          ▶ Paper Trade
        </button>

        {paperMsg && <p>{paperMsg}</p>}
      </div>
    </main>
  );
}