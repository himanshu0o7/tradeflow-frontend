// lib/ws.ts

type WSDataHandler = (data: any) => void;

export function connectMarketWS(
  symbol: string,
  onData: WSDataHandler
) {
  const RAW_BASE =
    process.env.NEXT_PUBLIC_WS_BASE || "wss://api.kp5bot.com";

  // Enforce wss:// for browser safety
  const WS_BASE = RAW_BASE.replace(/^http/, "ws");

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let manuallyClosed = false;
  let reconnectAttempts = 0;

  const MAX_RECONNECT_DELAY = 15000;

  const connect = () => {
    if (manuallyClosed) return;

    try {
      ws = new WebSocket(`${WS_BASE}/ws/market/${symbol}`);

      ws.onopen = () => {
        reconnectAttempts = 0;
        console.log(`✅ WS connected [${symbol}]`);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onData(parsed);
        } catch (err) {
          console.error("❌ WS JSON parse error", err);
        }
      };

      ws.onerror = (err) => {
        console.error(`❌ WS error [${symbol}]`, err);
      };

      ws.onclose = () => {
        if (manuallyClosed) return;

        const delay = Math.min(
          3000 + reconnectAttempts * 2000,
          MAX_RECONNECT_DELAY
        );

        reconnectAttempts++;

        console.warn(
          `⚠️ WS closed [${symbol}] – reconnecting in ${delay}ms`
        );

        reconnectTimer = setTimeout(connect, delay);
      };
    } catch (err) {
      console.error("❌ WS init failed", err);
    }
  };

  // Visibility handling (VERY important for mobile)
  const handleVisibility = () => {
    if (document.visibilityState === "visible" && !manuallyClosed) {
      if (!ws || ws.readyState === WebSocket.CLOSED) {
        console.log("🔄 WS reconnect after tab visible");
        connect();
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  connect();

  return {
    close: () => {
      manuallyClosed = true;

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }

      ws = null;
    },
  };
}