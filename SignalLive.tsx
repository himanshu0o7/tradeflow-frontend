"use client";

import { useEffect, useState } from "react";
import { connectMarketWS } from "@/lib/ws";

type SignalData = {
  signal?: {
    action: string;
    strike: number;
    confidence: number;
    reason: string;
  };
};

export default function SignalLive() {
  const [data, setData] = useState<SignalData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = connectMarketWS("NIFTY", (incoming) => {
      setConnected(true);
      setData(incoming);
    });

    return () => {
      ws.close();
    };
  }, []);

  if (!connected) return <p>🔌 Connecting to market feed...</p>;
  if (!data || !data.signal) return <p>⏳ Waiting market signal...</p>;

  const s = data.signal;

  return (
    <div
      style={{
        padding: "12px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        maxWidth: "320px",
      }}
    >
      <h2>{s.action}</h2>
      <p>Strike: <b>{s.strike}</b></p>
      <p>
        Confidence: <b>{Math.round(s.confidence * 100)}%</b>
      </p>
      <small>{s.reason}</small>
    </div>
  );
}