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
    market_open: boolean;
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
  const [error, setError] = useState<string | null>(null);

  const fetchSignal = () => {
    setLoading(true);
    fetch("/api/signal?symbol=BANKNIFTY&expiry=2026-01-27", {
      cache: "no-store",
    })
      .then(res => {
        if (!res.ok) throw new Error("Signal fetch failed");
        return res.json();
      })
      .then(json => {
        setData(json);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Unable to fetch signal");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSignal();
  }, []);

  const maxLoss =
    data?.risk && data.risk.stoploss_points
      ? data.risk.stoploss_points * data.risk.quantity
      : 0;

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>📈 TradeFlow Signal</h1>

      <button
        onClick={fetchSignal}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #333",
          marginBottom: 12,
        }}
      >
        🔄 Refresh Signal
      </button>

      {loading && <p>⏳ Loading…</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {data && (
        <>
          {/* SIGNAL BOX */}
          <div
            style={{
              padding: 16,
              borderRadius: 10,
              border: "1px solid #ccc",
              marginBottom: 12,
              background:
                data.signal.action === "BUY_CE"
                  ? "#e6fff0"
                  : data.signal.action === "BUY_PE"
                  ? "#ffecec"
                  : "#f5f5f5",
            }}
          >
            <h2>
              Signal: <b>{data.signal.action}</b>
            </h2>
            <p>
              Confidence: <b>{data.signal.confidence}</b>
            </p>
            <p>{data.signal.why}</p>
          </div>

          {/* 🛡️ RISK BOX */}
          {data.risk && (
            <div
              style={{
                padding: 16,
                borderRadius: 10,
                border: "1px solid #000",
                background: "#fafafa",
              }}
            >
              <h3>🛡️ Risk Management</h3>

              <table style={{ fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td>Capital</td>
                    <td>₹{data.risk.capital}</td>
                  </tr>
                  <tr>
                    <td>Lot Size</td>
                    <td>{data.risk.lot_size}</td>
                  </tr>
                  <tr>
                    <td>Quantity</td>
                    <td>{data.risk.quantity}</td>
                  </tr>
                  <tr>
                    <td>Stop-Loss</td>
                    <td>{data.risk.stoploss_points ?? "-"} pts</td>
                  </tr>
                  <tr>
                    <td>Risk %</td>
                    <td>{data.risk.risk_pct}%</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Max Loss</b>
                    </td>
                    <td>
                      <b>₹{maxLoss}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}