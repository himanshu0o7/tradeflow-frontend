"use client";

import { useEffect, useState } from "react";
import { fetchSignal } from "../lib/api";
import SignalCard from "./SignalCard";

type Signal = {
  action: "BUY_CE" | "BUY_PE" | "HOLD";
  strike: number;
  confidence: number;
  reason: string;
};

export default function SignalLive() {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadSignal() {
    try {
      setLoading(true);
      const data = await fetchSignal("BANKNIFTY", "2026-01-27");
      setSignal(data.signal);
    } catch (err) {
      console.error("Signal fetch failed", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSignal();

    const interval = setInterval(loadSignal, 15000); // polling (Vercel safe)
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {loading && <p className="text-sm opacity-70">Loading...</p>}
      {signal && <SignalCard signal={signal} />}
    </div>
  );
}