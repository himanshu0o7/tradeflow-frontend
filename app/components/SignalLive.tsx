"use client";

import { useEffect, useState } from "react";
import { fetchSignal } from "../lib/api";
import SignalCard from "./SignalCard";
import type { Signal } from "../lib/types";

export default function SignalLive() {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSignal() {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchSignal("BANKNIFTY", "2026-01-27");
      setSignal(data.signal);
    } catch (err) {
      console.error(err);
      setError("Signal service unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSignal();

    const hour = new Date().getHours();
    const intervalMs = hour >= 9 && hour < 15 ? 5000 : 30000;

    const interval = setInterval(loadSignal, intervalMs);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      {loading && <p className="text-sm opacity-60">Loading...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {signal && <SignalCard signal={signal} />}
    </div>
  );
}