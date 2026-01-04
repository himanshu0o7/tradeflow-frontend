'use client';

import { useEffect, useState } from "react";

type OptionLeg = {
  last_price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  implied_volatility: number;
};

type OptionChain = {
  [strike: string]: {
    ce?: OptionLeg;
    pe?: OptionLeg;
  };
};

export default function Home() {
  const [data, setData] = useState<OptionChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/option-chain?symbol=BANKNIFTY&expiry=2026-01-27", {
      cache: "no-store",
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(json.oc || {});
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load option chain");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>📊 TradeFlow — BANKNIFTY Option Chain</h1>

      {loading && <p>⏳ Loading option chain…</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {data && (
        <table border={1} cellPadding={6} style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th>Strike</th>
              <th>CE LTP</th>
              <th>CE Δ</th>
              <th>PE LTP</th>
              <th>PE Δ</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([strike, legs]) => (
              <tr key={strike}>
                <td>{strike}</td>
                <td>{legs.ce?.last_price ?? "-"}</td>
                <td>{legs.ce?.delta?.toFixed(2) ?? "-"}</td>
                <td>{legs.pe?.last_price ?? "-"}</td>
                <td>{legs.pe?.delta?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}