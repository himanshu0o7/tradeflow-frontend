// lib/ws.ts

type WSDataHandler = (data: any) => void;

export function connectMarketWS(
  symbol: string,
  onData: WSDataHandler
) {
  const WS_BASE =
    process.env.NEXT_PUBLIC_WS_BASE ||
    "wss://api.kp5bot.com"; // 🔴 MUST be wss

  let ws: WebSocket | null = null;
  let reconnectTimer: any = null;

  const connect = () => {
    ws = new WebSocket(`${WS_BASE}/ws/market/${symbol}`);

    ws.onopen = () => {
      console.log("✅ WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onData(parsed);
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WS error", err);
    };

    ws.onclose = () => {
      console.warn("⚠️ WS closed, reconnecting...");
      reconnectTimer = setTimeout(connect, 3000);
    };
  };

  connect();

  return {
    close: () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    },
  };
}