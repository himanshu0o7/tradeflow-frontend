"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://164.68.119.45:8000/api/signal?symbol=BANKNIFTY&expiry=2026-01-27")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{data.meta.symbol} | {data.meta.expiry}</h2>
      <h3>Bias: {data.bias.state}</h3>
      <h3>Signal: {data.signal.action}</h3>
      <p>{data.signal.why}</p>
    </div>
  );
}
