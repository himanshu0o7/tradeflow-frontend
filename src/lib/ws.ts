export function connectMarketWS(
  symbol: string,
  onData: (data: any) => void
) {
  const ws = new WebSocket(
    `ws://${process.env.NEXT_PUBLIC_WS_BASE}/ws/market/${symbol}`
  );

  ws.onmessage = (e) => {
    onData(JSON.parse(e.data));
  };

  ws.onerror = (err) => {
    console.error("WS error", err);
  };

  return ws;
}