"use client";
import { useEffect, useState } from "react";
import { connectMarketWS } from "@/lib/ws";

export default function SignalLive() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const ws = connectMarketWS("NIFTY", setData);
    return () => ws.close();
  }, []);

  if (!data) return <p>Waiting market feed...</p>;

  const s = data.signal;

  return (
    <div>
      <h2>{s.action}</h2>
      <p>Strike: {s.strike}</p>
      <p>Confidence: {(s.confidence * 100).toFixed(0)}%</p>
      <small>{s.reason}</small>
    </div>
  );
}